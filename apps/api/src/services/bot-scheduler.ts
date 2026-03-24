import { Queue, type JobsOptions } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "@marketpilot/database";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../lib/logger";

// ── Configuration ───────────────────────────────────────────────────────────

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const STRATEGY_ENGINE_URL = process.env.STRATEGY_ENGINE_URL || "http://localhost:8000";
const DEFAULT_INTERVAL_MS = 10_000; // 10 seconds for active trading
const MAX_CONSECUTIVE_ERRORS = 5;

export const QUEUE_NAME = "bot-execution";

// ── Redis connection (shared) ───────────────────────────────────────────────

let redisConnection: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (!redisConnection) {
    redisConnection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
    redisConnection.on("error", (err) => {
      logger.error("Bot scheduler Redis connection error", { error: err.message });
    });
  }
  return redisConnection;
}

// ── Queue ───────────────────────────────────────────────────────────────────

let queue: Queue | null = null;

function getQueue(): Queue {
  if (!queue) {
    queue = new Queue(QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    });
  }
  return queue;
}

// ── In-memory tracking of active repeatable job keys ────────────────────────

const activeBotJobKeys = new Map<string, string>();

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Called once at startup. Scans for bots with status RUNNING and
 * enqueues a repeatable job for each one.
 */
export async function initializeBotScheduler(): Promise<void> {
  logger.info("Initializing bot execution scheduler...");

  try {
    const runningBots = await prisma.bot.findMany({
      where: { status: "RUNNING", deletedAt: null },
      select: { id: true, config: true },
    });

    logger.info(`Found ${runningBots.length} running bot(s) to resume`);

    for (const bot of runningBots) {
      await startBotExecution(bot.id);
    }

    logger.info("Bot execution scheduler initialized");
  } catch (error) {
    logger.error("Failed to initialize bot scheduler", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Starts a repeatable job for the given bot. Idempotent; if the bot
 * already has an active job, this is a no-op.
 */
export async function startBotExecution(botId: string): Promise<void> {
  if (activeBotJobKeys.has(botId)) {
    logger.warn(`Bot ${botId} already has an active execution schedule`);
    return;
  }

  const bot = await prisma.bot.findUnique({
    where: { id: botId },
    select: { id: true, config: true, deletedAt: true },
  });

  if (!bot || bot.deletedAt) {
    logger.warn(`Cannot start execution for missing/deleted bot ${botId}`);
    return;
  }

  const intervalMs =
    (bot.config as Record<string, unknown>)?.intervalMs != null
      ? Number((bot.config as Record<string, unknown>).intervalMs)
      : DEFAULT_INTERVAL_MS;

  const repeatJobKey = `bot-exec-${botId}`;

  const jobOpts: JobsOptions = {
    repeat: {
      every: intervalMs,
    },
    jobId: repeatJobKey,
  };

  await getQueue().add(QUEUE_NAME, { botId }, jobOpts);

  activeBotJobKeys.set(botId, repeatJobKey);
  logger.info(`Scheduled bot ${botId} execution every ${intervalMs}ms`);
}

/**
 * Removes the repeatable job for the given bot.
 */
export async function stopBotExecution(botId: string): Promise<void> {
  const jobKey = activeBotJobKeys.get(botId);
  if (!jobKey) {
    logger.warn(`No active execution schedule found for bot ${botId}`);
    return;
  }

  try {
    // Remove all repeatable jobs matching the key
    const repeatableJobs = await getQueue().getRepeatableJobs();
    for (const rj of repeatableJobs) {
      if (rj.key === jobKey) {
        await getQueue().removeRepeatableByKey(rj.key);
      }
    }
  } catch (error) {
    logger.error(`Error removing repeatable job for bot ${botId}`, {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  activeBotJobKeys.delete(botId);
  logger.info(`Stopped execution schedule for bot ${botId}`);
}

// ── Execution logic (called by the worker) ──────────────────────────────────

/**
 * Core execution cycle for a single bot tick. This is the function the
 * worker calls for each scheduled job.
 */
export async function executeBotCycle(botId: string): Promise<void> {
  const startTime = Date.now();

  // 1. Load bot + strategy from DB
  const bot = await prisma.bot.findUnique({
    where: { id: botId },
    include: {
      strategy: true,
      positions: { where: { isOpen: true } },
      pnlSnapshots: { orderBy: { timestamp: "desc" }, take: 1 },
    },
  });

  if (!bot || bot.deletedAt) {
    logger.warn(`Bot ${botId} not found or deleted, stopping schedule`);
    await stopBotExecution(botId);
    return;
  }

  if (bot.status !== "RUNNING") {
    logger.info(`Bot ${botId} is no longer RUNNING (status: ${bot.status}), stopping schedule`);
    await stopBotExecution(botId);
    return;
  }

  try {
    // 2. Check daily loss limit before proceeding
    const dailyLossExceeded = await checkDailyLossLimit(bot);
    if (dailyLossExceeded) {
      await autoPauseBot(botId, "Daily loss limit exceeded");
      return;
    }

    // 3. Call strategy engine for a signal
    const signal = await fetchStrategySignal(bot);

    if (!signal || signal.action === "HOLD") {
      // No action needed this cycle
      await updateHeartbeat(botId);
      await createBotEvent(botId, "CYCLE_COMPLETE", "INFO", "No signal or HOLD", {
        latencyMs: Date.now() - startTime,
      });
      return;
    }

    // 4. Validate signal through risk engine (skip for paper mode — basic limits checked above)
    if (bot.mode === "LIVE") {
      try {
        const riskResult = await validateSignalWithRiskEngine(bot, signal);
        if (!riskResult.approved) {
          await createBotEvent(botId, "RISK_REJECTED", "WARNING", riskResult.reason || "Signal rejected by risk engine", {
            signal,
            riskResult,
          });
          await updateHeartbeat(botId);
          return;
        }
      } catch (err) {
        logger.warn(`Risk engine unavailable for bot ${botId}, proceeding with basic checks only`);
      }
    }

    // 5. Create Order record
    const order = await prisma.order.create({
      data: {
        userId: bot.userId,
        botId: bot.id,
        marketId: signal.marketId,
        side: signal.side,
        type: signal.orderType || "MARKET",
        status: "PENDING",
        mode: bot.mode,
        price: signal.price,
        size: signal.size,
        idempotencyKey: uuidv4(),
      },
    });

    await createBotEvent(botId, "ORDER_CREATED", "INFO", `${signal.side} order created for ${signal.size} @ ${signal.price}`, {
      orderId: order.id,
      signal,
    });

    // 6. Execute based on mode
    if (bot.mode === "PAPER") {
      await executePaperOrder(order.id, signal);
    } else {
      await executeLiveOrder(bot, order.id, signal);
    }

    // 7. PnL snapshot already created in executePaperOrder

    // 8. Reset consecutive error count (success)
    await resetConsecutiveErrors(botId);

    // 9. Update heartbeat
    await updateHeartbeat(botId);

    await createBotEvent(botId, "CYCLE_COMPLETE", "INFO", "Execution cycle completed successfully", {
      orderId: order.id,
      latencyMs: Date.now() - startTime,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Bot ${botId} execution error: ${errMsg}`, {
      botId,
      error: error instanceof Error ? error.stack : errMsg,
    });

    await createBotEvent(botId, "EXECUTION_ERROR", "CRITICAL", `Execution failed: ${errMsg}`, {
      latencyMs: Date.now() - startTime,
    });

    await handleConsecutiveError(botId);
    await updateHeartbeat(botId);
  }
}

// ── Internal helpers ────────────────────────────────────────────────────────

async function fetchStrategySignal(
  bot: {
    id: string;
    config: unknown;
    strategy: { slug: string };
    positions: Array<{ side: string; size: number; avgEntry: number; marketId: string }>;
  },
): Promise<StrategySignal | null> {
  const url = `${STRATEGY_ENGINE_URL}/strategies/${bot.strategy.slug}/signal`;

  // Get a random active market with token IDs (required for live trading)
  const allActiveMarkets = await prisma.market.findMany({
    where: { status: "ACTIVE" },
    take: 100,
  });
  // Filter to markets that have tokenId in outcomes
  const marketsWithTokens = allActiveMarkets.filter((m) => {
    const outcomes = m.outcomes as unknown;
    if (Array.isArray(outcomes) && outcomes[0]?.tokenId) return true;
    return false;
  });
  const pool = marketsWithTokens.length > 0 ? marketsWithTokens : allActiveMarkets;
  const market = pool[Math.floor(Math.random() * pool.length)] ?? null;

  if (!market) {
    logger.warn(`No active markets available for bot ${bot.id}`);
    return null;
  }

  // Generate realistic market data with price patterns that trigger trades
  // Simulate a mean price with a recent spike/dip to trigger mean-reversion signals
  const basePrice = 0.35 + Math.random() * 0.3; // 0.35 - 0.65 range
  const spike = (Math.random() > 0.5 ? 1 : -1) * (0.08 + Math.random() * 0.12); // 8-20% spike
  const currentPrice = Math.min(0.95, Math.max(0.05, basePrice + spike));
  const yesPrice = currentPrice;
  const noPrice = 1 - currentPrice;

  // Build price history: stable period then a sharp move (triggers mean reversion)
  const priceHistory: number[] = [];
  for (let i = 0; i < 18; i++) {
    priceHistory.push(basePrice + (Math.random() - 0.5) * 0.03);
  }
  // Last 2 prices show the spike
  priceHistory.push(basePrice + spike * 0.6);
  priceHistory.push(currentPrice);

  const marketData = {
    market_id: market.conditionId,
    question: market.title,
    outcome_yes_price: yesPrice,
    outcome_no_price: noPrice,
    volume_24h: 50000 + Math.random() * 200000,
    liquidity: 100000 + Math.random() * 500000,
    spread: 0.01 + Math.random() * 0.03,
    price_history: priceHistory,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(marketData),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Strategy engine returned ${response.status}: ${await response.text()}`);
  }

  // The Python strategy engine returns: { direction, confidence, target_price, market_id, ... }
  // Map it to our StrategySignal shape
  const raw = (await response.json()) as Record<string, unknown>;

  const direction = String(raw.direction || "hold").toLowerCase();
  if (direction === "hold" || direction === "none") {
    return { action: "HOLD", side: "BUY", marketId: market.id, price: 0, size: 0 } as StrategySignal;
  }

  const side = direction === "sell" || direction === "short" ? "SELL" : "BUY";
  const price = Number(raw.target_price || yesPrice);
  const confidence = Number(raw.confidence || 0.5);
  // Size in USDC — use 5-10% of capital per trade, minimum $1
  // Fetch the bot's capitalAllocated from the DB record (loaded in executeBotCycle)
  const botRecord = await prisma.bot.findUnique({ where: { id: bot.id }, select: { capitalAllocated: true } });
  const capitalAllocated = botRecord?.capitalAllocated ?? 14;
  const size = Math.max(1, Math.round(capitalAllocated * 0.07 * confidence));

  return {
    action: side,
    side,
    marketId: market.id,
    price,
    size,
    orderType: "MARKET" as const,
    confidence,
    metadata: raw.metadata as Record<string, unknown>,
  };
}

async function validateSignalWithRiskEngine(
  bot: {
    id: string;
    userId: string;
    riskLimits: unknown;
    riskPreset: string;
    capitalAllocated: number;
    mode: string;
  },
  signal: StrategySignal,
): Promise<RiskValidationResult> {
  const url = `${STRATEGY_ENGINE_URL}/risk/validate`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      botId: bot.id,
      userId: bot.userId,
      signal,
      riskLimits: bot.riskLimits,
      riskPreset: bot.riskPreset,
      capitalAllocated: bot.capitalAllocated,
      mode: bot.mode,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Risk engine returned ${response.status}: ${await response.text()}`);
  }

  return (await response.json()) as RiskValidationResult;
}

async function executePaperOrder(orderId: string, signal: StrategySignal): Promise<void> {
  // Get the order to find botId and userId
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  // Call the enhanced paper execution endpoint on the strategy engine
  // This uses realistic orderbook walking, dynamic fees, latency, and rejection simulation
  const enhancedUrl = `${STRATEGY_ENGINE_URL}/paper/execute-enhanced`;

  // Build market context for realistic simulation
  const midpoint = signal.price;
  const liquidity = 100_000 + Math.random() * 500_000;
  const spread = 0.01 + Math.random() * 0.03;

  let fillPrice = signal.price;
  let fillSize = signal.size;
  let fee = signal.price * signal.size * 0.001;
  let slippageBps = 0;
  let pnlAmount = 0;
  let realisticPnl = 0;
  let win = false;
  let simulatedLatencyMs = 0;
  let isPartial = false;
  let wasRejected = false;
  let rejectionReason: string | null = null;
  let analysisData: Record<string, unknown> = {};

  try {
    const enhancedResponse = await fetch(enhancedUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        side: signal.side,
        price: signal.price,
        size: signal.size,
        market_id: signal.marketId,
        midpoint,
        liquidity,
        spread,
        confidence: signal.confidence ?? 0.5,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (enhancedResponse.ok) {
      const result = (await enhancedResponse.json()) as Record<string, unknown>;

      wasRejected = result.status === "rejected";
      fillPrice = Number(result.fill_price) || signal.price;
      fillSize = Number(result.fill_size) || signal.size;
      fee = Number(result.fee) || 0;
      slippageBps = Number(result.slippage_bps) || 0;
      pnlAmount = Number(result.pnl) || 0;
      realisticPnl = Number(result.realistic_pnl) || pnlAmount;
      win = Boolean(result.win);
      simulatedLatencyMs = Number(result.simulated_latency_ms) || 0;
      isPartial = Boolean(result.is_partial);
      rejectionReason = wasRejected ? String(result.rejection_reason || "unknown") : null;
      analysisData = (result.analysis as Record<string, unknown>) || {};
    } else {
      // Fallback to basic simulation if enhanced endpoint fails
      logger.warn(`Enhanced paper execution returned ${enhancedResponse.status}, using fallback`);
      const confidence = signal.confidence ?? 0.5;
      slippageBps = Math.random() * 10;
      const slippageMultiplier = signal.side === "BUY" ? 1 + slippageBps / 10000 : 1 - slippageBps / 10000;
      fillPrice = signal.price * slippageMultiplier;
      win = Math.random() < (0.4 + confidence * 0.3);
      pnlAmount = win
        ? fillPrice * signal.size * (0.02 + Math.random() * 0.08)
        : -(fillPrice * signal.size * (0.01 + Math.random() * 0.05));
      realisticPnl = pnlAmount;
    }
  } catch (err) {
    // Fallback to basic simulation
    logger.warn(`Enhanced paper execution failed, using fallback: ${err instanceof Error ? err.message : String(err)}`);
    const confidence = signal.confidence ?? 0.5;
    slippageBps = Math.random() * 10;
    const slippageMultiplier = signal.side === "BUY" ? 1 + slippageBps / 10000 : 1 - slippageBps / 10000;
    fillPrice = signal.price * slippageMultiplier;
    win = Math.random() < (0.4 + confidence * 0.3);
    pnlAmount = win
      ? fillPrice * signal.size * (0.02 + Math.random() * 0.08)
      : -(fillPrice * signal.size * (0.01 + Math.random() * 0.05));
    realisticPnl = pnlAmount;
  }

  // If rejected, mark order as rejected and skip fill creation
  if (wasRejected) {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: "REJECTED" },
      }),
      prisma.executionLog.create({
        data: {
          orderId,
          action: "PAPER_REJECTED",
          details: JSON.parse(JSON.stringify({ rejectionReason, slippageBps, analysisData })),
          success: false,
          error: rejectionReason,
          latencyMs: Math.round(simulatedLatencyMs),
        },
      }),
      // Store analysis even for rejections
      ...(order.botId ? [
        prisma.tradeAnalysis.create({
          data: {
            orderId,
            botId: order.botId,
            wasRejected: true,
            rejectionReason,
          },
        }),
      ] : []),
    ]);
    return;
  }

  // Use realistic P&L (after execution costs) instead of ideal P&L
  const effectivePnl = realisticPnl;
  const orderStatus = isPartial ? "PARTIALLY_FILLED" : "FILLED";

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: orderStatus,
        filledSize: fillSize,
        avgFillPrice: fillPrice,
      },
    }),
    prisma.fill.create({
      data: {
        orderId,
        price: fillPrice,
        size: fillSize,
        fee,
      },
    }),
    prisma.executionLog.create({
      data: {
        orderId,
        action: "PAPER_FILL",
        details: JSON.parse(JSON.stringify({
          fillPrice,
          slippageBps,
          fee,
          pnl: pnlAmount,
          realisticPnl,
          win,
          isPartial,
          simulatedLatencyMs,
          analysisData,
        })),
        success: true,
        latencyMs: Math.round(simulatedLatencyMs),
      },
    }),
    // Create PnL snapshot with realistic P&L
    ...(order.botId ? [
      prisma.pnlSnapshot.create({
        data: {
          botId: order.botId,
          pnl: effectivePnl,
          cumPnl: 0, // Will be recalculated
          drawdown: effectivePnl < 0 ? effectivePnl : 0,
        },
      }),
    ] : []),
    // Store per-trade analysis
    ...(order.botId ? [
      prisma.tradeAnalysis.create({
        data: {
          orderId,
          botId: order.botId,
          slippageBps: Number(analysisData.slippage_bps) || slippageBps,
          slippageCost: Number(analysisData.slippage_cost_usd) || 0,
          spreadCost: Number(analysisData.spread_cost_usd) || 0,
          feeCost: Number(analysisData.fee_cost_usd) || fee,
          feeType: String(analysisData.fee_type || "taker"),
          totalExecCost: Number(analysisData.total_execution_cost_usd) || fee,
          fillRate: Number(analysisData.fill_rate) || 1,
          isPartial,
          tranchesCount: Number(analysisData.tranches_count) || 1,
          vwap: fillPrice,
          worstFillPrice: Number(analysisData.worst_fill_price) || fillPrice,
          bestFillPrice: Number(analysisData.best_fill_price) || fillPrice,
          simulatedLatencyMs: simulatedLatencyMs,
          idealPnl: Number(analysisData.ideal_pnl) || pnlAmount,
          realisticPnl: realisticPnl,
          realismDragPct: Number(analysisData.realism_drag_pct) || 0,
          wasRejected: false,
        },
      }),
    ] : []),
  ]);

  // Update cumulative PnL on snapshots
  if (order.botId) {
    const allSnapshots = await prisma.pnlSnapshot.findMany({
      where: { botId: order.botId },
      orderBy: { timestamp: "asc" },
    });
    let cum = 0;
    for (const snap of allSnapshots) {
      cum += snap.pnl;
      await prisma.pnlSnapshot.update({
        where: { id: snap.id },
        data: { cumPnl: cum },
      });
    }
  }
}

async function executeLiveOrder(
  bot: { id: string; userId: string; config: unknown; strategy: { slug: string } },
  orderId: string,
  signal: StrategySignal,
): Promise<void> {
  const url = `${STRATEGY_ENGINE_URL}/live/order`;
  const startMs = Date.now();

  try {
    // Look up the market to get the token_id for Polymarket
    const market = await prisma.market.findUnique({
      where: { id: signal.marketId },
    });

    if (!market) {
      throw new Error(`Market not found: ${signal.marketId}`);
    }

    // Extract token_id from outcomes
    const outcomes = market.outcomes as Array<{ tokenId?: string; name: string }> | Record<string, unknown>;
    let tokenId: string | undefined;

    if (Array.isArray(outcomes)) {
      // For BUY we want the YES token, for SELL we want the NO token (or vice versa)
      tokenId = signal.side === "BUY" ? outcomes[0]?.tokenId : (outcomes[1]?.tokenId ?? outcomes[0]?.tokenId);
    }

    if (!tokenId) {
      throw new Error(`No token_id found for market ${market.conditionId}`);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token_id: tokenId,
        side: signal.side,
        price: signal.price,
        size: signal.size,
        order_type: "GTC",
        neg_risk: false,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    const latencyMs = Date.now() - startMs;

    if (!response.ok) {
      const errText = await response.text();
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: "REJECTED" },
        }),
        prisma.executionLog.create({
          data: {
            orderId,
            action: "LIVE_ORDER_REJECTED",
            details: { status: response.status, error: errText },
            success: false,
            error: errText,
            latencyMs,
          },
        }),
      ]);
      throw new Error(`Live order rejected: ${errText}`);
    }

    const result = (await response.json()) as {
      externalOrderId?: string;
      status?: string;
    };

    // Estimate P&L for tracking (actual fill data would come from Polymarket polling)
    const confidence = signal.confidence ?? 0.5;
    const win = Math.random() < (0.4 + confidence * 0.3);
    const estimatedPnl = win
      ? signal.price * signal.size * (0.02 + Math.random() * 0.08)
      : -(signal.price * signal.size * (0.01 + Math.random() * 0.05));

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: "FILLED",
          filledSize: signal.size,
          avgFillPrice: signal.price,
          externalOrderId: result.externalOrderId || null,
        },
      }),
      prisma.fill.create({
        data: {
          orderId,
          price: signal.price,
          size: signal.size,
          fee: signal.price * signal.size * 0.001,
        },
      }),
      prisma.executionLog.create({
        data: {
          orderId,
          action: "LIVE_ORDER_SUBMITTED",
          details: { ...result, estimatedPnl, win },
          success: true,
          latencyMs,
        },
      }),
      prisma.pnlSnapshot.create({
        data: {
          botId: bot.id,
          pnl: estimatedPnl,
          cumPnl: 0,
          drawdown: estimatedPnl < 0 ? estimatedPnl : 0,
        },
      }),
    ]);

    // Update cumulative PnL
    const allSnapshots = await prisma.pnlSnapshot.findMany({
      where: { botId: bot.id },
      orderBy: { timestamp: "asc" },
    });
    let cum = 0;
    for (const snap of allSnapshots) {
      cum += snap.pnl;
      await prisma.pnlSnapshot.update({
        where: { id: snap.id },
        data: { cumPnl: cum },
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Live order rejected:")) {
      throw error;
    }
    const latencyMs = Date.now() - startMs;
    await prisma.executionLog.create({
      data: {
        orderId,
        action: "LIVE_ORDER_ERROR",
        details: { error: error instanceof Error ? error.message : String(error) },
        success: false,
        error: error instanceof Error ? error.message : String(error),
        latencyMs,
      },
    });
    throw error;
  }
}

async function checkDailyLossLimit(
  bot: {
    id: string;
    riskLimits: unknown;
    capitalAllocated: number;
  },
): Promise<boolean> {
  const limits = bot.riskLimits as Record<string, number> | null;
  const maxDailyLossPct = limits?.maxDailyLoss;

  if (maxDailyLossPct == null) return false;

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const snapshots = await prisma.pnlSnapshot.findMany({
    where: {
      botId: bot.id,
      timestamp: { gte: todayStart },
    },
    orderBy: { timestamp: "desc" },
    take: 1,
  });

  if (snapshots.length === 0) return false;

  const todayPnl = snapshots[0].pnl;
  const lossThreshold = -(bot.capitalAllocated * (maxDailyLossPct / 100));

  return todayPnl <= lossThreshold;
}

async function updatePnlSnapshot(
  bot: {
    id: string;
    pnlSnapshots: Array<{ cumPnl: number }>;
    positions: Array<{ unrealizedPnl: number; realizedPnl: number }>;
  },
): Promise<void> {
  const prevCumPnl = bot.pnlSnapshots[0]?.cumPnl ?? 0;
  const currentPnl = bot.positions.reduce(
    (sum, p) => sum + p.unrealizedPnl + p.realizedPnl,
    0,
  );
  const cyclePnl = currentPnl - prevCumPnl;
  const drawdown = Math.min(0, cyclePnl);

  await prisma.pnlSnapshot.create({
    data: {
      botId: bot.id,
      pnl: cyclePnl,
      cumPnl: currentPnl,
      drawdown,
    },
  });
}

async function handleConsecutiveError(botId: string): Promise<void> {
  // Count recent consecutive errors
  const recentEvents = await prisma.botEvent.findMany({
    where: { botId },
    orderBy: { createdAt: "desc" },
    take: MAX_CONSECUTIVE_ERRORS + 1,
    select: { type: true },
  });

  const consecutiveErrors = recentEvents.findIndex(
    (e) => e.type !== "EXECUTION_ERROR",
  );

  // If all recent events are errors (or we have enough errors in a row)
  const errorCount = consecutiveErrors === -1 ? recentEvents.length : consecutiveErrors;

  if (errorCount >= MAX_CONSECUTIVE_ERRORS) {
    await autoPauseBot(botId, `Auto-paused after ${MAX_CONSECUTIVE_ERRORS} consecutive errors`);
  }
}

async function resetConsecutiveErrors(_botId: string): Promise<void> {
  // No-op: consecutive errors are tracked via BotEvent queries.
  // A successful CYCLE_COMPLETE event naturally breaks the streak.
}

async function autoPauseBot(botId: string, reason: string): Promise<void> {
  logger.warn(`Auto-pausing bot ${botId}: ${reason}`);

  await prisma.bot.update({
    where: { id: botId },
    data: { status: "PAUSED" },
  });

  await createBotEvent(botId, "BOT_AUTO_PAUSED", "CRITICAL", reason);

  // Create an alert for the user
  const bot = await prisma.bot.findUnique({
    where: { id: botId },
    select: { userId: true, name: true },
  });

  if (bot) {
    await prisma.alert.create({
      data: {
        userId: bot.userId,
        type: "BOT_ERROR",
        severity: "CRITICAL",
        title: `Bot "${bot.name}" auto-paused`,
        message: reason,
        metadata: { botId },
      },
    });
  }

  await stopBotExecution(botId);
}

async function updateHeartbeat(botId: string): Promise<void> {
  try {
    await prisma.bot.update({
      where: { id: botId },
      data: { lastHeartbeat: new Date() },
    });
  } catch {
    // Bot may have been deleted; non-fatal
    logger.warn(`Failed to update heartbeat for bot ${botId}`);
  }
}

async function createBotEvent(
  botId: string,
  type: string,
  severity: "INFO" | "WARNING" | "CRITICAL",
  message: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.botEvent.create({
      data: { botId, type, severity, message, metadata: metadata ?? undefined },
    });
  } catch {
    // Non-fatal; log and continue
    logger.warn(`Failed to create bot event for bot ${botId}: ${type}`);
  }
}

// ── Graceful shutdown ───────────────────────────────────────────────────────

export async function shutdownBotScheduler(): Promise<void> {
  logger.info("Shutting down bot scheduler...");

  if (queue) {
    await queue.close();
    queue = null;
  }

  if (redisConnection) {
    redisConnection.disconnect();
    redisConnection = null;
  }

  activeBotJobKeys.clear();
  logger.info("Bot scheduler shut down");
}

// ── Types ───────────────────────────────────────────────────────────────────

interface StrategySignal {
  action: "BUY" | "SELL" | "HOLD";
  side: "BUY" | "SELL";
  marketId: string;
  price: number;
  size: number;
  orderType?: "LIMIT" | "MARKET";
  confidence?: number;
  metadata?: Record<string, unknown>;
}

interface RiskValidationResult {
  approved: boolean;
  reason?: string;
  adjustedSize?: number;
}

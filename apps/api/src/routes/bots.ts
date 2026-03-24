import { Router } from "express";
import { z } from "zod";
import { prisma } from "@marketpilot/database";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { logger } from "../lib/logger";
import { startBotExecution, stopBotExecution } from "../services/bot-scheduler";

export const botsRouter = Router();

// ── List User Bots ──────────────────────────────────────────────────────────
botsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const bots = await prisma.bot.findMany({
      where: { userId: req.userId!, deletedAt: null },
      include: {
        strategy: { select: { name: true, slug: true, category: true } },
        _count: { select: { orders: true, positions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute P&L by aggregating all snapshots for each bot
    const enriched = await Promise.all(
      bots.map(async (bot) => {
        const pnlAgg = await prisma.pnlSnapshot.aggregate({
          where: { botId: bot.id },
          _sum: { pnl: true },
        });
        const totalPnl = pnlAgg._sum.pnl ?? 0;
        const pnlPercent = bot.capitalAllocated > 0
          ? Math.round((totalPnl / bot.capitalAllocated) * 10000) / 100
          : 0;
        return {
          ...bot,
          pnl: Math.round(totalPnl * 100) / 100,
          pnlPercent,
          tradesCount: bot._count.orders,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
});

// ── Create Bot ───────────────────────────────────────────────────────────────
const createBotSchema = z.object({
  name: z.string().min(1).max(100),
  strategySlug: z.string(),
  mode: z.enum(["PAPER", "LIVE"]).default("PAPER"),
  config: z.record(z.unknown()),
  riskLimits: z.record(z.number()),
  riskPreset: z.enum(["CONSERVATIVE", "BALANCED", "ADVANCED"]).default("CONSERVATIVE"),
  capitalAllocated: z.number().positive(),
});

botsRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = createBotSchema.parse(req.body);

    const strategy = await prisma.strategy.findUnique({
      where: { slug: data.strategySlug },
    });

    if (!strategy) {
      throw new AppError(404, "NOT_FOUND", "Strategy not found");
    }

    // Check bot limit based on plan
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.userId! },
      include: { plan: true },
    });

    const limits = (subscription?.plan?.limits as Record<string, number>) || { maxBots: 1 };
    const activeBots = await prisma.bot.count({
      where: { userId: req.userId!, deletedAt: null },
    });

    if (activeBots >= (limits.maxBots || 1)) {
      throw new AppError(403, "BOT_LIMIT", "You have reached your bot limit. Upgrade your plan.");
    }

    // Live mode requires ELITE plan + jurisdiction check
    if (data.mode === "LIVE") {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: req.userId! },
      });

      if (profile?.jurisdictionStatus !== "ELIGIBLE") {
        throw new AppError(
          403,
          "JURISDICTION_RESTRICTED",
          "Live trading is not available in your jurisdiction"
        );
      }

      const hasRiskAck = await prisma.riskAcknowledgement.findFirst({
        where: { userId: req.userId! },
        orderBy: { acknowledgedAt: "desc" },
      });

      if (!hasRiskAck) {
        throw new AppError(
          403,
          "RISK_ACK_REQUIRED",
          "You must acknowledge risk disclosures before live trading"
        );
      }
    }

    const bot = await prisma.bot.create({
      data: {
        userId: req.userId!,
        strategyId: strategy.id,
        name: data.name,
        mode: data.mode,
        config: data.config,
        riskLimits: data.riskLimits,
        riskPreset: data.riskPreset,
        capitalAllocated: data.capitalAllocated,
        status: "IDLE",
      },
      include: { strategy: { select: { name: true, slug: true } } },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: "BOT_CREATED",
        resource: "bot",
        resourceId: bot.id,
        details: { mode: data.mode, strategy: data.strategySlug },
      },
    });

    logger.info(`Bot created: ${bot.id} by user ${req.userId}`);

    res.status(201).json({ success: true, data: bot });
  } catch (error) {
    next(error);
  }
});

// ── Bot Actions ──────────────────────────────────────────────────────────────
botsRouter.post("/:id/start", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const bot = await prisma.bot.findFirst({
      where: { id: req.params.id, userId: req.userId!, deletedAt: null },
    });

    if (!bot) throw new AppError(404, "NOT_FOUND", "Bot not found");
    if (bot.status === "RUNNING") throw new AppError(400, "ALREADY_RUNNING", "Bot is already running");

    const updated = await prisma.bot.update({
      where: { id: bot.id },
      data: { status: "RUNNING", startedAt: new Date(), lastHeartbeat: new Date() },
    });

    await prisma.botEvent.create({
      data: { botId: bot.id, type: "BOT_STARTED", message: "Bot started by user" },
    });

    // Enqueue the bot for scheduled execution
    await startBotExecution(bot.id);

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

botsRouter.post("/:id/pause", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const bot = await prisma.bot.findFirst({
      where: { id: req.params.id, userId: req.userId!, deletedAt: null },
    });

    if (!bot) throw new AppError(404, "NOT_FOUND", "Bot not found");

    const updated = await prisma.bot.update({
      where: { id: bot.id },
      data: { status: "PAUSED" },
    });

    await prisma.botEvent.create({
      data: { botId: bot.id, type: "BOT_PAUSED", message: "Bot paused by user" },
    });

    // Remove the bot from the execution schedule
    await stopBotExecution(bot.id);

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

botsRouter.post("/:id/stop", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const bot = await prisma.bot.findFirst({
      where: { id: req.params.id, userId: req.userId!, deletedAt: null },
    });

    if (!bot) throw new AppError(404, "NOT_FOUND", "Bot not found");

    const updated = await prisma.bot.update({
      where: { id: bot.id },
      data: { status: "STOPPED", stoppedAt: new Date() },
    });

    await prisma.botEvent.create({
      data: {
        botId: bot.id,
        type: "BOT_STOPPED",
        message: "Bot stopped by user",
        severity: "WARNING",
      },
    });

    // Remove the bot from the execution schedule
    await stopBotExecution(bot.id);

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// ── Delete Bot (soft) ────────────────────────────────────────────────────────
botsRouter.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const bot = await prisma.bot.findFirst({
      where: { id: req.params.id, userId: req.userId!, deletedAt: null },
    });

    if (!bot) throw new AppError(404, "NOT_FOUND", "Bot not found");

    if (bot.status === "RUNNING") {
      throw new AppError(400, "BOT_RUNNING", "Stop the bot before deleting");
    }

    await prisma.bot.update({
      where: { id: bot.id },
      data: { deletedAt: new Date(), status: "STOPPED" },
    });

    res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    next(error);
  }
});

// ── Bot Trade Analysis ────────────────────────────────────────────────────────
botsRouter.get("/:id/analysis", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const bot = await prisma.bot.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!bot) throw new AppError(404, "NOT_FOUND", "Bot not found");

    const analyses = await prisma.tradeAnalysis.findMany({
      where: { botId: bot.id },
    });

    if (analyses.length === 0) {
      res.json({
        success: true,
        data: {
          total_trades: 0,
          feedback: ["No trades yet. Start the bot to begin collecting execution analysis."],
        },
      });
      return;
    }

    const fills = analyses.filter((a) => !a.wasRejected);
    const rejections = analyses.filter((a) => a.wasRejected);
    const partials = fills.filter((a) => a.isPartial);
    const makers = fills.filter((a) => a.feeType === "maker");

    const avgSlippage = fills.length > 0
      ? fills.reduce((s, a) => s + a.slippageBps, 0) / fills.length
      : 0;
    const totalSlippageCost = fills.reduce((s, a) => s + a.slippageCost, 0);
    const totalSpreadCost = fills.reduce((s, a) => s + a.spreadCost, 0);
    const totalFeeCost = fills.reduce((s, a) => s + a.feeCost, 0);
    const totalExecCost = fills.reduce((s, a) => s + a.totalExecCost, 0);
    const avgFillRate = fills.length > 0
      ? fills.reduce((s, a) => s + a.fillRate, 0) / fills.length
      : 0;
    const avgLatency = fills.length > 0
      ? fills.reduce((s, a) => s + a.simulatedLatencyMs, 0) / fills.length
      : 0;
    const idealPnl = fills.reduce((s, a) => s + a.idealPnl, 0);
    const realisticPnl = fills.reduce((s, a) => s + a.realisticPnl, 0);
    const drag = Math.abs(idealPnl) > 0.001
      ? ((idealPnl - realisticPnl) / Math.abs(idealPnl)) * 100
      : 0;

    // Execution quality score (0-100)
    let score = 100;
    if (avgSlippage > 5) score -= (avgSlippage - 5) * 2;
    score -= (1 - avgFillRate) * 30;
    if (analyses.length > 0) score -= (rejections.length / analyses.length) * 300;
    if (fills.length > 0) score -= (partials.length / fills.length) * 100;
    if (avgLatency > 300) score -= (avgLatency - 300) / 100;
    score = Math.max(0, Math.min(100, score));

    // Generate feedback
    const feedback: string[] = [];

    if (avgSlippage > 15) {
      feedback.push(`High average slippage of ${avgSlippage.toFixed(1)}bps. Consider using limit orders or smaller sizes.`);
    } else if (avgSlippage > 8) {
      feedback.push(`Moderate slippage of ${avgSlippage.toFixed(1)}bps. More maker orders could reduce costs.`);
    }

    if (avgFillRate < 0.80) {
      feedback.push(`Only ${(avgFillRate * 100).toFixed(0)}% fill rate. Target more liquid markets or reduce sizes.`);
    }

    if (fills.length > 0 && partials.length / fills.length > 0.2) {
      feedback.push(`${((partials.length / fills.length) * 100).toFixed(0)}% partial fills — order sizes may be too large for available liquidity.`);
    }

    if (analyses.length > 0 && rejections.length / analyses.length > 0.1) {
      feedback.push(`${((rejections.length / analyses.length) * 100).toFixed(0)}% rejection rate. Add liquidity checks before submission.`);
    }

    if (drag > 5) {
      feedback.push(`Execution costs dragging returns by ${drag.toFixed(1)}%. Breakdown: slippage $${totalSlippageCost.toFixed(2)}, spread $${totalSpreadCost.toFixed(2)}, fees $${totalFeeCost.toFixed(2)}.`);
    }

    if (idealPnl > 0 && realisticPnl < 0) {
      feedback.push(`WARNING: Profitable before costs ($${idealPnl.toFixed(2)}) but unprofitable after ($${realisticPnl.toFixed(2)}). Would lose money live.`);
    }

    if (score >= 85) feedback.push(`Execution quality: ${score.toFixed(0)}/100 — Excellent. Ready for live trading.`);
    else if (score >= 65) feedback.push(`Execution quality: ${score.toFixed(0)}/100 — Good. Some optimisation recommended.`);
    else if (score >= 40) feedback.push(`Execution quality: ${score.toFixed(0)}/100 — Fair. Address execution issues before going live.`);
    else feedback.push(`Execution quality: ${score.toFixed(0)}/100 — Poor. Fundamental changes needed.`);

    feedback.push(`P&L comparison — Ideal: $${idealPnl.toFixed(2)} vs Realistic: $${realisticPnl.toFixed(2)} (costs: $${totalExecCost.toFixed(2)}).`);

    res.json({
      success: true,
      data: {
        total_trades: analyses.length,
        total_fills: fills.length,
        total_rejections: rejections.length,
        partial_fill_count: partials.length,
        avg_slippage_bps: Math.round(avgSlippage * 100) / 100,
        total_slippage_cost: Math.round(totalSlippageCost * 100) / 100,
        total_spread_cost: Math.round(totalSpreadCost * 100) / 100,
        total_fee_cost: Math.round(totalFeeCost * 100) / 100,
        total_execution_cost: Math.round(totalExecCost * 100) / 100,
        maker_fill_pct: fills.length > 0 ? Math.round((makers.length / fills.length) * 1000) / 10 : 0,
        avg_fill_rate: Math.round(avgFillRate * 10000) / 10000,
        avg_latency_ms: Math.round(avgLatency * 10) / 10,
        ideal_total_pnl: Math.round(idealPnl * 100) / 100,
        realistic_total_pnl: Math.round(realisticPnl * 100) / 100,
        realism_drag_pct: Math.round(drag * 100) / 100,
        execution_quality_score: Math.round(score * 10) / 10,
        feedback,
      },
    });
  } catch (error) {
    next(error);
  }
});

botsRouter.get("/:id/analysis/trades", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const bot = await prisma.bot.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!bot) throw new AppError(404, "NOT_FOUND", "Bot not found");

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      prisma.tradeAnalysis.findMany({
        where: { botId: bot.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          order: { select: { side: true, price: true, size: true, marketId: true, createdAt: true } },
        },
      }),
      prisma.tradeAnalysis.count({ where: { botId: bot.id } }),
    ]);

    res.json({
      success: true,
      data: analyses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// ── Bot Events ───────────────────────────────────────────────────────────────
botsRouter.get("/:id/events", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const bot = await prisma.bot.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!bot) throw new AppError(404, "NOT_FOUND", "Bot not found");

    const events = await prisma.botEvent.findMany({
      where: { botId: bot.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
});

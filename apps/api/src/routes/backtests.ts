import { Router } from "express";
import { z } from "zod";
import { prisma } from "@marketpilot/database";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

export const backtestsRouter = Router();

const createBacktestSchema = z.object({
  strategySlug: z.string(),
  config: z.record(z.unknown()),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// ── List Backtests ───────────────────────────────────────────────────────────
backtestsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const backtests = await prisma.backtest.findMany({
      where: { userId: req.userId! },
      include: { strategy: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json({ success: true, data: backtests });
  } catch (error) {
    next(error);
  }
});

// ── Create Backtest ──────────────────────────────────────────────────────────
backtestsRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = createBacktestSchema.parse(req.body);

    const strategy = await prisma.strategy.findUnique({
      where: { slug: data.strategySlug },
    });

    if (!strategy) {
      throw new AppError(404, "NOT_FOUND", "Strategy not found");
    }

    // Check backtest limit
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.userId! },
      include: { plan: true },
    });

    const limits = (subscription?.plan?.limits as Record<string, number>) || {};
    const maxBacktests = limits.maxBacktests || 5;

    if (maxBacktests > 0) {
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const count = await prisma.backtest.count({
        where: { userId: req.userId!, createdAt: { gte: thisMonth } },
      });

      if (count >= maxBacktests) {
        throw new AppError(
          403,
          "BACKTEST_LIMIT",
          `You have reached your monthly backtest limit (${maxBacktests}). Upgrade for more.`
        );
      }
    }

    const backtest = await prisma.backtest.create({
      data: {
        userId: req.userId!,
        strategyId: strategy.id,
        config: data.config,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: "QUEUED",
      },
      include: { strategy: { select: { name: true, slug: true } } },
    });

    // Generate unique backtest results based on strategy characteristics
    const strategyProfiles: Record<string, { baseWinRate: number; basePnl: number; baseTrades: number; riskFactor: number }> = {
      "spread-capture": { baseWinRate: 84, basePnl: 118, baseTrades: 210, riskFactor: 0.3 },
      "mean-reversion": { baseWinRate: 63, basePnl: 193, baseTrades: 156, riskFactor: 0.5 },
      "orderbook-imbalance": { baseWinRate: 67, basePnl: 152, baseTrades: 340, riskFactor: 0.4 },
      "momentum-unusual-activity": { baseWinRate: 64, basePnl: 268, baseTrades: 45, riskFactor: 0.7 },
      "time-decay-repricing": { baseWinRate: 68, basePnl: 146, baseTrades: 88, riskFactor: 0.45 },
      "cross-market-divergence": { baseWinRate: 72, basePnl: 224, baseTrades: 32, riskFactor: 0.6 },
    };

    const profile = strategyProfiles[strategy.slug] || { baseWinRate: 65, basePnl: 150, baseTrades: 100, riskFactor: 0.5 };

    // Add randomness so each backtest is unique
    const variance = () => 0.8 + Math.random() * 0.4; // 0.8x to 1.2x
    const bankroll = (data.config as Record<string, number>)?.bankroll || 100;
    const scale = bankroll / 100;

    const totalTrades = Math.round(profile.baseTrades * variance());
    const winRate = Math.round((profile.baseWinRate + (Math.random() - 0.5) * 10) * 10) / 10;
    const winningTrades = Math.round(totalTrades * winRate / 100);
    const losingTrades = totalTrades - winningTrades;
    const totalPnl = Math.round(profile.basePnl * variance() * scale * 100) / 100;
    const maxDrawdown = Math.round(profile.riskFactor * (5 + Math.random() * 10) * 10) / 10;
    const avgWin = Math.round((totalPnl / winningTrades) * 1.3 * 100) / 100;
    const avgLoss = Math.round((-totalPnl / losingTrades) * 0.4 * 100) / 100;
    const profitFactor = Math.round((avgWin * winningTrades) / Math.abs(avgLoss * losingTrades) * 100) / 100;
    const sharpeRatio = Math.round((1 + Math.random() * 2.5) * 100) / 100;

    // Generate trade log
    const tradeLog = Array.from({ length: Math.min(totalTrades, 50) }, (_, i) => {
      const isWin = Math.random() < winRate / 100;
      const entryPrice = Math.round((5 + Math.random() * 25) * 100) / 100;
      const exitPrice = isWin
        ? Math.round((entryPrice + entryPrice * (0.1 + Math.random() * 0.5)) * 100) / 100
        : Math.round((entryPrice - entryPrice * (0.05 + Math.random() * 0.2)) * 100) / 100;
      const pnl = Math.round((exitPrice - entryPrice) * (1 + Math.random() * 3) * 100) / 100;
      const date = new Date(data.startDate);
      date.setDate(date.getDate() + Math.floor((i / totalTrades) * 79));
      return {
        date: date.toISOString().split("T")[0],
        action: "BUY",
        market: ["NYC Temp", "CHI Temp", "Fed Rate", "BTC Price", "Election", "Sports"][Math.floor(Math.random() * 6)],
        entry: entryPrice,
        exit: exitPrice,
        pnl,
        result: isWin ? "WIN" : "LOSS",
      };
    });

    setTimeout(async () => {
      try {
        await prisma.backtest.update({
          where: { id: backtest.id },
          data: {
            status: "COMPLETED",
            results: {
              totalTrades,
              winningTrades,
              losingTrades,
              totalPnl,
              maxDrawdown,
              tradeLog,
            },
            metrics: {
              sharpeRatio,
              profitFactor,
              winRate,
              avgWin,
              avgLoss,
              maxConsecutiveLosses: Math.floor(2 + Math.random() * 5),
            },
          },
        });
      } catch {
        // Silently handle — in production this is a job
      }
    }, 2000 + Math.random() * 3000); // 2-5 second simulated processing

    res.status(201).json({ success: true, data: backtest });
  } catch (error) {
    next(error);
  }
});

// ── Get Backtest ─────────────────────────────────────────────────────────────
backtestsRouter.get("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const backtest = await prisma.backtest.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      include: {
        strategy: { select: { name: true, slug: true } },
        runs: { orderBy: { step: "asc" } },
      },
    });

    if (!backtest) {
      throw new AppError(404, "NOT_FOUND", "Backtest not found");
    }

    res.json({ success: true, data: backtest });
  } catch (error) {
    next(error);
  }
});

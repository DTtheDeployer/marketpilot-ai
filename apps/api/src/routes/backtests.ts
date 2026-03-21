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

    // In production, this would enqueue a BullMQ job
    // For now, we simulate completion
    setTimeout(async () => {
      try {
        await prisma.backtest.update({
          where: { id: backtest.id },
          data: {
            status: "COMPLETED",
            results: {
              totalTrades: 142,
              winningTrades: 89,
              losingTrades: 53,
              totalPnl: 347.82,
              maxDrawdown: 8.3,
            },
            metrics: {
              sharpeRatio: 1.42,
              profitFactor: 1.68,
              winRate: 62.7,
              avgWin: 12.4,
              avgLoss: -8.1,
              maxConsecutiveLosses: 4,
            },
          },
        });
      } catch {
        // Silently handle — in production this is a job
      }
    }, 2000);

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

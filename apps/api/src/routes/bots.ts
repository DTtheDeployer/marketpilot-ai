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

import { Router } from "express";
import { z } from "zod";
import { prisma } from "@marketpilot/database";
import { requireAuth, requireAdmin, type AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

export const adminRouter = Router();

// All admin routes require auth + admin role
adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

// ── Dashboard Stats ──────────────────────────────────────────────────────────
adminRouter.get("/stats", async (_req, res, next) => {
  try {
    const [totalUsers, activeBots, totalOrders, activeSubscriptions] = await Promise.all([
      prisma.user.count(),
      prisma.bot.count({ where: { status: "RUNNING" } }),
      prisma.order.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeBots,
        totalOrders,
        activeSubscriptions,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── Users ────────────────────────────────────────────────────────────────────
adminRouter.get("/users", async (req, res, next) => {
  try {
    const { search, limit = "50", offset = "0" } = req.query;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { email: { contains: String(search), mode: "insensitive" } },
        { name: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true,
          subscription: { include: { plan: true } },
          _count: { select: { bots: true } },
        },
        orderBy: { createdAt: "desc" },
        take: Math.min(Number(limit), 100),
        skip: Number(offset),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        plan: u.subscription?.plan?.tier || "FREE",
        status: u.subscription?.status || "ACTIVE",
        mode: u.profile?.tradingMode || "PAPER",
        jurisdiction: u.profile?.jurisdictionStatus || "UNCHECKED",
        botsCount: u._count.bots,
        createdAt: u.createdAt,
      })),
      meta: { total, page: Math.floor(Number(offset) / Number(limit)) + 1 },
    });
  } catch (error) {
    next(error);
  }
});

// ── Feature Flags ────────────────────────────────────────────────────────────
adminRouter.get("/feature-flags", async (_req, res, next) => {
  try {
    const flags = await prisma.featureFlag.findMany({ orderBy: { key: "asc" } });
    res.json({ success: true, data: flags });
  } catch (error) {
    next(error);
  }
});

const updateFlagSchema = z.object({ enabled: z.boolean() });

adminRouter.patch("/feature-flags/:key", async (req, res, next) => {
  try {
    const { enabled } = updateFlagSchema.parse(req.body);

    const flag = await prisma.featureFlag.update({
      where: { key: req.params.key },
      data: { enabled },
    });

    await prisma.systemEvent.create({
      data: {
        type: "FEATURE_FLAG_TOGGLED",
        message: `Feature flag "${req.params.key}" set to ${enabled}`,
        metadata: { key: req.params.key, enabled },
      },
    });

    res.json({ success: true, data: flag });
  } catch (error) {
    next(error);
  }
});

// ── System Events ────────────────────────────────────────────────────────────
adminRouter.get("/events", async (_req, res, next) => {
  try {
    const events = await prisma.systemEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
});

// ── Audit Log ────────────────────────────────────────────────────────────────
adminRouter.get("/audit-log", async (req, res, next) => {
  try {
    const { userId, action, limit = "50" } = req.query;

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: Math.min(Number(limit), 200),
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
});

// ── Emergency Stop All Bots ──────────────────────────────────────────────────
adminRouter.post("/emergency-stop", async (req: AuthenticatedRequest, res, next) => {
  try {
    const result = await prisma.bot.updateMany({
      where: { status: "RUNNING" },
      data: { status: "STOPPED", stoppedAt: new Date() },
    });

    await prisma.systemEvent.create({
      data: {
        type: "EMERGENCY_STOP",
        severity: "CRITICAL",
        message: `Emergency stop executed by admin ${req.userId}. ${result.count} bots stopped.`,
        metadata: { stoppedCount: result.count, triggeredBy: req.userId },
      },
    });

    res.json({
      success: true,
      data: { stoppedCount: result.count },
    });
  } catch (error) {
    next(error);
  }
});

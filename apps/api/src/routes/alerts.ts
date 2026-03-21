import { Router } from "express";
import { prisma } from "@marketpilot/database";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";

export const alertsRouter = Router();

// ── List Alerts ──────────────────────────────────────────────────────────────
alertsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { unreadOnly } = req.query;

    const where: Record<string, unknown> = { userId: req.userId! };
    if (unreadOnly === "true") where.read = false;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.alert.count({
      where: { userId: req.userId!, read: false },
    });

    res.json({ success: true, data: { alerts, unreadCount } });
  } catch (error) {
    next(error);
  }
});

// ── Mark Alert as Read ───────────────────────────────────────────────────────
alertsRouter.patch("/:id/read", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.alert.updateMany({
      where: { id: req.params.id, userId: req.userId! },
      data: { read: true },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ── Mark All as Read ─────────────────────────────────────────────────────────
alertsRouter.post("/read-all", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.alert.updateMany({
      where: { userId: req.userId!, read: false },
      data: { read: true },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ── Notification Preferences ─────────────────────────────────────────────────
alertsRouter.get("/preferences", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId: req.userId! },
    });

    res.json({ success: true, data: prefs });
  } catch (error) {
    next(error);
  }
});

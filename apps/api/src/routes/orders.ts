import { Router } from "express";
import { prisma } from "@marketpilot/database";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

export const ordersRouter = Router();

// ── List Orders ──────────────────────────────────────────────────────────────
ordersRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { status, botId, limit = "50", offset = "0" } = req.query;

    const where: Record<string, unknown> = { userId: req.userId! };
    if (status) where.status = status;
    if (botId) where.botId = botId;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          market: { select: { title: true } },
          bot: { select: { name: true } },
          fills: true,
        },
        orderBy: { createdAt: "desc" },
        take: Math.min(Number(limit), 100),
        skip: Number(offset),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: orders,
      meta: { total, page: Math.floor(Number(offset) / Number(limit)) + 1, pageSize: Number(limit) },
    });
  } catch (error) {
    next(error);
  }
});

// ── Get Order ────────────────────────────────────────────────────────────────
ordersRouter.get("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      include: {
        market: true,
        bot: { select: { name: true } },
        fills: { orderBy: { timestamp: "desc" } },
        executionLogs: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!order) throw new AppError(404, "NOT_FOUND", "Order not found");

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// ── Get Positions ────────────────────────────────────────────────────────────
ordersRouter.get("/positions/open", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const positions = await prisma.position.findMany({
      where: { userId: req.userId!, isOpen: true },
      include: {
        market: { select: { title: true, status: true } },
        bot: { select: { name: true } },
      },
      orderBy: { openedAt: "desc" },
    });

    res.json({ success: true, data: positions });
  } catch (error) {
    next(error);
  }
});

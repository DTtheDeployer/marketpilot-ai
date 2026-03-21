import { Router } from "express";
import { prisma } from "@marketpilot/database";
import { PolymarketClient } from "@marketpilot/trading/src/polymarket/client";
import { requireAuth, requireAdmin, type AuthenticatedRequest } from "../middleware/auth";
import { syncMarkets, syncMarketSnapshot } from "../services/market-sync";
import { AppError } from "../middleware/error-handler";
import { logger } from "../lib/logger";

export const marketsRouter = Router();

const polyClient = new PolymarketClient({
  host: process.env.POLYMARKET_API_URL || "https://clob.polymarket.com",
});

// ── List Markets (from local DB) ─────────────────────────────────────────────
marketsRouter.get("/", async (req, res, next) => {
  try {
    const { status, category, search, limit = "50", offset = "0" } = req.query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.title = { contains: String(search), mode: "insensitive" };
    }

    const [markets, total] = await Promise.all([
      prisma.market.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: Math.min(Number(limit), 100),
        skip: Number(offset),
      }),
      prisma.market.count({ where }),
    ]);

    res.json({
      success: true,
      data: markets,
      meta: {
        total,
        page: Math.floor(Number(offset) / Number(limit)) + 1,
        pageSize: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── Get Market by ID ─────────────────────────────────────────────────────────
marketsRouter.get("/:id", async (req, res, next) => {
  try {
    const market = await prisma.market.findUnique({
      where: { id: req.params.id },
      include: {
        snapshots: { orderBy: { createdAt: "desc" }, take: 1 },
        orderbooks: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!market) throw new AppError(404, "NOT_FOUND", "Market not found");

    res.json({ success: true, data: market });
  } catch (error) {
    next(error);
  }
});

// ── Get Live Orderbook (proxied from Polymarket) ─────────────────────────────
marketsRouter.get("/:id/orderbook", async (req, res, next) => {
  try {
    const market = await prisma.market.findUnique({
      where: { id: req.params.id },
    });

    if (!market) throw new AppError(404, "NOT_FOUND", "Market not found");

    const outcomes = market.outcomes as { tokenId?: string; name: string }[];
    const primaryTokenId = outcomes?.[0]?.tokenId;

    if (!primaryTokenId) {
      // Return last cached orderbook if no tokenId
      const cached = await prisma.orderbookSnapshot.findFirst({
        where: { marketId: market.id },
        orderBy: { createdAt: "desc" },
      });

      return res.json({ success: true, data: cached, source: "cache" });
    }

    try {
      const orderbook = await polyClient.getOrderbook(primaryTokenId);
      res.json({ success: true, data: orderbook, source: "live" });
    } catch {
      // Fallback to cached data
      const cached = await prisma.orderbookSnapshot.findFirst({
        where: { marketId: market.id },
        orderBy: { createdAt: "desc" },
      });

      res.json({ success: true, data: cached, source: "cache" });
    }
  } catch (error) {
    next(error);
  }
});

// ── Get Live Price (proxied from Polymarket) ─────────────────────────────────
marketsRouter.get("/:id/price", async (req, res, next) => {
  try {
    const market = await prisma.market.findUnique({
      where: { id: req.params.id },
    });

    if (!market) throw new AppError(404, "NOT_FOUND", "Market not found");

    const outcomes = market.outcomes as { tokenId?: string; name: string }[];

    const prices: { outcome: string; tokenId?: string; bid?: string; ask?: string; mid?: string }[] = [];

    for (const outcome of outcomes) {
      if (!outcome.tokenId) continue;

      try {
        const [bid, ask, mid] = await Promise.all([
          polyClient.getPrice(outcome.tokenId, "BUY"),
          polyClient.getPrice(outcome.tokenId, "SELL"),
          polyClient.getMidpoint(outcome.tokenId),
        ]);

        prices.push({
          outcome: outcome.name,
          tokenId: outcome.tokenId,
          bid: bid.price,
          ask: ask.price,
          mid: mid.mid,
        });
      } catch {
        prices.push({ outcome: outcome.name, tokenId: outcome.tokenId });
      }
    }

    res.json({ success: true, data: prices });
  } catch (error) {
    next(error);
  }
});

// ── Get Recent Trades ────────────────────────────────────────────────────────
marketsRouter.get("/:id/trades", async (req, res, next) => {
  try {
    const market = await prisma.market.findUnique({
      where: { id: req.params.id },
    });

    if (!market) throw new AppError(404, "NOT_FOUND", "Market not found");

    // Try live data first
    try {
      const trades = await polyClient.getMarketTrades(market.conditionId, {
        limit: 50,
      });
      return res.json({ success: true, data: trades, source: "live" });
    } catch {
      // Fallback to cached trade prints
      const trades = await prisma.tradePrint.findMany({
        where: { marketId: market.id },
        orderBy: { timestamp: "desc" },
        take: 50,
      });
      res.json({ success: true, data: trades, source: "cache" });
    }
  } catch (error) {
    next(error);
  }
});

// ── Admin: Trigger Market Sync ───────────────────────────────────────────────
marketsRouter.post(
  "/sync",
  requireAuth,
  requireAdmin,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      logger.info(`Market sync triggered by admin ${req.userId}`);
      const result = await syncMarkets();

      await prisma.systemEvent.create({
        data: {
          type: "MARKET_SYNC",
          message: `Market sync completed: ${result.synced} synced, ${result.errors} errors`,
          metadata: result,
        },
      });

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

// ── Admin: Trigger Snapshot Sync ─────────────────────────────────────────────
marketsRouter.post(
  "/:id/sync-snapshot",
  requireAuth,
  requireAdmin,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const market = await prisma.market.findUnique({
        where: { id: req.params.id },
      });

      if (!market) throw new AppError(404, "NOT_FOUND", "Market not found");

      await syncMarketSnapshot(market.conditionId);

      res.json({ success: true, data: { synced: true } });
    } catch (error) {
      next(error);
    }
  }
);

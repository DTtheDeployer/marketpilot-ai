// =============================================================================
// MarketPilot AI — Market Sync Service
// =============================================================================
// Fetches markets from Polymarket and syncs them to the local database.
// Designed to run as a periodic job (e.g. every 5 minutes via BullMQ).
// =============================================================================

import { prisma } from "@marketpilot/database";
import { PolymarketClient } from "@marketpilot/trading/src/polymarket/client";
import type { PolymarketMarket } from "@marketpilot/trading/src/polymarket/types";
import { logger } from "../lib/logger";

const client = new PolymarketClient({
  host: process.env.POLYMARKET_API_URL || "https://clob.polymarket.com",
});

export async function syncMarkets(): Promise<{
  synced: number;
  errors: number;
}> {
  let synced = 0;
  let errors = 0;
  let cursor: string | undefined;

  logger.info("Market sync started");

  try {
    // Paginate through all markets
    do {
      const result = await client.getMarkets(
        cursor ? { next_cursor: cursor } : undefined
      );

      for (const market of result.data) {
        try {
          await upsertMarket(market);
          synced++;
        } catch (err) {
          errors++;
          logger.error(`Failed to sync market ${market.condition_id}:`, err);
        }
      }

      cursor = result.next_cursor === "LTE=" ? undefined : result.next_cursor;
    } while (cursor);

    logger.info(`Market sync completed: ${synced} synced, ${errors} errors`);
  } catch (err) {
    logger.error("Market sync failed:", err);
    throw err;
  }

  return { synced, errors };
}

async function upsertMarket(pm: PolymarketMarket): Promise<void> {
  const outcomes = pm.tokens.map((t) => ({
    name: t.outcome,
    tokenId: t.token_id,
    price: t.price,
    winner: t.winner,
  }));

  const status = pm.closed
    ? "CLOSED"
    : pm.archived
      ? "RESOLVED"
      : "ACTIVE";

  await prisma.market.upsert({
    where: { conditionId: pm.condition_id },
    update: {
      title: pm.question || pm.description,
      description: pm.description,
      category: pm.category || "Other",
      endDate: pm.end_date_iso ? new Date(pm.end_date_iso) : null,
      status,
      outcomes,
      source: "polymarket",
      updatedAt: new Date(),
    },
    create: {
      conditionId: pm.condition_id,
      title: pm.question || pm.description,
      description: pm.description,
      category: pm.category || "Other",
      endDate: pm.end_date_iso ? new Date(pm.end_date_iso) : null,
      status,
      outcomes,
      source: "polymarket",
    },
  });
}

export async function syncMarketSnapshot(conditionId: string): Promise<void> {
  const market = await prisma.market.findUnique({
    where: { conditionId },
  });

  if (!market) {
    throw new Error(`Market not found: ${conditionId}`);
  }

  const outcomes = market.outcomes as { tokenId: string; name: string }[];
  if (!outcomes?.length || !outcomes[0]?.tokenId) return;

  const primaryTokenId = outcomes[0].tokenId;

  try {
    const [orderbook, trades] = await Promise.all([
      client.getOrderbook(primaryTokenId),
      client.getMarketTrades(conditionId, { limit: 50 }),
    ]);

    // Calculate 24h volume from recent trades
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentTrades = trades.filter(
      (t) => new Date(t.match_time).getTime() > oneDayAgo
    );
    const volume24h = recentTrades.reduce(
      (sum, t) => sum + parseFloat(t.size) * parseFloat(t.price),
      0
    );

    // Calculate liquidity from orderbook depth
    const bidLiquidity = orderbook.bids.reduce(
      (sum, l) => sum + parseFloat(l.size) * parseFloat(l.price),
      0
    );
    const askLiquidity = orderbook.asks.reduce(
      (sum, l) => sum + parseFloat(l.size) * parseFloat(l.price),
      0
    );
    const liquidity = bidLiquidity + askLiquidity;

    // Store market snapshot
    await prisma.marketSnapshot.create({
      data: {
        marketId: market.id,
        prices: outcomes.map((o) => ({
          outcome: o.name,
          tokenId: o.tokenId,
        })),
        volume24h,
        liquidity,
      },
    });

    // Store orderbook snapshot
    const bestBid = orderbook.bids[0]
      ? parseFloat(orderbook.bids[0].price)
      : 0;
    const bestAsk = orderbook.asks[0]
      ? parseFloat(orderbook.asks[0].price)
      : 1;
    const spread = bestAsk - bestBid;
    const midPrice = (bestBid + bestAsk) / 2;

    await prisma.orderbookSnapshot.create({
      data: {
        marketId: market.id,
        bids: orderbook.bids,
        asks: orderbook.asks,
        spread,
        midPrice,
      },
    });

    // Store trade prints
    for (const trade of recentTrades.slice(0, 20)) {
      await prisma.tradePrint.create({
        data: {
          marketId: market.id,
          side: trade.side === "BUY" ? "BUY" : "SELL",
          price: parseFloat(trade.price),
          size: parseFloat(trade.size),
          timestamp: new Date(trade.match_time),
        },
      });
    }
  } catch (err) {
    logger.error(`Snapshot sync failed for ${conditionId}:`, err);
    throw err;
  }
}

export async function syncAllActiveMarketSnapshots(): Promise<void> {
  const activeMarkets = await prisma.market.findMany({
    where: { status: "ACTIVE" },
    select: { conditionId: true },
  });

  logger.info(
    `Syncing snapshots for ${activeMarkets.length} active markets`
  );

  let success = 0;
  let failed = 0;

  for (const market of activeMarkets) {
    try {
      await syncMarketSnapshot(market.conditionId);
      success++;
      // Rate limit: ~50 req/10s for book endpoint
      await new Promise((r) => setTimeout(r, 250));
    } catch {
      failed++;
    }
  }

  logger.info(
    `Snapshot sync completed: ${success} success, ${failed} failed`
  );
}

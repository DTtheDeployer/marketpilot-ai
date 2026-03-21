// =============================================================================
// MarketPilot AI — Polymarket CLOB API Types
// =============================================================================

// ── Market Types ─────────────────────────────────────────────────────────────

export interface PolymarketToken {
  token_id: string;
  outcome: string;
  price: number;
  winner: boolean;
}

export interface PolymarketMarket {
  condition_id: string;
  question_id: string;
  tokens: PolymarketToken[];
  description: string;
  category: string;
  end_date_iso: string;
  game_start_time: string;
  question: string;
  market_slug: string;
  minimum_order_size: number;
  minimum_tick_size: number;
  active: boolean;
  closed: boolean;
  archived: boolean;
  accepting_orders: boolean;
  accepting_order_timestamp: string;
  neg_risk: boolean;
}

export interface PolymarketSimplifiedMarket {
  condition_id: string;
  tokens: { token_id: string; outcome: string }[];
}

// ── Orderbook Types ──────────────────────────────────────────────────────────

export interface OrderbookLevel {
  price: string;
  size: string;
}

export interface PolymarketOrderbook {
  market: string;
  asset_id: string;
  hash: string;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  timestamp: string;
}

// ── Price Types ──────────────────────────────────────────────────────────────

export interface PolymarketPrice {
  price: string;
}

export interface PolymarketMidpoint {
  mid: string;
}

export interface PolymarketSpread {
  spread: string;
}

// ── Order Types ──────────────────────────────────────────────────────────────

export type OrderSide = "BUY" | "SELL";
export type OrderType = "GTC" | "GTD" | "FOK" | "FAK";

export interface CreateOrderParams {
  tokenId: string;
  price: number;
  size: number;
  side: OrderSide;
  orderType?: OrderType;
  expiration?: number;
}

export interface PolymarketOrder {
  id: string;
  market: string;
  asset_id: string;
  side: OrderSide;
  original_size: string;
  size_matched: string;
  price: string;
  status: string;
  outcome: string;
  owner: string;
  expiration: string;
  created_at: number;
  type: OrderType;
}

// ── Trade Types ──────────────────────────────────────────────────────────────

export interface PolymarketTrade {
  id: string;
  taker_order_id: string;
  market: string;
  asset_id: string;
  side: OrderSide;
  size: string;
  fee_rate_bps: string;
  price: string;
  status: string;
  match_time: string;
  last_update: string;
  outcome: string;
  maker_address: string;
  trader_side: OrderSide;
  transaction_hash: string;
}

// ── Auth Types ───────────────────────────────────────────────────────────────

export interface ApiCredentials {
  apiKey: string;
  secret: string;
  passphrase: string;
}

// ── Balance Types ────────────────────────────────────────────────────────────

export interface BalanceAllowance {
  balance: string;
  allowance: string;
}

// ── WebSocket Types ──────────────────────────────────────────────────────────

export interface WsSubscribeMessage {
  type: "subscribe";
  asset_ids: string[];
}

export interface WsOrderbookUpdate {
  event_type: "book";
  asset_id: string;
  market: string;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  timestamp: string;
  hash: string;
}

export interface WsPriceChange {
  event_type: "price_change";
  asset_id: string;
  market: string;
  price: string;
  side: OrderSide;
}

export interface WsTradeUpdate {
  event_type: "last_trade_price";
  asset_id: string;
  market: string;
  price: string;
  side: OrderSide;
  size: string;
}

// =============================================================================
// MarketPilot AI — Polymarket CLOB API Client
// =============================================================================
// Read-only client for market data. Order execution requires the Python
// strategy engine which uses the official py-clob-client SDK with EIP-712
// signing.
// =============================================================================

import type {
  PolymarketMarket,
  PolymarketOrderbook,
  PolymarketPrice,
  PolymarketMidpoint,
  PolymarketSpread,
  PolymarketTrade,
  PolymarketOrder,
  ApiCredentials,
  BalanceAllowance,
} from "./types";
import { createHmac } from "crypto";

const DEFAULT_HOST = "https://clob.polymarket.com";
const GAMMA_HOST = "https://gamma-api.polymarket.com";

export class PolymarketClient {
  private host: string;
  private gammaHost: string;
  private credentials?: ApiCredentials;
  private walletAddress?: string;

  constructor(options?: {
    host?: string;
    gammaHost?: string;
    credentials?: ApiCredentials;
    walletAddress?: string;
  }) {
    this.host = options?.host || DEFAULT_HOST;
    this.gammaHost = options?.gammaHost || GAMMA_HOST;
    this.credentials = options?.credentials;
    this.walletAddress = options?.walletAddress;
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  private async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new PolymarketApiError(
        `Polymarket API error: ${response.status} ${response.statusText}`,
        response.status,
        body
      );
    }

    return response.json() as Promise<T>;
  }

  private getL2Headers(
    method: string,
    path: string,
    body?: string
  ): Record<string, string> {
    if (!this.credentials || !this.walletAddress) {
      throw new PolymarketApiError(
        "API credentials and wallet address required for authenticated requests",
        401
      );
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const prehash = timestamp + method.toUpperCase() + path + (body || "");
    const signature = createHmac("sha256", this.credentials.secret)
      .update(prehash)
      .digest("base64");

    return {
      POLY_ADDRESS: this.walletAddress,
      POLY_API_KEY: this.credentials.apiKey,
      POLY_PASSPHRASE: this.credentials.passphrase,
      POLY_TIMESTAMP: timestamp,
      POLY_SIGNATURE: signature,
    };
  }

  // ── Health ───────────────────────────────────────────────────────────────

  async health(): Promise<boolean> {
    try {
      const resp = await fetch(`${this.host}/ok`);
      return resp.ok;
    } catch {
      return false;
    }
  }

  async serverTime(): Promise<string> {
    return this.fetchJson<string>(`${this.host}/server-time`);
  }

  // ── Markets (Public) ─────────────────────────────────────────────────────

  async getMarkets(params?: {
    next_cursor?: string;
  }): Promise<{ data: PolymarketMarket[]; next_cursor: string }> {
    const query = params?.next_cursor
      ? `?next_cursor=${params.next_cursor}`
      : "";
    return this.fetchJson(`${this.host}/markets${query}`);
  }

  async getMarket(conditionId: string): Promise<PolymarketMarket> {
    return this.fetchJson(`${this.host}/market/${conditionId}`);
  }

  async getSimplifiedMarkets(params?: {
    next_cursor?: string;
  }): Promise<{ data: { condition_id: string; tokens: { token_id: string; outcome: string }[] }[]; next_cursor: string }> {
    const query = params?.next_cursor
      ? `?next_cursor=${params.next_cursor}`
      : "";
    return this.fetchJson(`${this.host}/simplified-markets${query}`);
  }

  // ── Markets via Gamma API (richer metadata) ──────────────────────────────

  async getGammaMarkets(params?: {
    limit?: number;
    offset?: number;
    active?: boolean;
    closed?: boolean;
    category?: string;
    order?: string;
    ascending?: boolean;
  }): Promise<PolymarketMarket[]> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));
    if (params?.active !== undefined) searchParams.set("active", String(params.active));
    if (params?.closed !== undefined) searchParams.set("closed", String(params.closed));
    if (params?.category) searchParams.set("tag", params.category);
    if (params?.order) searchParams.set("order", params.order);
    if (params?.ascending !== undefined) searchParams.set("ascending", String(params.ascending));

    const query = searchParams.toString();
    return this.fetchJson(`${this.gammaHost}/markets${query ? `?${query}` : ""}`);
  }

  // ── Orderbook (Public) ───────────────────────────────────────────────────

  async getOrderbook(tokenId: string): Promise<PolymarketOrderbook> {
    return this.fetchJson(`${this.host}/book?token_id=${tokenId}`);
  }

  async getOrderbooks(
    tokenIds: string[]
  ): Promise<PolymarketOrderbook[]> {
    return this.fetchJson(`${this.host}/books`, {
      method: "POST",
      body: JSON.stringify(tokenIds),
    });
  }

  // ── Pricing (Public) ─────────────────────────────────────────────────────

  async getPrice(
    tokenId: string,
    side: "BUY" | "SELL"
  ): Promise<PolymarketPrice> {
    return this.fetchJson(
      `${this.host}/price?token_id=${tokenId}&side=${side}`
    );
  }

  async getPrices(
    tokenIds: string[]
  ): Promise<Record<string, PolymarketPrice>> {
    const ids = tokenIds.join(",");
    return this.fetchJson(`${this.host}/prices?token_ids=${ids}`);
  }

  async getMidpoint(tokenId: string): Promise<PolymarketMidpoint> {
    return this.fetchJson(`${this.host}/midpoint?token_id=${tokenId}`);
  }

  async getSpread(tokenId: string): Promise<PolymarketSpread> {
    return this.fetchJson(`${this.host}/spread?token_id=${tokenId}`);
  }

  async getLastTradePrice(
    tokenId: string
  ): Promise<{ price: string }> {
    return this.fetchJson(
      `${this.host}/last_trade_price?token_id=${tokenId}`
    );
  }

  // ── Trades (Public) ──────────────────────────────────────────────────────

  async getMarketTrades(
    conditionId: string,
    params?: { limit?: number }
  ): Promise<PolymarketTrade[]> {
    const query = params?.limit ? `?limit=${params.limit}` : "";
    return this.fetchJson(
      `${this.host}/market/${conditionId}/trades${query}`
    );
  }

  // ── Market Parameters (Public) ───────────────────────────────────────────

  async getTickSize(tokenId: string): Promise<{ minimum_tick_size: number }> {
    return this.fetchJson(`${this.host}/tick-size?token_id=${tokenId}`);
  }

  async getNegRisk(tokenId: string): Promise<{ neg_risk: boolean }> {
    return this.fetchJson(`${this.host}/neg-risk?token_id=${tokenId}`);
  }

  async getFeeRate(tokenId: string): Promise<{ fee_rate_bps: number }> {
    return this.fetchJson(
      `${this.host}/fee-rate-bps?token_id=${tokenId}`
    );
  }

  // ── Authenticated: Orders ────────────────────────────────────────────────

  async getOpenOrders(params?: {
    market?: string;
    asset_id?: string;
  }): Promise<PolymarketOrder[]> {
    const searchParams = new URLSearchParams();
    if (params?.market) searchParams.set("market", params.market);
    if (params?.asset_id) searchParams.set("asset_id", params.asset_id);

    const path = `/orders${searchParams.toString() ? `?${searchParams}` : ""}`;
    const headers = this.getL2Headers("GET", path);

    return this.fetchJson(`${this.host}${path}`, { headers });
  }

  async getOrder(orderId: string): Promise<PolymarketOrder> {
    const path = `/order/${orderId}`;
    const headers = this.getL2Headers("GET", path);
    return this.fetchJson(`${this.host}${path}`, { headers });
  }

  async cancelOrder(orderId: string): Promise<{ success: boolean }> {
    const path = `/order/${orderId}`;
    const headers = this.getL2Headers("DELETE", path);
    return this.fetchJson(`${this.host}${path}`, {
      method: "DELETE",
      headers,
    });
  }

  async cancelAllOrders(params?: {
    market?: string;
    asset_id?: string;
  }): Promise<{ canceled: string[] }> {
    const searchParams = new URLSearchParams();
    if (params?.market) searchParams.set("market", params.market);
    if (params?.asset_id) searchParams.set("asset_id", params.asset_id);

    const path = `/orders${searchParams.toString() ? `?${searchParams}` : ""}`;
    const headers = this.getL2Headers("DELETE", path);

    return this.fetchJson(`${this.host}${path}`, {
      method: "DELETE",
      headers,
    });
  }

  // ── Authenticated: Trades ────────────────────────────────────────────────

  async getUserTrades(params?: {
    market?: string;
    asset_id?: string;
    before?: string;
    after?: string;
  }): Promise<PolymarketTrade[]> {
    const searchParams = new URLSearchParams();
    if (params?.market) searchParams.set("market", params.market);
    if (params?.asset_id) searchParams.set("asset_id", params.asset_id);
    if (params?.before) searchParams.set("before", params.before);
    if (params?.after) searchParams.set("after", params.after);

    const path = `/trades${searchParams.toString() ? `?${searchParams}` : ""}`;
    const headers = this.getL2Headers("GET", path);

    return this.fetchJson(`${this.host}${path}`, { headers });
  }

  // ── Authenticated: Balance ───────────────────────────────────────────────

  async getBalance(
    assetType: "USDC" | "CTF",
    tokenId?: string
  ): Promise<BalanceAllowance> {
    let path = `/balance-allowance?asset_type=${assetType}`;
    if (tokenId) path += `&token_id=${tokenId}`;
    const headers = this.getL2Headers("GET", path);
    return this.fetchJson(`${this.host}${path}`, { headers });
  }
}

// ── Error Class ──────────────────────────────────────────────────────────────

export class PolymarketApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseBody?: string
  ) {
    super(message);
    this.name = "PolymarketApiError";
  }
}

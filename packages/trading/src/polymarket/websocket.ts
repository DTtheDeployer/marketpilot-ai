// =============================================================================
// MarketPilot AI — Polymarket WebSocket Client
// =============================================================================
// Real-time orderbook and price data from Polymarket's WebSocket API.
// =============================================================================

import type {
  WsOrderbookUpdate,
  WsPriceChange,
  WsTradeUpdate,
} from "./types";

const WS_MARKET_URL = "wss://ws-subscriptions-clob.polymarket.com/ws/market";
const PING_INTERVAL_MS = 10_000;

type WsEvent = WsOrderbookUpdate | WsPriceChange | WsTradeUpdate;

interface WsCallbacks {
  onOrderbook?: (data: WsOrderbookUpdate) => void;
  onPriceChange?: (data: WsPriceChange) => void;
  onTrade?: (data: WsTradeUpdate) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  onOpen?: () => void;
}

export class PolymarketWebSocket {
  private ws: WebSocket | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private subscribedAssets: Set<string> = new Set();
  private callbacks: WsCallbacks;
  private url: string;
  private autoReconnect: boolean;
  private reconnectDelayMs: number;

  constructor(options?: {
    url?: string;
    autoReconnect?: boolean;
    reconnectDelayMs?: number;
    callbacks?: WsCallbacks;
  }) {
    this.url = options?.url || WS_MARKET_URL;
    this.autoReconnect = options?.autoReconnect ?? true;
    this.reconnectDelayMs = options?.reconnectDelayMs ?? 5000;
    this.callbacks = options?.callbacks || {};
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.callbacks.onOpen?.();
      this.startPing();

      // Re-subscribe to previously subscribed assets
      if (this.subscribedAssets.size > 0) {
        this.sendSubscribe([...this.subscribedAssets]);
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(String(event.data)) as WsEvent[];
        if (!Array.isArray(data)) return;

        for (const msg of data) {
          switch (msg.event_type) {
            case "book":
              this.callbacks.onOrderbook?.(msg as WsOrderbookUpdate);
              break;
            case "price_change":
              this.callbacks.onPriceChange?.(msg as WsPriceChange);
              break;
            case "last_trade_price":
              this.callbacks.onTrade?.(msg as WsTradeUpdate);
              break;
          }
        }
      } catch {
        // Non-JSON messages (e.g. pong responses) are ignored
      }
    };

    this.ws.onerror = (event) => {
      this.callbacks.onError?.(new Error(`WebSocket error: ${event}`));
    };

    this.ws.onclose = () => {
      this.stopPing();
      this.callbacks.onClose?.();

      if (this.autoReconnect) {
        this.reconnectTimeout = setTimeout(() => {
          this.connect();
        }, this.reconnectDelayMs);
      }
    };
  }

  subscribe(assetIds: string[]): void {
    for (const id of assetIds) {
      this.subscribedAssets.add(id);
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe(assetIds);
    }
  }

  unsubscribe(assetIds: string[]): void {
    for (const id of assetIds) {
      this.subscribedAssets.delete(id);
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "unsubscribe",
          asset_ids: assetIds,
        })
      );
    }
  }

  disconnect(): void {
    this.autoReconnect = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stopPing();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscribedAssets.clear();
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get subscribedCount(): number {
    return this.subscribedAssets.size;
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  private sendSubscribe(assetIds: string[]): void {
    this.ws?.send(
      JSON.stringify({
        type: "subscribe",
        asset_ids: assetIds,
      })
    );
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send("PING");
      }
    }, PING_INTERVAL_MS);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

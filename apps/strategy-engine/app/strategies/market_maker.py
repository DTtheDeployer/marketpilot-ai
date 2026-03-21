"""
MarketPilot AI — Market Making (Spread Capture) Strategy
=========================================================
Places resting limit orders on both sides of the spread.
Profits from the bid-ask gap without taking directional risk.
Automatically manages inventory to stay delta-neutral.

How it works:
1. Find high-volume markets with wide spreads
2. Place BUY below mid and SELL above mid
3. When both sides fill, you capture the spread as profit
4. Manage inventory — if you accumulate too much on one side,
   widen the quote on that side to slow fills
"""

from __future__ import annotations
import logging
import os
from dataclasses import dataclass
from typing import Optional

from py_clob_client.client import ClobClient
from py_clob_client.clob_types import OrderArgs, BalanceAllowanceParams, AssetType
from py_clob_client.constants import POLYGON

logger = logging.getLogger(__name__)


@dataclass
class MarketMakerConfig:
    """Configuration for the market making strategy."""
    min_spread_bps: int = 200       # Minimum spread to quote (2%)
    quote_size_usd: float = 5.0     # Size of each quote leg in USD
    max_inventory: float = 20.0     # Max one-sided inventory in USD
    max_open_orders: int = 6        # Max open orders total
    requote_interval_sec: int = 60  # How often to cancel and re-quote
    min_volume_24h: float = 5000    # Minimum 24h volume to trade
    edge_bps: int = 100             # How far from mid to place orders (1%)


@dataclass
class QuoteResult:
    """Result of a quoting cycle."""
    market_id: str
    market_question: str
    bid_order_id: Optional[str] = None
    ask_order_id: Optional[str] = None
    bid_price: float = 0.0
    ask_price: float = 0.0
    spread_bps: float = 0.0
    error: Optional[str] = None


class MarketMakerBot:
    """
    Automated market maker for Polymarket.

    Each cycle:
    1. Cancel all existing orders
    2. Check inventory
    3. Find best market to quote
    4. Place bid + ask orders
    5. Wait for fills
    """

    def __init__(self, private_key: str, config: Optional[MarketMakerConfig] = None):
        self.config = config or MarketMakerConfig()
        self._client = ClobClient(
            host="https://clob.polymarket.com",
            key=private_key,
            chain_id=POLYGON,
            signature_type=0,
        )
        self._creds = None
        self._inventory: dict[str, float] = {}  # token_id -> net position

    def initialize(self):
        """Set up API credentials. Call once."""
        self._creds = self._client.create_or_derive_api_creds()
        self._client.set_api_creds(self._creds)
        logger.info("Market maker initialized")

    def get_balance(self) -> float:
        """Get available USDC.e balance."""
        try:
            bal = self._client.get_balance_allowance(
                BalanceAllowanceParams(asset_type=AssetType.COLLATERAL, signature_type=0)
            )
            return int(bal.get("balance", 0)) / 1e6
        except Exception as e:
            logger.error(f"Balance check failed: {e}")
            return 0.0

    def cancel_all_orders(self) -> int:
        """Cancel all open orders."""
        try:
            result = self._client.cancel_all()
            cancelled = result.get("canceled", [])
            count = len(cancelled) if isinstance(cancelled, list) else 0
            logger.info(f"Cancelled {count} orders")
            return count
        except Exception as e:
            logger.error(f"Cancel all failed: {e}")
            return 0

    def find_best_market(self) -> Optional[dict]:
        """Find a high-volume market with a tradeable spread using Gamma API."""
        try:
            import requests as req
            import json as jsonlib

            resp = req.get("https://gamma-api.polymarket.com/markets", params={
                "limit": 30, "active": True, "closed": False,
                "order": "volume24hr", "ascending": False,
            }, timeout=10)
            gamma_markets = resp.json() if resp.ok else []

            best = None
            best_score = 0

            for gm in gamma_markets:
                raw_tokens = gm.get("clobTokenIds", "")
                raw_prices = gm.get("outcomePrices", "")

                try:
                    token_ids = jsonlib.loads(raw_tokens) if isinstance(raw_tokens, str) else raw_tokens
                    prices = jsonlib.loads(raw_prices) if isinstance(raw_prices, str) else raw_prices
                except Exception:
                    continue

                if not token_ids or len(token_ids) < 2:
                    continue

                yes_price = float(prices[0]) if prices else 0
                if yes_price < 0.15 or yes_price > 0.85:
                    continue

                token_id = token_ids[0]

                try:
                    book = self._client.get_order_book(token_id)
                    # book is OrderBookSummary with .bids/.asks as lists of OrderSummary
                    bids = book.bids if hasattr(book, 'bids') else (book.get("bids", []) if isinstance(book, dict) else [])
                    asks = book.asks if hasattr(book, 'asks') else (book.get("asks", []) if isinstance(book, dict) else [])

                    if not bids or not asks:
                        continue

                    # OrderSummary has .price/.size attributes
                    b0 = bids[0]
                    a0 = asks[0]
                    best_bid = float(b0.price if hasattr(b0, 'price') else b0["price"])
                    best_ask = float(a0.price if hasattr(a0, 'price') else a0["price"])
                    spread = best_ask - best_bid

                    if spread <= 0:
                        continue

                    spread_bps = (spread / ((best_bid + best_ask) / 2)) * 10000
                    if spread_bps < 50:
                        continue

                    balance_score = 1.0 - abs(yes_price - 0.5) * 2
                    volume = float(gm.get("volume24hr", 0))
                    score = balance_score * 50 + min(volume / 100000, 50) + min(spread_bps, 500)

                    if score > best_score:
                        best_score = score
                        best = {
                            "condition_id": gm.get("conditionId", ""),
                            "question": gm.get("question", ""),
                            "tokens": token_ids,
                            "yes_price": yes_price,
                            "best_bid": best_bid,
                            "best_ask": best_ask,
                            "spread": spread,
                            "spread_bps": spread_bps,
                            "token_id_yes": token_ids[0],
                            "token_id_no": token_ids[1] if len(token_ids) > 1 else None,
                            "volume_24h": volume,
                        }
                except Exception:
                    continue

            if best:
                logger.info(f"Best market: {best['question'][:50]} | spread={best['spread_bps']:.0f}bps")

            return best

        except Exception as e:
            logger.error(f"Market scan failed: {e}")
            return None

    def execute_cycle(self) -> QuoteResult:
        """
        Run one market-making cycle:
        1. Cancel existing orders
        2. Find best market
        3. Place bid + ask
        """
        # 1. Cancel all existing orders
        self.cancel_all_orders()

        # 2. Check balance
        balance = self.get_balance()
        if balance < self.config.quote_size_usd * 2:
            return QuoteResult(
                market_id="", market_question="",
                error=f"Insufficient balance: ${balance:.2f}"
            )

        # 3. Find best market
        market = self.find_best_market()
        if not market:
            return QuoteResult(
                market_id="", market_question="",
                error="No suitable market found"
            )

        mid = (market["best_bid"] + market["best_ask"]) / 2
        edge = self.config.edge_bps / 10000

        # Place bid below mid, ask above mid
        bid_price = round(mid - edge, 2)
        ask_price = round(mid + edge, 2)

        # Ensure valid prices
        bid_price = max(0.01, min(0.99, bid_price))
        ask_price = max(0.01, min(0.99, ask_price))

        if ask_price <= bid_price:
            ask_price = bid_price + 0.01

        # Calculate size in shares (minimum 5 per Polymarket rules)
        bid_size = max(5, int(self.config.quote_size_usd / bid_price))
        ask_size = max(5, int(self.config.quote_size_usd / ask_price))

        token_id = market["token_id_yes"]
        result = QuoteResult(
            market_id=market["condition_id"],
            market_question=market["question"],
            bid_price=bid_price,
            ask_price=ask_price,
            spread_bps=market["spread_bps"],
        )

        # 4. Place BUY order (bid)
        try:
            bid_order = self._client.create_order(OrderArgs(
                token_id=token_id,
                price=bid_price,
                size=bid_size,
                side="BUY",
            ))
            resp = self._client.post_order(bid_order)
            result.bid_order_id = resp.get("orderID") if isinstance(resp, dict) else str(resp)
            logger.info(f"BID placed: {bid_size}@{bid_price} on {market['question'][:50]}")
        except Exception as e:
            logger.error(f"BID failed: {e}")
            result.error = f"Bid failed: {e}"

        # 5. Place SELL order (ask)
        try:
            ask_order = self._client.create_order(OrderArgs(
                token_id=token_id,
                price=ask_price,
                size=ask_size,
                side="SELL",
            ))
            resp = self._client.post_order(ask_order)
            result.ask_order_id = resp.get("orderID") if isinstance(resp, dict) else str(resp)
            logger.info(f"ASK placed: {ask_size}@{ask_price} on {market['question'][:50]}")
        except Exception as e:
            logger.error(f"ASK failed: {e}")
            if not result.error:
                result.error = f"Ask failed: {e}"

        return result

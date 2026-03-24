"""
MarketPilot AI — Polymarket Live Execution Client
==================================================
Wraps the official py-clob-client SDK for live order execution.
Requires ELITE plan + jurisdiction eligibility + risk acknowledgement.

Also includes:
- GammaClient for market discovery via Gamma API
- PaperExecutor for simulated fills (non-Operator users)
"""

from __future__ import annotations

import logging
import os
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Optional

import httpx
from py_clob_client.client import ClobClient
from py_clob_client.clob_types import (
    OrderArgs,
    OrderType,
    PartialCreateOrderOptions,
)
from py_clob_client.constants import POLYGON

from app.models.strategy import TradeIntent
from app.paper_execution.analysis import TradeAnalysisMetrics, compute_trade_analysis
from app.paper_execution.fill_models import (
    compute_fee,
    generate_synthetic_orderbook,
    should_reject_fill,
    simulate_fill_latency,
    walk_orderbook,
)

logger = logging.getLogger(__name__)

CLOB_HOST = "https://clob.polymarket.com"
GAMMA_HOST = "https://gamma-api.polymarket.com"
INTERNAL_API_URL = os.getenv("INTERNAL_API_URL", "http://localhost:3001")


# ── Shared Result Type ──────────────────────────────────────────────────────


@dataclass
class ExecutionResult:
    """Result of a live or paper order execution attempt."""
    success: bool
    order_id: Optional[str] = None
    filled_size: float = 0.0
    filled_price: float = 0.0
    error: Optional[str] = None
    raw_response: Optional[dict] = None
    # Enhanced fields for paper trading analysis
    slippage_bps: float = 0.0
    fee: float = 0.0
    fee_type: str = "taker"
    simulated_latency_ms: float = 0.0
    is_partial: bool = False
    tranches: list[dict] = field(default_factory=list)
    analysis: Optional[dict] = None


# ── Live Executor ───────────────────────────────────────────────────────────


class PolymarketExecutor:
    """
    Live execution adapter for Polymarket CLOB.

    Uses the official py-clob-client SDK for EIP-712 signed order
    creation and submission. All orders pass through the risk engine
    before reaching this class.
    """

    def __init__(
        self,
        private_key: str,
        host: str = CLOB_HOST,
        chain_id: int = POLYGON,
        signature_type: int = 0,  # 0=EOA, 1=POLY_PROXY, 2=GNOSIS_SAFE
        funder: Optional[str] = None,  # Proxy wallet funder address
    ):
        kwargs: dict[str, Any] = {
            "host": host,
            "key": private_key,
            "chain_id": chain_id,
            "signature_type": signature_type,
        }
        if funder:
            kwargs["funder"] = funder

        self._client = ClobClient(**kwargs)
        self._funder = funder
        self._credentials = None
        self._initialized = False

    def initialize(self) -> None:
        """Create or derive API credentials. Call once before trading.

        Checks for cached credentials via internal API first.
        Falls back to deriving from the private key if not cached.
        """
        if self._initialized:
            return

        # Try loading cached credentials from internal API
        cached = self._load_cached_creds()
        if cached:
            self._client.set_api_creds(cached)
            self._credentials = cached
            self._initialized = True
            logger.info("Polymarket executor initialized from cached credentials")
            return

        # Derive fresh credentials
        self._credentials = self._client.create_or_derive_api_creds()
        self._client.set_api_creds(self._credentials)
        self._initialized = True
        logger.info("Polymarket executor initialized with fresh API credentials")

        # Cache the credentials for future use
        self._store_creds(self._credentials)

    def _load_cached_creds(self) -> Optional[Any]:
        """Try to load cached L2 creds from the internal API."""
        try:
            identifier = self._funder or "default"
            resp = httpx.get(
                f"{INTERNAL_API_URL}/internal/wallet/creds/{identifier}",
                timeout=5,
            )
            if resp.status_code == 200:
                data = resp.json()
                if data.get("api_key") and data.get("secret") and data.get("passphrase"):
                    # Reconstruct creds object matching py-clob-client format
                    from py_clob_client.clob_types import ApiCreds
                    return ApiCreds(
                        api_key=data["api_key"],
                        api_secret=data["secret"],
                        api_passphrase=data["passphrase"],
                    )
        except Exception as e:
            logger.debug(f"No cached credentials found: {e}")
        return None

    def _store_creds(self, creds: Any) -> None:
        """Store L2 creds in the internal API for encrypted DB storage."""
        try:
            identifier = self._funder or "default"
            httpx.post(
                f"{INTERNAL_API_URL}/internal/wallet/creds",
                json={
                    "identifier": identifier,
                    "api_key": creds.api_key,
                    "secret": creds.api_secret,
                    "passphrase": creds.api_passphrase,
                },
                timeout=5,
            )
            logger.debug("Credentials cached in internal API")
        except Exception as e:
            logger.debug(f"Failed to cache credentials: {e}")

    def _ensure_initialized(self) -> None:
        if not self._initialized:
            raise RuntimeError(
                "PolymarketExecutor not initialized. Call initialize() first."
            )

    # ── Market Data ─────────────────────────────────────────────────────────

    def get_markets(self, next_cursor: str = "") -> dict:
        return self._client.get_markets(next_cursor=next_cursor)

    def get_market(self, condition_id: str) -> dict:
        return self._client.get_market(condition_id)

    def get_orderbook(self, token_id: str) -> dict:
        return self._client.get_order_book(token_id)

    def get_midpoint(self, token_id: str) -> dict:
        return self._client.get_midpoint(token_id)

    def get_last_trade_price(self, token_id: str) -> dict:
        return self._client.get_last_trade_price(token_id)

    def get_tick_size(self, token_id: str) -> float:
        result = self._client.get_tick_size(token_id)
        return float(result.get("minimum_tick_size", 0.01))

    # ── Order Execution ─────────────────────────────────────────────────────

    def execute_limit_order(
        self,
        token_id: str,
        side: str,
        price: float,
        size: float,
        order_type: str = "GTC",
        neg_risk: bool = False,
    ) -> ExecutionResult:
        self._ensure_initialized()

        try:
            logger.info(f"Placing order: {side} {size}@{price} token={token_id[:20]}...")

            ot_map = {
                "GTC": OrderType.GTC,
                "GTD": OrderType.GTD,
                "FOK": OrderType.FOK,
                "FAK": OrderType.FAK,
            }

            order_args = OrderArgs(
                token_id=token_id,
                price=price,
                size=size,
                side=side,
            )

            # Pass neg_risk via options if applicable
            options = None
            if neg_risk:
                options = PartialCreateOrderOptions(neg_risk=True)

            signed_order = self._client.create_order(order_args, options=options)
            logger.info("Signed order created, posting to CLOB...")

            ot_enum = ot_map.get(order_type, OrderType.GTC)
            response = self._client.post_order(signed_order, orderType=ot_enum)

            if isinstance(response, dict):
                order_id = response.get("orderID") or response.get("id") or response.get("order_id")
            else:
                order_id = str(response)

            logger.info(
                f"Limit order placed: {side} {size}@{price} "
                f"token={token_id[:12]}... order_id={order_id}"
            )

            return ExecutionResult(
                success=True,
                order_id=order_id,
                filled_size=0,
                filled_price=price,
                raw_response=response if isinstance(response, dict) else {"raw": str(response)},
            )

        except Exception as e:
            logger.error(f"Limit order failed: {e}")
            return ExecutionResult(success=False, error=str(e))

    def execute_market_order(
        self,
        token_id: str,
        side: str,
        size: float,
        neg_risk: bool = False,
    ) -> ExecutionResult:
        self._ensure_initialized()
        try:
            price_data = self._client.get_price(token_id, side.upper())
            price = float(price_data.get("price", 0))
            if price <= 0 or price >= 1:
                return ExecutionResult(success=False, error=f"Invalid market price: {price}")
            return self.execute_limit_order(
                token_id=token_id, side=side, price=price,
                size=size, order_type="FOK", neg_risk=neg_risk,
            )
        except Exception as e:
            logger.error(f"Market order failed: {e}")
            return ExecutionResult(success=False, error=str(e))

    def execute_trade_intent(
        self, intent: TradeIntent, token_id: str, neg_risk: bool = False
    ) -> ExecutionResult:
        if intent.action == "HOLD":
            return ExecutionResult(success=True, error="No action (HOLD)")
        side = "BUY" if intent.action == "BUY" else "SELL"
        return self.execute_limit_order(
            token_id=token_id, side=side,
            price=intent.price, size=intent.size, neg_risk=neg_risk,
        )

    # ── Order Management ────────────────────────────────────────────────────

    def cancel_order(self, order_id: str) -> bool:
        self._ensure_initialized()
        try:
            self._client.cancel(order_id)
            logger.info(f"Order cancelled: {order_id}")
            return True
        except Exception as e:
            logger.error(f"Cancel failed for {order_id}: {e}")
            return False

    def cancel_all_orders(self) -> int:
        self._ensure_initialized()
        try:
            result = self._client.cancel_all()
            cancelled = len(result.get("canceled", []))
            logger.info(f"Cancelled {cancelled} orders")
            return cancelled
        except Exception as e:
            logger.error(f"Cancel all failed: {e}")
            return 0

    def get_open_orders(self, market: str = None) -> list:
        self._ensure_initialized()
        params = {}
        if market:
            params["market"] = market
        return self._client.get_orders(**params)

    # ── Account ─────────────────────────────────────────────────────────────

    def get_balance(self) -> dict:
        self._ensure_initialized()
        return self._client.get_balance_allowance(asset_type="USDC")

    def is_healthy(self) -> bool:
        try:
            self._client.get_ok()
            return True
        except Exception:
            return False


# ── Gamma API Client ────────────────────────────────────────────────────────


class GammaClient:
    """
    Polymarket Gamma API client for market discovery.
    Provides richer metadata than the CLOB API (categories, volume, etc.).
    """

    BASE = GAMMA_HOST

    def __init__(self, timeout: float = 15.0):
        self._client = httpx.AsyncClient(timeout=timeout)

    async def get_markets(
        self,
        category: Optional[str] = None,
        min_volume: float = 0,
        min_liquidity: float = 0,
        limit: int = 50,
    ) -> list[dict]:
        """Fetch active markets, optionally filtered."""
        params: dict[str, Any] = {
            "active": "true",
            "closed": "false",
            "limit": str(limit),
            "order": "volume24hr",
            "ascending": "false",
        }
        if category:
            params["tag"] = category

        resp = await self._client.get(f"{self.BASE}/markets", params=params)
        resp.raise_for_status()
        markets = resp.json()

        # Apply client-side filters
        if min_volume > 0 or min_liquidity > 0:
            markets = [
                m for m in markets
                if float(m.get("volume24hr", 0)) >= min_volume
                and float(m.get("liquidityClob", 0)) >= min_liquidity
            ]

        return markets

    async def get_market_tokens(self, condition_id: str) -> dict:
        """Get CLOB token IDs for YES/NO outcomes."""
        resp = await self._client.get(
            f"{self.BASE}/markets",
            params={"condition_id": condition_id},
        )
        resp.raise_for_status()
        data = resp.json()

        if not data:
            return {"yes_token": None, "no_token": None}

        market = data[0] if isinstance(data, list) else data
        import json
        raw_tokens = market.get("clobTokenIds", "[]")
        tokens = json.loads(raw_tokens) if isinstance(raw_tokens, str) else raw_tokens

        return {
            "yes_token": tokens[0] if len(tokens) > 0 else None,
            "no_token": tokens[1] if len(tokens) > 1 else None,
            "condition_id": condition_id,
        }

    async def get_market_metadata(self, condition_id: str) -> dict:
        """Get full market metadata."""
        resp = await self._client.get(
            f"{self.BASE}/markets",
            params={"condition_id": condition_id},
        )
        resp.raise_for_status()
        data = resp.json()

        if not data:
            return {}

        market = data[0] if isinstance(data, list) else data
        return {
            "condition_id": condition_id,
            "question": market.get("question", ""),
            "description": market.get("description", ""),
            "category": market.get("category", ""),
            "neg_risk": market.get("negRisk", False),
            "end_date": market.get("endDate", ""),
            "volume_24h": float(market.get("volume24hr", 0)),
            "liquidity": float(market.get("liquidityClob", 0)),
            "active": market.get("active", False),
            "closed": market.get("closed", False),
        }

    async def close(self):
        await self._client.aclose()


# ── Paper Executor ──────────────────────────────────────────────────────────


class PaperExecutor:
    """
    Paper trading executor that mirrors PolymarketExecutor's interface.
    Used for all non-Operator users. Simulates fills with realistic
    orderbook walking, dynamic fees, latency, and rejection modelling.
    """

    def __init__(self):
        self._open_orders: list[dict] = []
        self._order_counter = 0
        self._initialized = True  # Always ready
        self._cumulative_volume: float = 0.0
        self._trade_analyses: list[dict] = []

    def initialize(self) -> None:
        """No-op — paper executor is always ready."""
        pass

    def _next_order_id(self) -> str:
        self._order_counter += 1
        return f"paper-{uuid.uuid4().hex[:12]}"

    def _report_trade(self, order: dict) -> None:
        """Report a paper trade to the internal API for DB tracking."""
        try:
            httpx.post(
                f"{INTERNAL_API_URL}/internal/paper-trade",
                json=order,
                timeout=5,
            )
        except Exception as e:
            logger.debug(f"Failed to report paper trade: {e}")

    # ── Execution (mirrors PolymarketExecutor) ──────────────────────────────

    def execute_limit_order(
        self,
        token_id: str,
        side: str,
        price: float,
        size: float,
        order_type: str = "GTC",
        neg_risk: bool = False,
        midpoint: float | None = None,
        liquidity: float = 100_000,
        spread: float = 0.02,
    ) -> ExecutionResult:
        order_id = self._next_order_id()
        mid = midpoint if midpoint is not None else price

        # FOK/FAK = immediate fill or reject (simulate market order)
        if order_type in ("FOK", "FAK"):
            return self._simulate_realistic_fill(
                order_id, token_id, side, price, size, mid, liquidity, spread, is_maker=False
            )

        # GTC/GTD = resting limit order
        order = {
            "order_id": order_id,
            "token_id": token_id,
            "side": side,
            "price": price,
            "size": size,
            "order_type": order_type,
            "status": "OPEN",
            "created_at": time.time(),
        }
        self._open_orders.append(order)

        logger.info(f"[PAPER] Limit order queued: {side} {size}@{price} id={order_id}")

        # Simulate: limit orders near midpoint fill immediately
        if abs(mid - price) / max(price, 0.01) < 0.05:
            return self._simulate_realistic_fill(
                order_id, token_id, side, price, size, mid, liquidity, spread, is_maker=True
            )

        return ExecutionResult(
            success=True,
            order_id=order_id,
            filled_size=0,
            filled_price=price,
        )

    def execute_market_order(
        self,
        token_id: str,
        side: str,
        size: float,
        neg_risk: bool = False,
        midpoint: float | None = None,
        liquidity: float = 100_000,
        spread: float = 0.02,
    ) -> ExecutionResult:
        mid = midpoint if midpoint is not None else 0.50
        return self._simulate_realistic_fill(
            self._next_order_id(), token_id, side, mid, size,
            mid, liquidity, spread, is_maker=False,
        )

    def execute_trade_intent(
        self, intent: TradeIntent, token_id: str, neg_risk: bool = False
    ) -> ExecutionResult:
        if intent.action == "HOLD":
            return ExecutionResult(success=True, error="No action (HOLD)")
        side = "BUY" if intent.action == "BUY" else "SELL"
        return self.execute_limit_order(
            token_id=token_id, side=side,
            price=intent.price, size=intent.size, neg_risk=neg_risk,
        )

    def _simulate_realistic_fill(
        self,
        order_id: str,
        token_id: str,
        side: str,
        price: float,
        size: float,
        midpoint: float,
        liquidity: float,
        spread: float,
        is_maker: bool,
    ) -> ExecutionResult:
        """Simulate a fill using realistic orderbook walking and fee models."""

        # 1. Check for rejection
        rejected, rejection_reason = should_reject_fill(liquidity, spread)
        if rejected:
            logger.info(f"[PAPER] Order rejected: {rejection_reason} id={order_id}")

            analysis = {
                "was_rejected": True,
                "rejection_reason": rejection_reason,
                "slippage_bps": 0,
                "fee_cost_usd": 0,
                "simulated_latency_ms": 0,
            }
            self._trade_analyses.append(analysis)

            return ExecutionResult(
                success=False,
                order_id=order_id,
                error=f"Rejected: {rejection_reason}",
                analysis=analysis,
            )

        # 2. Generate synthetic orderbook and walk it
        liquidity_factor = max(0.3, liquidity / 100_000)
        bids, asks = generate_synthetic_orderbook(
            midpoint=midpoint,
            spread=spread,
            liquidity_factor=liquidity_factor,
        )

        book_side = asks if side.upper() == "BUY" else bids
        fill_result = walk_orderbook(
            side=side,
            size=size,
            orderbook_levels=book_side,
            midpoint=midpoint,
        )

        if fill_result.rejected:
            analysis = {
                "was_rejected": True,
                "rejection_reason": fill_result.rejection_reason,
                "slippage_bps": 0,
                "fee_cost_usd": 0,
                "simulated_latency_ms": 0,
            }
            self._trade_analyses.append(analysis)

            return ExecutionResult(
                success=False,
                order_id=order_id,
                error=f"Fill failed: {fill_result.rejection_reason}",
                analysis=analysis,
            )

        fill_price = fill_result.avg_fill_price
        fill_size = fill_result.filled_size

        # 3. Compute fee
        notional = fill_price * fill_size
        fee = compute_fee(notional, self._cumulative_volume, is_maker)
        self._cumulative_volume += notional

        # 4. Simulate latency
        latency_ms = simulate_fill_latency()

        logger.info(
            f"[PAPER] Filled: {side} {fill_size}@{fill_price} "
            f"slip={fill_result.slippage_bps:.1f}bps fee={fee:.4f} "
            f"latency={latency_ms:.0f}ms id={order_id}"
        )

        # 5. Build analysis
        tranches_list = [{"price": t.price, "size": t.size} for t in fill_result.tranches]

        analysis_metrics = compute_trade_analysis(
            side=side,
            requested_size=size,
            requested_price=price,
            fill_price=fill_price,
            fill_size=fill_size,
            midpoint=midpoint,
            spread=spread,
            fee=fee,
            fee_type="maker" if is_maker else "taker",
            slippage_bps=fill_result.slippage_bps,
            latency_ms=latency_ms,
            tranches_count=len(fill_result.tranches),
            is_partial=fill_result.is_partial,
            was_rejected=False,
            rejection_reason=None,
            queue_position=None,
            estimated_wait_ticks=None,
            pnl=0.0,
        )

        analysis_dict = {
            "slippage_bps": analysis_metrics.slippage_bps,
            "slippage_cost_usd": analysis_metrics.slippage_cost_usd,
            "spread_cost_usd": analysis_metrics.spread_cost_usd,
            "fee_cost_usd": analysis_metrics.fee_cost_usd,
            "fee_type": analysis_metrics.fee_type,
            "total_execution_cost_usd": analysis_metrics.total_execution_cost_usd,
            "fill_rate": analysis_metrics.fill_rate,
            "is_partial": analysis_metrics.is_partial,
            "tranches_count": analysis_metrics.tranches_count,
            "simulated_latency_ms": analysis_metrics.simulated_latency_ms,
            "was_rejected": False,
            "rejection_reason": None,
        }
        self._trade_analyses.append(analysis_dict)

        # 6. Report trade
        trade = {
            "order_id": order_id,
            "token_id": token_id,
            "side": side,
            "price": fill_price,
            "size": fill_size,
            "fee": fee,
            "slippage_bps": fill_result.slippage_bps,
            "status": "PARTIALLY_FILLED" if fill_result.is_partial else "FILLED",
            "filled_at": time.time(),
        }
        self._report_trade(trade)

        # Remove from open orders if it was queued
        self._open_orders = [o for o in self._open_orders if o["order_id"] != order_id]

        return ExecutionResult(
            success=True,
            order_id=order_id,
            filled_size=fill_size,
            filled_price=fill_price,
            slippage_bps=fill_result.slippage_bps,
            fee=fee,
            fee_type="maker" if is_maker else "taker",
            simulated_latency_ms=latency_ms,
            is_partial=fill_result.is_partial,
            tranches=tranches_list,
            analysis=analysis_dict,
        )

    # ── Order Management ────────────────────────────────────────────────────

    def cancel_order(self, order_id: str) -> bool:
        before = len(self._open_orders)
        self._open_orders = [o for o in self._open_orders if o["order_id"] != order_id]
        cancelled = len(self._open_orders) < before
        if cancelled:
            logger.info(f"[PAPER] Order cancelled: {order_id}")
        return cancelled

    def cancel_all_orders(self) -> int:
        count = len(self._open_orders)
        self._open_orders.clear()
        logger.info(f"[PAPER] Cancelled {count} orders")
        return count

    def get_open_orders(self, market: str = None) -> list:
        return list(self._open_orders)

    # ── Account ─────────────────────────────────────────────────────────────

    def get_balance(self) -> dict:
        return {"balance": "10000000000", "allowances": {}}  # $10,000 paper balance

    def is_healthy(self) -> bool:
        return True

    def get_trade_analyses(self) -> list[dict]:
        """Return all trade analysis records."""
        return list(self._trade_analyses)

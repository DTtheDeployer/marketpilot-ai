"""
MarketPilot AI — Polymarket Live Execution Client
==================================================
Wraps the official py-clob-client SDK for live order execution.
Requires ELITE plan + jurisdiction eligibility + risk acknowledgement.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

from py_clob_client.client import ClobClient
from py_clob_client.clob_types import (
    OrderArgs,
    MarketOrderArgs,
    OrderType,
)
from py_clob_client.constants import POLYGON

from app.models.strategy import TradeIntent, RiskLimits

logger = logging.getLogger(__name__)

CLOB_HOST = "https://clob.polymarket.com"


@dataclass
class ExecutionResult:
    """Result of a live order execution attempt."""
    success: bool
    order_id: Optional[str] = None
    filled_size: float = 0.0
    filled_price: float = 0.0
    error: Optional[str] = None
    raw_response: Optional[dict] = None


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
    ):
        self._client = ClobClient(
            host=host,
            key=private_key,
            chain_id=chain_id,
            signature_type=signature_type,
        )
        self._credentials = None
        self._initialized = False

    def initialize(self) -> None:
        """Create or derive API credentials. Call once before trading."""
        if self._initialized:
            return

        self._credentials = self._client.create_or_derive_api_creds()
        self._client.set_api_creds(self._credentials)
        self._initialized = True
        logger.info("Polymarket executor initialized with API credentials")

    def _ensure_initialized(self) -> None:
        if not self._initialized:
            raise RuntimeError(
                "PolymarketExecutor not initialized. Call initialize() first."
            )

    # ── Market Data ─────────────────────────────────────────────────────────

    def get_markets(self, next_cursor: str = "") -> dict:
        """Fetch paginated market list."""
        return self._client.get_markets(next_cursor=next_cursor)

    def get_market(self, condition_id: str) -> dict:
        """Fetch a single market by condition ID."""
        return self._client.get_market(condition_id)

    def get_orderbook(self, token_id: str) -> dict:
        """Fetch current orderbook for a token."""
        return self._client.get_order_book(token_id)

    def get_midpoint(self, token_id: str) -> dict:
        """Fetch midpoint price for a token."""
        return self._client.get_midpoint(token_id)

    def get_last_trade_price(self, token_id: str) -> dict:
        """Fetch last trade price for a token."""
        return self._client.get_last_trade_price(token_id)

    def get_tick_size(self, token_id: str) -> float:
        """Get minimum tick size for price precision."""
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
        """
        Place a limit order on Polymarket.

        Args:
            token_id: The outcome token to trade
            side: "BUY" or "SELL"
            price: Limit price (0.0 to 1.0)
            size: Number of shares
            order_type: GTC, GTD, FOK, or FAK
            neg_risk: Whether this is a negative risk market
        """
        self._ensure_initialized()

        try:
            logger.info(f"Placing order: {side} {size}@{price} token={token_id[:20]}...")

            # Map order type — skip tick_size fetch to avoid errors
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

            # Create signed order
            signed_order = self._client.create_order(order_args)
            logger.info(f"Signed order created, posting to CLOB...")

            # Post to CLOB
            ot_enum = ot_map.get(order_type, OrderType.GTC)
            response = self._client.post_order(signed_order, orderType=ot_enum)

            # Response may be a dict or a string depending on SDK version
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
                filled_size=0,  # Limit orders may not fill immediately
                filled_price=price,
                raw_response=response,
            )

        except Exception as e:
            logger.error(f"Limit order failed: {e}")
            return ExecutionResult(
                success=False,
                error=str(e),
            )

    def execute_market_order(
        self,
        token_id: str,
        side: str,
        size: float,
        neg_risk: bool = False,
    ) -> ExecutionResult:
        """
        Place a market order (FOK) on Polymarket.

        Uses the current best price with FOK to fill immediately or reject.
        """
        self._ensure_initialized()

        try:
            # Get current best price
            price_data = self._client.get_price(
                token_id, side.upper()
            )
            price = float(price_data.get("price", 0))

            if price <= 0 or price >= 1:
                return ExecutionResult(
                    success=False,
                    error=f"Invalid market price: {price}",
                )

            # Use FOK for market-like behavior
            return self.execute_limit_order(
                token_id=token_id,
                side=side,
                price=price,
                size=size,
                order_type="FOK",
                neg_risk=neg_risk,
            )

        except Exception as e:
            logger.error(f"Market order failed: {e}")
            return ExecutionResult(
                success=False,
                error=str(e),
            )

    def execute_trade_intent(
        self, intent: TradeIntent, token_id: str, neg_risk: bool = False
    ) -> ExecutionResult:
        """
        Execute a TradeIntent from the strategy engine.

        This is the primary entry point used by the bot execution loop.
        """
        if intent.action == "HOLD":
            return ExecutionResult(success=True, error="No action (HOLD)")

        side = "BUY" if intent.action == "BUY" else "SELL"

        return self.execute_limit_order(
            token_id=token_id,
            side=side,
            price=intent.price,
            size=intent.size,
            neg_risk=neg_risk,
        )

    # ── Order Management ────────────────────────────────────────────────────

    def cancel_order(self, order_id: str) -> bool:
        """Cancel a single open order."""
        self._ensure_initialized()
        try:
            self._client.cancel(order_id)
            logger.info(f"Order cancelled: {order_id}")
            return True
        except Exception as e:
            logger.error(f"Cancel failed for {order_id}: {e}")
            return False

    def cancel_all_orders(self) -> int:
        """Cancel all open orders. Returns count of cancelled orders."""
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
        """Fetch open orders, optionally filtered by market."""
        self._ensure_initialized()
        params = {}
        if market:
            params["market"] = market
        return self._client.get_orders(**params)

    # ── Account ─────────────────────────────────────────────────────────────

    def get_balance(self) -> dict:
        """Get USDC balance and allowance."""
        self._ensure_initialized()
        return self._client.get_balance_allowance(asset_type="USDC")

    def is_healthy(self) -> bool:
        """Check if the Polymarket API is reachable."""
        try:
            self._client.get_ok()
            return True
        except Exception:
            return False

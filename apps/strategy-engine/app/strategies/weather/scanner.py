"""
MarketPilot AI — Weather Arbitrage Scanner
==========================================
Main orchestrator that ties together NOAA forecasts, Polymarket weather
markets, the arb strategy, position management, trade execution, and
Telegram notifications into a continuous scanning loop.

Runs every 2 minutes (configurable), auto-restarts on failure, and
provides a clean interface for the FastAPI router to start/stop.
"""

from __future__ import annotations

import asyncio
import logging
import os
import traceback
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx

from app.data.noaa_client import NOAAClient, CityForecast
from app.strategies.weather.arb import (
    WeatherArbStrategy,
    WeatherMarket,
    TradeSignal,
)
from app.strategies.weather.position_manager import (
    PositionManager,
    Position,
    PositionStatus,
)
from app.monitoring.telegram_bot import TelegramNotifier

logger = logging.getLogger(__name__)

# Gamma Markets API for Polymarket
GAMMA_API_URL = "https://gamma-api.polymarket.com"


class WeatherArbScanner:
    """
    Continuous weather arbitrage scanner.

    Lifecycle:
      1. Fetch NOAA forecasts for all 6 cities
      2. Fetch active Polymarket weather markets from Gamma API
      3. Match forecasts to markets
      4. Generate trade signals
      5. Execute trades via py-clob-client
      6. Monitor open positions for exits
      7. Send Telegram alerts
      8. Sleep and repeat
    """

    def __init__(
        self,
        scan_interval_sec: int = 120,
        bankroll: float = 100.0,
    ):
        self.scan_interval_sec = scan_interval_sec
        self.noaa = NOAAClient()
        self.pm = PositionManager(bankroll=bankroll)
        self.strategy = WeatherArbStrategy(position_manager=self.pm)
        self.telegram = TelegramNotifier()

        self._running = False
        self._task: Optional[asyncio.Task] = None
        self._scan_count = 0
        self._last_scan_at: Optional[datetime] = None
        self._last_error: Optional[str] = None
        self._consecutive_errors = 0
        self._clob_client = None
        self._http_client: Optional[httpx.AsyncClient] = None

        # Collected data from last scan
        self._last_forecasts: dict[str, CityForecast] = {}
        self._last_markets: list[WeatherMarket] = []
        self._last_signals: list[TradeSignal] = []

    # ------------------------------------------------------------------ #
    #  CLOB client (lazy init)                                            #
    # ------------------------------------------------------------------ #

    def _get_clob_client(self):
        """Lazily initialize the Polymarket CLOB client."""
        if self._clob_client is not None:
            return self._clob_client

        pk = os.getenv("POLYMARKET_PRIVATE_KEY")
        if not pk:
            raise RuntimeError("POLYMARKET_PRIVATE_KEY not set")

        from py_clob_client.client import ClobClient
        from py_clob_client.constants import POLYGON

        host = os.getenv("POLYMARKET_CLOB_URL", "https://clob.polymarket.com")
        chain_id = POLYGON

        self._clob_client = ClobClient(
            host,
            key=pk,
            chain_id=chain_id,
        )
        # Derive API credentials
        self._clob_client.set_api_creds(self._clob_client.create_or_derive_api_creds())
        logger.info("CLOB client initialized")
        return self._clob_client

    async def _get_http_client(self) -> httpx.AsyncClient:
        if self._http_client is None or self._http_client.is_closed:
            self._http_client = httpx.AsyncClient(
                timeout=httpx.Timeout(30.0),
                follow_redirects=True,
            )
        return self._http_client

    # ------------------------------------------------------------------ #
    #  Gamma API — fetch weather markets                                  #
    # ------------------------------------------------------------------ #

    async def fetch_weather_markets(self) -> list[WeatherMarket]:
        """Fetch active weather/temperature markets from the Gamma API."""
        client = await self._get_http_client()
        markets: list[WeatherMarket] = []

        try:
            # Search for weather-tagged markets
            for tag in ("weather", "temperature"):
                url = f"{GAMMA_API_URL}/markets"
                params = {
                    "tag": tag,
                    "active": "true",
                    "closed": "false",
                    "limit": "100",
                }
                resp = await client.get(url, params=params)
                if resp.status_code != 200:
                    logger.warning("Gamma API returned %d for tag=%s", resp.status_code, tag)
                    continue

                data = resp.json()
                if not isinstance(data, list):
                    data = data.get("data", data.get("markets", []))

                for raw_market in data:
                    parsed = WeatherMarket.from_gamma_market(raw_market)
                    if parsed and parsed.city:
                        markets.append(parsed)

            # Deduplicate by market_id
            seen: set[str] = set()
            unique: list[WeatherMarket] = []
            for m in markets:
                if m.market_id not in seen:
                    seen.add(m.market_id)
                    unique.append(m)

            logger.info("Fetched %d unique weather markets from Gamma API", len(unique))
            return unique

        except Exception as exc:
            logger.error("Failed to fetch weather markets: %s", exc)
            return []

    # ------------------------------------------------------------------ #
    #  Trade execution via CLOB                                           #
    # ------------------------------------------------------------------ #

    def _execute_trade(self, signal: TradeSignal) -> Optional[str]:
        """
        Place a limit order on Polymarket via py-clob-client.
        Returns order_id on success, None on failure.
        """
        try:
            clob = self._get_clob_client()

            from py_clob_client.clob_types import OrderArgs

            order_args = OrderArgs(
                price=signal.market_price,
                size=signal.kelly_size_usd / signal.market_price,  # shares
                side="BUY",
                token_id=signal.token_id,
            )

            signed_order = clob.create_order(order_args)
            resp = clob.post_order(signed_order, orderType="GTC")

            order_id = None
            if isinstance(resp, dict):
                order_id = resp.get("orderID") or resp.get("id")
            elif hasattr(resp, "orderID"):
                order_id = resp.orderID

            if order_id:
                logger.info(
                    "Order placed: %s %s @ $%.4f, size $%.2f -> order %s",
                    signal.outcome, signal.city, signal.market_price,
                    signal.kelly_size_usd, order_id,
                )
                return str(order_id)
            else:
                logger.warning("Order response missing ID: %s", resp)
                return None

        except Exception as exc:
            logger.error("Trade execution failed for %s: %s", signal.id[:8], exc)
            return None

    def _execute_exit(self, position: Position) -> Optional[str]:
        """Sell a position (sell shares back)."""
        try:
            clob = self._get_clob_client()
            from py_clob_client.clob_types import OrderArgs

            order_args = OrderArgs(
                price=0.50,  # market-ish sell — will match best available
                size=position.shares,
                side="SELL",
                token_id=position.token_id,
            )

            signed_order = clob.create_order(order_args)
            resp = clob.post_order(signed_order, orderType="GTC")

            order_id = None
            if isinstance(resp, dict):
                order_id = resp.get("orderID") or resp.get("id")
            elif hasattr(resp, "orderID"):
                order_id = resp.orderID

            return str(order_id) if order_id else None

        except Exception as exc:
            logger.error("Exit execution failed for position %s: %s", position.id[:8], exc)
            return None

    # ------------------------------------------------------------------ #
    #  Current price lookup                                               #
    # ------------------------------------------------------------------ #

    async def _fetch_current_prices(self, token_ids: list[str]) -> dict[str, float]:
        """Fetch current prices for a list of token IDs from Gamma API."""
        prices: dict[str, float] = {}
        if not token_ids:
            return prices

        client = await self._get_http_client()
        try:
            for tid in token_ids:
                url = f"{GAMMA_API_URL}/markets"
                params = {"token_id": tid}
                resp = await client.get(url, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    if isinstance(data, list) and data:
                        market = data[0]
                        tokens = market.get("tokens", [])
                        for t in tokens:
                            if t.get("token_id") == tid:
                                prices[tid] = float(t.get("price", 0))
                                break
        except Exception as exc:
            logger.warning("Price fetch error: %s", exc)

        return prices

    # ------------------------------------------------------------------ #
    #  Single scan cycle                                                  #
    # ------------------------------------------------------------------ #

    async def run_single_scan(self) -> dict:
        """Execute one full scan cycle. Returns a summary dict."""
        self._scan_count += 1
        scan_id = self._scan_count
        started_at = datetime.now(timezone.utc)
        logger.info("=== Weather Arb Scan #%d starting ===", scan_id)

        result = {
            "scan_id": scan_id,
            "started_at": started_at.isoformat(),
            "forecasts_fetched": 0,
            "markets_found": 0,
            "signals_generated": 0,
            "trades_executed": 0,
            "exits_triggered": 0,
            "errors": [],
        }

        try:
            # Step 1: Fetch NOAA forecasts
            forecasts = await self.noaa.scan_all_cities()
            self._last_forecasts = forecasts
            result["forecasts_fetched"] = sum(
                1 for f in forecasts.values() if f.error is None
            )

            # Step 2: Fetch Polymarket weather markets
            markets = await self.fetch_weather_markets()
            self._last_markets = markets
            result["markets_found"] = len(markets)

            # Step 3: Generate signals
            signals = self.strategy.scan_opportunities(forecasts, markets)
            self._last_signals = signals
            result["signals_generated"] = len(signals)

            # Step 4: Execute trades
            if signals and os.getenv("POLYMARKET_PRIVATE_KEY"):
                executed = self.strategy.execute_signals(signals, self._execute_trade)
                result["trades_executed"] = len(executed)

                # Send Telegram alerts for executed trades
                for sig in executed:
                    await self.telegram.send_trade_alert(
                        action=sig.side,
                        city=sig.city,
                        market_question=sig.market_question,
                        outcome=sig.outcome,
                        price=sig.market_price,
                        size_usd=sig.kelly_size_usd,
                        noaa_confidence=sig.noaa_confidence,
                        forecast_temp=sig.forecast_temp_f,
                        expected_value=sig.expected_value,
                        signal_strength=sig.signal_strength,
                    )
            elif signals:
                logger.info(
                    "Found %d signals but POLYMARKET_PRIVATE_KEY not set — dry run",
                    len(signals),
                )

            # Step 5: Check exits on open positions
            open_positions = self.pm.open_positions
            if open_positions:
                token_ids = [p.token_id for p in open_positions]
                current_prices = await self._fetch_current_prices(token_ids)

                exits = self.strategy.check_exits(
                    open_positions, forecasts, current_prices,
                )
                for pos, reason in exits:
                    current_price = current_prices.get(pos.token_id, pos.entry_price)

                    if os.getenv("POLYMARKET_PRIVATE_KEY"):
                        self._execute_exit(pos)

                    status = (
                        PositionStatus.CLOSED_PROFIT
                        if current_price > pos.entry_price
                        else PositionStatus.CLOSED_LOSS
                    )
                    self.pm.close_position(pos.id, current_price, status)

                    await self.telegram.send_exit_alert(
                        city=pos.city,
                        market_question=pos.bucket_description,
                        outcome=pos.outcome,
                        entry_price=pos.entry_price,
                        exit_price=current_price,
                        pnl=pos.pnl,
                        reason=reason,
                    )

                result["exits_triggered"] = len(exits)

        except Exception as exc:
            error_msg = f"Scan #{scan_id} error: {exc}"
            logger.error(error_msg)
            logger.debug(traceback.format_exc())
            result["errors"].append(error_msg)
            self._last_error = error_msg
            await self.telegram.send_error("Scan Error", error_msg)

        elapsed = (datetime.now(timezone.utc) - started_at).total_seconds()
        result["elapsed_sec"] = round(elapsed, 2)
        self._last_scan_at = datetime.now(timezone.utc)

        logger.info(
            "=== Scan #%d complete: %d forecasts, %d markets, %d signals, "
            "%d trades, %d exits (%.1fs) ===",
            scan_id,
            result["forecasts_fetched"],
            result["markets_found"],
            result["signals_generated"],
            result["trades_executed"],
            result["exits_triggered"],
            elapsed,
        )
        return result

    # ------------------------------------------------------------------ #
    #  Continuous scanning loop                                           #
    # ------------------------------------------------------------------ #

    async def _run_loop(self) -> None:
        """Background loop that runs scans at the configured interval."""
        logger.info(
            "Weather arb scanner loop started — interval %ds",
            self.scan_interval_sec,
        )
        self._consecutive_errors = 0

        while self._running:
            try:
                await self.run_single_scan()
                self._consecutive_errors = 0
            except Exception as exc:
                self._consecutive_errors += 1
                self._last_error = str(exc)
                logger.error(
                    "Scanner loop error (consecutive: %d): %s",
                    self._consecutive_errors, exc,
                )

                # If too many consecutive errors, pause longer
                if self._consecutive_errors >= 5:
                    pause = min(300, 60 * self._consecutive_errors)
                    logger.warning(
                        "Too many errors — pausing %ds before retry", pause
                    )
                    await self.telegram.send_error(
                        "Scanner Degraded",
                        f"{self._consecutive_errors} consecutive errors. "
                        f"Pausing {pause}s.",
                    )
                    await asyncio.sleep(pause)
                    continue

            # Daily stats reset check
            now = datetime.now(timezone.utc)
            if now.hour == 0 and now.minute < 3:
                self.pm.reset_daily_stats()
                summary = self.pm.summary()
                await self.telegram.send_daily_summary(
                    bankroll=summary["bankroll"],
                    daily_pnl=summary["today_realized_pnl"],
                    total_pnl=summary["total_pnl"],
                    trades_opened=summary["today_trades_opened"],
                    trades_closed=summary["today_trades_closed"],
                    open_positions=summary["open_positions"],
                    total_deployed=summary["total_deployed"],
                )

            await asyncio.sleep(self.scan_interval_sec)

        logger.info("Weather arb scanner loop stopped")

    def start(self) -> dict:
        """Start the background scanning loop."""
        if self._running:
            return {"status": "already_running", "scan_count": self._scan_count}

        self._running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info("Weather arb scanner started")
        return {
            "status": "started",
            "interval_sec": self.scan_interval_sec,
            "bankroll": self.pm.bankroll,
        }

    def stop(self) -> dict:
        """Stop the background scanning loop."""
        self._running = False
        if self._task:
            self._task.cancel()
            self._task = None
        logger.info("Weather arb scanner stopped")
        return {"status": "stopped", "scan_count": self._scan_count}

    @property
    def is_running(self) -> bool:
        return self._running

    # ------------------------------------------------------------------ #
    #  Emergency stop                                                     #
    # ------------------------------------------------------------------ #

    async def emergency_stop(self, reason: str = "Manual emergency stop") -> dict:
        """Stop scanning and close all positions."""
        self.stop()
        closed = self.pm.emergency_stop(reason)

        # Try to sell positions on Polymarket
        if os.getenv("POLYMARKET_PRIVATE_KEY"):
            for pos in closed:
                self._execute_exit(pos)

        await self.telegram.send_emergency_stop(reason, len(closed))

        return {
            "status": "emergency_stopped",
            "reason": reason,
            "positions_closed": len(closed),
        }

    # ------------------------------------------------------------------ #
    #  Status / reporting                                                 #
    # ------------------------------------------------------------------ #

    def status(self) -> dict:
        return {
            "running": self._running,
            "scan_count": self._scan_count,
            "scan_interval_sec": self.scan_interval_sec,
            "last_scan_at": self._last_scan_at.isoformat() if self._last_scan_at else None,
            "last_error": self._last_error,
            "consecutive_errors": self._consecutive_errors,
            "position_manager": self.pm.summary(),
            "last_signals_count": len(self._last_signals),
            "last_markets_count": len(self._last_markets),
            "last_forecasts_count": sum(
                1 for f in self._last_forecasts.values() if f.error is None
            ),
        }

    async def cleanup(self) -> None:
        """Clean up resources."""
        await self.noaa.close()
        await self.telegram.close()
        if self._http_client and not self._http_client.is_closed:
            await self._http_client.aclose()

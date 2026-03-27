"""
MarketPilot AI — Sports Arbitrage Scanner
==========================================
Main orchestrator that ties together The Odds API bookmaker odds,
Polymarket sports markets, the arb strategy, position management,
trade execution, and Telegram notifications into a continuous loop.

Runs every 5 minutes (configurable), auto-restarts on failure, and
provides a clean interface for the FastAPI router to start/stop.
"""

from __future__ import annotations

import asyncio
import logging
import os
import random
import traceback
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx

from app.data.odds_client import OddsClient, BookmakerOdds, TRACKED_SPORTS
from app.strategies.sports.arb import (
    SportsArbStrategy,
    SportsMarket,
    SportsSignal,
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

# Tags to search for sports markets on Polymarket
SPORTS_TAGS = (
    "sports", "mma", "ufc", "nba", "nfl", "soccer", "football",
    "boxing", "basketball", "premier league", "champions league",
    "fighting",
)


class SportsArbScanner:
    """
    Continuous sports arbitrage scanner.

    Lifecycle:
      1. Fetch bookmaker odds for tracked sports via The Odds API
      2. Fetch active Polymarket sports markets from Gamma API
      3. Match events by fuzzy name matching
      4. Generate trade signals when edge > threshold
      5. Execute trades via py-clob-client
      6. Send Telegram alerts
      7. Sleep and repeat
    """

    def __init__(
        self,
        scan_interval_sec: int = 300,
        bankroll: float = 100.0,
    ):
        self.scan_interval_sec = scan_interval_sec
        self.odds_client = OddsClient()
        self.pm = PositionManager(bankroll=bankroll)
        self.strategy = SportsArbStrategy(position_manager=self.pm)
        self.telegram = TelegramNotifier()

        self._running = False
        self._task: Optional[asyncio.Task] = None
        self._scan_count = 0
        self._last_scan_at: Optional[datetime] = None
        self._last_error: Optional[str] = None
        self._consecutive_errors = 0
        self._clob_client = None
        self._http_client: Optional[httpx.AsyncClient] = None

        # Data from last scan
        self._last_odds: list[BookmakerOdds] = []
        self._last_markets: list[SportsMarket] = []
        self._last_signals: list[SportsSignal] = []

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
        self._clob_client.set_api_creds(self._clob_client.create_or_derive_api_creds())
        logger.info("CLOB client initialized for sports arb")
        return self._clob_client

    async def _get_http_client(self) -> httpx.AsyncClient:
        if self._http_client is None or self._http_client.is_closed:
            self._http_client = httpx.AsyncClient(
                timeout=httpx.Timeout(30.0),
                follow_redirects=True,
            )
        return self._http_client

    # ------------------------------------------------------------------ #
    #  Gamma API — fetch sports markets                                   #
    # ------------------------------------------------------------------ #

    async def fetch_sports_markets(self) -> list[SportsMarket]:
        """Fetch active sports markets from the Gamma API."""
        client = await self._get_http_client()
        markets: list[SportsMarket] = []

        try:
            for tag in SPORTS_TAGS:
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
                    parsed = SportsMarket.from_gamma_market(raw_market)
                    if parsed:
                        markets.append(parsed)

            # Deduplicate by market_id
            seen: set[str] = set()
            unique: list[SportsMarket] = []
            for m in markets:
                if m.market_id not in seen:
                    seen.add(m.market_id)
                    unique.append(m)

            logger.info("Fetched %d unique sports markets from Gamma API", len(unique))
            return unique

        except Exception as exc:
            logger.error("Failed to fetch sports markets: %s", exc)
            return []

    # ------------------------------------------------------------------ #
    #  Simulated markets for paper mode                                   #
    # ------------------------------------------------------------------ #

    def _generate_simulated_markets(
        self, odds: list[BookmakerOdds]
    ) -> list[SportsMarket]:
        """Generate realistic simulated Polymarket sports markets from bookmaker odds."""
        markets: list[SportsMarket] = []

        for bm in odds:
            # Simulate a Polymarket market where YES = team1 wins
            # Sometimes misprice it relative to bookmaker odds to create edge
            true_prob = bm.team1_prob

            if random.random() < 0.35:
                # Mispriced — create arbitrage opportunity
                noise = random.uniform(0.06, 0.18)
                yes_price = round(max(0.03, true_prob - noise), 2)
            else:
                # Fairly priced (small noise)
                noise = random.uniform(-0.03, 0.03)
                yes_price = round(max(0.03, min(0.97, true_prob + noise)), 2)

            no_price = round(1.0 - yes_price, 2)
            market_id = f"sim-sports-{bm.event_id}"

            question = f"Will {bm.team1} beat {bm.team2}?"

            markets.append(SportsMarket(
                market_id=market_id,
                condition_id=f"sim-cond-{market_id}",
                question=question,
                yes_price=yes_price,
                no_price=no_price,
                token_id_yes=f"sim-yes-{market_id}",
                token_id_no=f"sim-no-{market_id}",
                volume_24h=random.uniform(10000, 200000),
                active=True,
                end_date=bm.commence_time,
                team1=bm.team1,
                team2=bm.team2,
            ))

        random.shuffle(markets)
        return markets

    # ------------------------------------------------------------------ #
    #  Trade execution via CLOB                                           #
    # ------------------------------------------------------------------ #

    def _execute_trade(self, signal: SportsSignal) -> Optional[str]:
        """Place a limit order on Polymarket via py-clob-client."""
        try:
            clob = self._get_clob_client()
            from py_clob_client.clob_types import OrderArgs

            order_args = OrderArgs(
                price=signal.polymarket_price,
                size=signal.kelly_size / signal.polymarket_price,
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
                    "Sports order placed: %s %s @ $%.4f, size $%.2f -> order %s",
                    signal.outcome, signal.event, signal.polymarket_price,
                    signal.kelly_size, order_id,
                )
                return str(order_id)
            else:
                logger.warning("Order response missing ID: %s", resp)
                return None

        except Exception as exc:
            logger.error("Sports trade execution failed for %s: %s", signal.id[:8], exc)
            return None

    # ------------------------------------------------------------------ #
    #  Single scan cycle                                                  #
    # ------------------------------------------------------------------ #

    async def run_single_scan(self) -> dict:
        """Execute one full scan cycle. Returns a summary dict."""
        self._scan_count += 1
        scan_id = self._scan_count
        started_at = datetime.now(timezone.utc)
        logger.info("=== Sports Arb Scan #%d starting ===", scan_id)

        result = {
            "scan_id": scan_id,
            "started_at": started_at.isoformat(),
            "odds_fetched": 0,
            "markets_found": 0,
            "signals_generated": 0,
            "trades_executed": 0,
            "errors": [],
        }

        try:
            # Step 1: Fetch bookmaker odds
            odds = await self.odds_client.get_all_tracked_odds()
            self._last_odds = odds
            result["odds_fetched"] = len(odds)

            # Step 2: Fetch Polymarket sports markets
            markets = await self.fetch_sports_markets()

            # If no real markets found, generate simulated ones
            if not markets and odds:
                markets = self._generate_simulated_markets(odds)
                logger.info("No live sports markets — using %d simulated markets", len(markets))

            self._last_markets = markets
            result["markets_found"] = len(markets)

            # Step 3: Generate signals
            signals = self.strategy.scan_opportunities(odds, markets)
            self._last_signals = signals
            result["signals_generated"] = len(signals)

            # Step 4: Execute trades
            # Use paper mode when markets are simulated (no real Polymarket IDs)
            has_real_markets = any(
                not sig.market_id.startswith("sim-") for sig in signals
            ) if signals else False
            use_live = (
                signals
                and has_real_markets
                and os.getenv("POLYMARKET_PRIVATE_KEY")
            )

            if use_live:
                executed = self.strategy.execute_signals(signals, self._execute_trade)
                result["trades_executed"] = len(executed)

                # Send Telegram alerts
                for sig in executed:
                    await self.telegram.send_trade_alert(
                        action=sig.side,
                        city=sig.sport,
                        market_question=sig.market_question,
                        outcome=sig.outcome,
                        price=sig.polymarket_price,
                        size_usd=sig.kelly_size,
                        noaa_confidence=sig.bookmaker_prob,
                        forecast_temp=sig.edge_pct,
                        expected_value=sig.edge_pct,
                        signal_strength=sig.confidence,
                    )
            elif signals:
                # Paper mode
                logger.info(
                    "Found %d sports signals — paper mode (no private key)",
                    len(signals),
                )
                for sig in signals:
                    allowed, reason = self.pm.can_open_position(sig.kelly_size)
                    if not allowed:
                        logger.info("Skipping paper signal %s: %s", sig.id[:8], reason)
                        continue
                    sig.executed = True
                    pos = Position(
                        id=sig.id,
                        market_id=sig.market_id,
                        token_id=sig.token_id,
                        city=sig.sport,
                        target_date=sig.commence_time,
                        side=sig.side,
                        outcome=sig.outcome,
                        entry_price=sig.polymarket_price,
                        size_usd=sig.kelly_size,
                        shares=sig.kelly_size / sig.polymarket_price if sig.polymarket_price > 0 else 0,
                        noaa_confidence=sig.bookmaker_prob,
                        forecast_temp_f=0.0,
                        bucket_description=sig.event,
                        order_id=f"paper-{sig.id[:12]}",
                    )
                    self.pm.open_position(pos)
                    result["trades_executed"] += 1

        except Exception as exc:
            error_msg = f"Sports Scan #{scan_id} error: {exc}"
            logger.error(error_msg)
            logger.debug(traceback.format_exc())
            result["errors"].append(error_msg)
            self._last_error = error_msg
            await self.telegram.send_error("Sports Scan Error", error_msg)

        elapsed = (datetime.now(timezone.utc) - started_at).total_seconds()
        result["elapsed_sec"] = round(elapsed, 2)
        self._last_scan_at = datetime.now(timezone.utc)

        logger.info(
            "=== Sports Scan #%d complete: %d odds, %d markets, %d signals, "
            "%d trades (%.1fs) ===",
            scan_id,
            result["odds_fetched"],
            result["markets_found"],
            result["signals_generated"],
            result["trades_executed"],
            elapsed,
        )
        return result

    # ------------------------------------------------------------------ #
    #  Continuous scanning loop                                           #
    # ------------------------------------------------------------------ #

    async def _run_loop(self) -> None:
        """Background loop that runs scans at the configured interval."""
        logger.info(
            "Sports arb scanner loop started — interval %ds",
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
                    "Sports scanner loop error (consecutive: %d): %s",
                    self._consecutive_errors, exc,
                )

                if self._consecutive_errors >= 5:
                    pause = min(300, 60 * self._consecutive_errors)
                    logger.warning(
                        "Too many errors — pausing %ds before retry", pause
                    )
                    await self.telegram.send_error(
                        "Sports Scanner Degraded",
                        f"{self._consecutive_errors} consecutive errors. "
                        f"Pausing {pause}s.",
                    )
                    await asyncio.sleep(pause)
                    continue

            # Daily stats reset
            now = datetime.now(timezone.utc)
            if now.hour == 0 and now.minute < 6:
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

        logger.info("Sports arb scanner loop stopped")

    def start(self) -> dict:
        """Start the background scanning loop."""
        if self._running:
            return {"status": "already_running", "scan_count": self._scan_count}

        self._running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info("Sports arb scanner started")
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
        logger.info("Sports arb scanner stopped")
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

        if os.getenv("POLYMARKET_PRIVATE_KEY"):
            for pos in closed:
                try:
                    clob = self._get_clob_client()
                    from py_clob_client.clob_types import OrderArgs
                    order_args = OrderArgs(
                        price=0.50,
                        size=pos.shares,
                        side="SELL",
                        token_id=pos.token_id,
                    )
                    signed_order = clob.create_order(order_args)
                    clob.post_order(signed_order, orderType="GTC")
                except Exception as exc:
                    logger.error("Failed to exit position %s: %s", pos.id[:8], exc)

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
            "last_odds_count": len(self._last_odds),
            "odds_api_configured": self.odds_client.is_configured,
        }

    async def cleanup(self) -> None:
        """Clean up resources."""
        await self.odds_client.close()
        await self.telegram.close()
        if self._http_client and not self._http_client.is_closed:
            await self._http_client.aclose()

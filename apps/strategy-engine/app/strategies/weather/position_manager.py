"""
MarketPilot AI — Weather Arbitrage Position Manager
====================================================
Manages position sizing (Kelly Criterion), risk limits, and P&L tracking
for the weather arbitrage strategy.

Risk constraints:
- Max $2 per trade
- Max 5 open positions
- Max $50 daily loss (circuit breaker)
- Max 50% of bankroll deployed at any time
- Quarter-Kelly position sizing
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone, date
from typing import Optional
from enum import Enum

logger = logging.getLogger(__name__)


class PositionStatus(str, Enum):
    OPEN = "open"
    CLOSED_PROFIT = "closed_profit"
    CLOSED_LOSS = "closed_loss"
    CLOSED_EXIT = "closed_exit"
    EMERGENCY_CLOSED = "emergency_closed"


@dataclass
class Position:
    """A single open or closed weather arb position."""
    id: str
    market_id: str
    token_id: str
    city: str
    target_date: str
    side: str                   # "BUY"
    outcome: str                # "YES" / "NO"
    entry_price: float
    size_usd: float
    shares: float               # size_usd / entry_price
    noaa_confidence: float
    forecast_temp_f: float
    bucket_description: str     # e.g. "above 72°F"
    opened_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    closed_at: Optional[datetime] = None
    exit_price: Optional[float] = None
    pnl: float = 0.0
    status: PositionStatus = PositionStatus.OPEN
    order_id: Optional[str] = None

    @property
    def is_open(self) -> bool:
        return self.status == PositionStatus.OPEN

    @property
    def unrealized_pnl(self) -> float:
        """Estimated unrealized P&L — requires current_price to be set externally."""
        return 0.0  # computed externally

    def close(self, exit_price: float, status: PositionStatus = PositionStatus.CLOSED_PROFIT) -> None:
        self.exit_price = exit_price
        self.pnl = (exit_price - self.entry_price) * self.shares
        self.closed_at = datetime.now(timezone.utc)
        self.status = status


@dataclass
class DailyStats:
    """Tracks daily P&L and trade counts."""
    date: date
    trades_opened: int = 0
    trades_closed: int = 0
    realized_pnl: float = 0.0
    gross_profit: float = 0.0
    gross_loss: float = 0.0
    peak_deployed: float = 0.0


class PositionManager:
    """
    Manages positions, sizing, and risk limits for the weather arb strategy.

    Uses quarter-Kelly criterion for position sizing with hard caps on
    individual trade size and total deployment.
    """

    # ---- risk constants ----
    MAX_TRADE_SIZE_USD: float = 2.0
    MAX_OPEN_POSITIONS: int = 5
    MAX_DAILY_LOSS_USD: float = 50.0
    MAX_DEPLOYMENT_PCT: float = 0.50   # 50 % of bankroll
    KELLY_FRACTION: float = 0.25       # quarter-Kelly

    def __init__(self, bankroll: float = 100.0):
        self.bankroll: float = bankroll
        self.initial_bankroll: float = bankroll
        self.positions: list[Position] = []
        self._daily_stats: dict[date, DailyStats] = {}
        self._emergency_stopped: bool = False
        self._emergency_reason: Optional[str] = None

    # ------------------------------------------------------------------ #
    #  Kelly Criterion sizing                                             #
    # ------------------------------------------------------------------ #

    def kelly_size(self, win_probability: float, payout_ratio: float = 1.0) -> float:
        """
        Compute quarter-Kelly position size in USD.

        Full Kelly: f* = (bp - q) / b
          where b = net payout ratio, p = win prob, q = 1 - p
        We use 0.25 * f* (quarter-Kelly) for safety.
        """
        if win_probability <= 0 or win_probability >= 1:
            return 0.0
        if payout_ratio <= 0:
            return 0.0

        p = win_probability
        q = 1.0 - p
        b = payout_ratio

        full_kelly = (b * p - q) / b
        if full_kelly <= 0:
            return 0.0  # negative edge — don't bet

        quarter_kelly = full_kelly * self.KELLY_FRACTION
        size_usd = quarter_kelly * self.bankroll

        # Apply hard cap
        size_usd = min(size_usd, self.MAX_TRADE_SIZE_USD)
        # Minimum trade size
        if size_usd < 0.10:
            return 0.0

        return round(size_usd, 2)

    def kelly_size_for_market(self, noaa_confidence: float, market_price: float) -> float:
        """
        Compute Kelly size specifically for a binary weather market.

        If we buy YES at `market_price`, payout is $1 per share on win.
        Payout ratio = (1 - market_price) / market_price
        """
        if market_price <= 0 or market_price >= 1:
            return 0.0
        payout_ratio = (1.0 - market_price) / market_price
        return self.kelly_size(win_probability=noaa_confidence, payout_ratio=payout_ratio)

    # ------------------------------------------------------------------ #
    #  Constraint checks                                                  #
    # ------------------------------------------------------------------ #

    @property
    def open_positions(self) -> list[Position]:
        return [p for p in self.positions if p.is_open]

    @property
    def total_deployed(self) -> float:
        return sum(p.size_usd for p in self.open_positions)

    @property
    def today_stats(self) -> DailyStats:
        today = date.today()
        if today not in self._daily_stats:
            self._daily_stats[today] = DailyStats(date=today)
        return self._daily_stats[today]

    def can_open_position(self, size_usd: float) -> tuple[bool, str]:
        """
        Check whether a new position can be opened.
        Returns (allowed, reason).
        """
        if self._emergency_stopped:
            return False, f"Emergency stop active: {self._emergency_reason}"

        if len(self.open_positions) >= self.MAX_OPEN_POSITIONS:
            return False, f"Max open positions reached ({self.MAX_OPEN_POSITIONS})"

        if size_usd > self.MAX_TRADE_SIZE_USD:
            return False, f"Trade size ${size_usd:.2f} exceeds max ${self.MAX_TRADE_SIZE_USD:.2f}"

        if self.total_deployed + size_usd > self.bankroll * self.MAX_DEPLOYMENT_PCT:
            return False, (
                f"Would exceed max deployment: "
                f"${self.total_deployed + size_usd:.2f} > "
                f"${self.bankroll * self.MAX_DEPLOYMENT_PCT:.2f}"
            )

        stats = self.today_stats
        if stats.realized_pnl <= -self.MAX_DAILY_LOSS_USD:
            return False, f"Daily loss limit reached: ${stats.realized_pnl:.2f}"

        if self.bankroll < size_usd:
            return False, f"Insufficient bankroll: ${self.bankroll:.2f} < ${size_usd:.2f}"

        return True, "OK"

    # ------------------------------------------------------------------ #
    #  Position lifecycle                                                 #
    # ------------------------------------------------------------------ #

    def open_position(self, position: Position) -> bool:
        """Register a new open position. Returns False if constraints prevent it."""
        allowed, reason = self.can_open_position(position.size_usd)
        if not allowed:
            logger.warning("Cannot open position: %s", reason)
            return False

        self.positions.append(position)
        self.bankroll -= position.size_usd
        stats = self.today_stats
        stats.trades_opened += 1
        stats.peak_deployed = max(stats.peak_deployed, self.total_deployed)

        logger.info(
            "Opened position %s: %s %s @ $%.4f, size $%.2f | bankroll $%.2f",
            position.id[:8], position.city, position.bucket_description,
            position.entry_price, position.size_usd, self.bankroll,
        )
        return True

    def close_position(
        self,
        position_id: str,
        exit_price: float,
        status: PositionStatus = PositionStatus.CLOSED_PROFIT,
    ) -> Optional[Position]:
        """Close a position and update bankroll."""
        pos = next((p for p in self.positions if p.id == position_id and p.is_open), None)
        if pos is None:
            logger.warning("Position %s not found or already closed", position_id)
            return None

        pos.close(exit_price, status)

        # Return proceeds to bankroll
        proceeds = pos.shares * exit_price
        self.bankroll += proceeds

        stats = self.today_stats
        stats.trades_closed += 1
        stats.realized_pnl += pos.pnl
        if pos.pnl > 0:
            stats.gross_profit += pos.pnl
        else:
            stats.gross_loss += abs(pos.pnl)

        logger.info(
            "Closed position %s: P&L $%.4f (%s) | bankroll $%.2f",
            position_id[:8], pos.pnl, status.value, self.bankroll,
        )
        return pos

    # ------------------------------------------------------------------ #
    #  Emergency stop                                                     #
    # ------------------------------------------------------------------ #

    def emergency_stop(self, reason: str = "Manual emergency stop") -> list[Position]:
        """
        Circuit breaker — immediately mark all open positions for closure.
        Returns the list of positions that were open.
        """
        self._emergency_stopped = True
        self._emergency_reason = reason
        closed: list[Position] = []

        for pos in self.open_positions:
            # Mark as emergency closed at entry price (worst case — actual exit
            # price will be set when the cancel/sell goes through)
            pos.close(pos.entry_price, PositionStatus.EMERGENCY_CLOSED)
            self.bankroll += pos.size_usd  # return capital
            closed.append(pos)

        logger.critical("EMERGENCY STOP: %s — closed %d positions", reason, len(closed))
        return closed

    def reset_emergency(self) -> None:
        """Clear the emergency stop flag."""
        self._emergency_stopped = False
        self._emergency_reason = None
        logger.info("Emergency stop cleared")

    @property
    def is_emergency_stopped(self) -> bool:
        return self._emergency_stopped

    # ------------------------------------------------------------------ #
    #  Daily reset                                                        #
    # ------------------------------------------------------------------ #

    def reset_daily_stats(self) -> None:
        """Reset daily P&L tracking (call at midnight UTC)."""
        today = date.today()
        self._daily_stats[today] = DailyStats(date=today)
        logger.info("Daily stats reset for %s", today)

    # ------------------------------------------------------------------ #
    #  Reporting                                                          #
    # ------------------------------------------------------------------ #

    def summary(self) -> dict:
        stats = self.today_stats
        return {
            "bankroll": round(self.bankroll, 2),
            "initial_bankroll": round(self.initial_bankroll, 2),
            "total_pnl": round(self.bankroll - self.initial_bankroll, 2),
            "open_positions": len(self.open_positions),
            "total_deployed": round(self.total_deployed, 2),
            "max_deployment": round(self.bankroll * self.MAX_DEPLOYMENT_PCT, 2),
            "today_realized_pnl": round(stats.realized_pnl, 4),
            "today_trades_opened": stats.trades_opened,
            "today_trades_closed": stats.trades_closed,
            "emergency_stopped": self._emergency_stopped,
            "emergency_reason": self._emergency_reason,
        }

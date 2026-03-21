from __future__ import annotations

from app.models.strategy import (
    RiskDecision,
    RiskLevel,
    RiskLimits,
    TradeIntent,
)
from app.risk.presets import get_preset


class RiskEngine:
    """Validates trade intents against risk limits and maintains state
    for daily loss tracking and emergency stops.
    """

    def __init__(self, limits: RiskLimits | None = None, preset: str = "balanced") -> None:
        self.limits = limits or get_preset(preset)
        self.daily_pnl: float = 0.0
        self.peak_equity: float = 0.0
        self.current_equity: float = 0.0
        self.open_positions: int = 0
        self.emergency_stop: bool = False

    def reset_daily(self) -> None:
        """Reset daily counters (call at start of each trading day)."""
        self.daily_pnl = 0.0

    def update_equity(self, equity: float) -> None:
        """Update equity tracking for drawdown calculation."""
        self.current_equity = equity
        if equity > self.peak_equity:
            self.peak_equity = equity

    def record_pnl(self, pnl: float) -> None:
        """Record realised P&L from a closed trade."""
        self.daily_pnl += pnl
        self.current_equity += pnl
        if self.current_equity > self.peak_equity:
            self.peak_equity = self.current_equity

    def trigger_emergency_stop(self, reason: str = "Manual trigger") -> None:
        """Activate emergency stop — all subsequent trades are rejected."""
        self.emergency_stop = True

    def clear_emergency_stop(self) -> None:
        """Deactivate emergency stop."""
        self.emergency_stop = False

    def validate(
        self,
        trade_intent: TradeIntent,
        strategy_risk_level: RiskLevel = RiskLevel.MEDIUM,
    ) -> RiskDecision:
        """Check a trade intent against all risk rules.

        Returns a RiskDecision indicating approval or rejection with reasons.
        """
        reasons: list[str] = []

        # Emergency stop
        if self.emergency_stop:
            return RiskDecision(
                approved=False,
                trade_intent_id=trade_intent.id,
                reasons=["EMERGENCY STOP is active. All trading halted."],
            )

        # Strategy risk level allowed?
        if strategy_risk_level not in self.limits.allowed_risk_levels:
            reasons.append(
                f"Strategy risk level '{strategy_risk_level.value}' not in allowed levels "
                f"{[r.value for r in self.limits.allowed_risk_levels]}."
            )

        # Confidence check
        if trade_intent.signal.confidence < self.limits.min_confidence:
            reasons.append(
                f"Signal confidence {trade_intent.signal.confidence:.4f} below minimum "
                f"{self.limits.min_confidence}."
            )

        # Single trade size
        if trade_intent.size > self.limits.max_single_trade_size:
            reasons.append(
                f"Trade size ${trade_intent.size:.2f} exceeds single-trade limit "
                f"${self.limits.max_single_trade_size:.2f}."
            )

        # Open positions
        if self.open_positions >= self.limits.max_open_positions:
            reasons.append(
                f"Open positions ({self.open_positions}) at limit "
                f"({self.limits.max_open_positions})."
            )

        # Daily loss
        if self.daily_pnl < 0 and abs(self.daily_pnl) >= self.limits.max_daily_loss:
            reasons.append(
                f"Daily loss ${abs(self.daily_pnl):.2f} has reached limit "
                f"${self.limits.max_daily_loss:.2f}."
            )

        # Drawdown
        if self.peak_equity > 0:
            drawdown = (self.peak_equity - self.current_equity) / self.peak_equity
            if drawdown >= self.limits.max_drawdown_pct:
                reasons.append(
                    f"Drawdown {drawdown:.2%} has reached limit "
                    f"{self.limits.max_drawdown_pct:.2%}."
                )

        if reasons:
            return RiskDecision(
                approved=False,
                trade_intent_id=trade_intent.id,
                reasons=reasons,
            )

        # Optionally cap size to position limit
        adjusted_size = min(trade_intent.size, self.limits.max_position_size)

        return RiskDecision(
            approved=True,
            trade_intent_id=trade_intent.id,
            reasons=["All risk checks passed."],
            adjusted_size=adjusted_size if adjusted_size != trade_intent.size else None,
        )

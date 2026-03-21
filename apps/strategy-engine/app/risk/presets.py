from __future__ import annotations

from app.models.strategy import RiskLevel, RiskLimits

CONSERVATIVE = RiskLimits(
    max_position_size=500.0,
    max_daily_loss=200.0,
    max_drawdown_pct=0.05,
    max_open_positions=3,
    max_single_trade_size=200.0,
    min_confidence=0.65,
    allowed_risk_levels=[RiskLevel.LOW],
)

BALANCED = RiskLimits(
    max_position_size=1_000.0,
    max_daily_loss=500.0,
    max_drawdown_pct=0.10,
    max_open_positions=5,
    max_single_trade_size=500.0,
    min_confidence=0.55,
    allowed_risk_levels=[RiskLevel.LOW, RiskLevel.MEDIUM],
)

ADVANCED = RiskLimits(
    max_position_size=5_000.0,
    max_daily_loss=2_000.0,
    max_drawdown_pct=0.20,
    max_open_positions=10,
    max_single_trade_size=2_000.0,
    min_confidence=0.45,
    allowed_risk_levels=[RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH],
)

PRESETS: dict[str, RiskLimits] = {
    "conservative": CONSERVATIVE,
    "balanced": BALANCED,
    "advanced": ADVANCED,
}


def get_preset(name: str) -> RiskLimits:
    """Get a risk preset by name. Defaults to balanced."""
    return PRESETS.get(name.lower(), BALANCED)

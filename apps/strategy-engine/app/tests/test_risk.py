from __future__ import annotations

import pytest

from app.models.strategy import (
    MarketData,
    RiskDecision,
    RiskLevel,
    RiskLimits,
    Signal,
    SignalDirection,
    StrategyConfig,
    TradeIntent,
)
from app.risk.engine import RiskEngine
from app.risk.presets import PRESETS, get_preset


def _make_intent(
    confidence: float = 0.70,
    size: float = 100.0,
    direction: SignalDirection = SignalDirection.BUY,
) -> TradeIntent:
    signal = Signal(
        strategy_slug="test",
        market_id="m1",
        direction=direction,
        confidence=confidence,
        target_price=0.55,
    )
    return TradeIntent(
        signal=signal,
        side=direction,
        size=size,
        limit_price=0.54,
    )


class TestRiskEngine:
    def test_approve_valid_trade(self):
        engine = RiskEngine(preset="balanced")
        engine.update_equity(10_000)
        intent = _make_intent()
        decision = engine.validate(intent, RiskLevel.MEDIUM)
        assert decision.approved is True

    def test_reject_low_confidence(self):
        engine = RiskEngine(preset="conservative")
        engine.update_equity(10_000)
        intent = _make_intent(confidence=0.40)
        decision = engine.validate(intent, RiskLevel.LOW)
        assert decision.approved is False
        assert any("confidence" in r.lower() for r in decision.reasons)

    def test_reject_excessive_size(self):
        engine = RiskEngine(preset="conservative")
        engine.update_equity(10_000)
        intent = _make_intent(size=5000)
        decision = engine.validate(intent, RiskLevel.LOW)
        assert decision.approved is False

    def test_reject_risk_level(self):
        engine = RiskEngine(preset="conservative")
        engine.update_equity(10_000)
        intent = _make_intent()
        decision = engine.validate(intent, RiskLevel.HIGH)
        assert decision.approved is False
        assert any("risk level" in r.lower() for r in decision.reasons)

    def test_daily_loss_limit(self):
        engine = RiskEngine(preset="balanced")
        engine.update_equity(10_000)
        engine.daily_pnl = -500.0
        intent = _make_intent()
        decision = engine.validate(intent, RiskLevel.MEDIUM)
        assert decision.approved is False

    def test_drawdown_limit(self):
        engine = RiskEngine(preset="balanced")
        engine.peak_equity = 10_000
        engine.current_equity = 8_500  # 15% drawdown > 10% limit
        intent = _make_intent()
        decision = engine.validate(intent, RiskLevel.MEDIUM)
        assert decision.approved is False

    def test_emergency_stop(self):
        engine = RiskEngine(preset="balanced")
        engine.update_equity(10_000)
        engine.trigger_emergency_stop()
        intent = _make_intent()
        decision = engine.validate(intent, RiskLevel.MEDIUM)
        assert decision.approved is False
        assert "EMERGENCY" in decision.reasons[0]

    def test_clear_emergency_stop(self):
        engine = RiskEngine(preset="balanced")
        engine.update_equity(10_000)
        engine.trigger_emergency_stop()
        engine.clear_emergency_stop()
        intent = _make_intent()
        decision = engine.validate(intent, RiskLevel.MEDIUM)
        assert decision.approved is True

    def test_open_positions_limit(self):
        engine = RiskEngine(preset="conservative")
        engine.update_equity(10_000)
        engine.open_positions = 3  # conservative limit is 3
        intent = _make_intent()
        decision = engine.validate(intent, RiskLevel.LOW)
        assert decision.approved is False

    def test_size_adjustment(self):
        limits = RiskLimits(
            max_position_size=50.0,
            max_single_trade_size=200.0,
            max_daily_loss=1000.0,
            max_drawdown_pct=0.20,
            max_open_positions=10,
            min_confidence=0.50,
            allowed_risk_levels=[RiskLevel.MEDIUM],
        )
        engine = RiskEngine(limits=limits)
        engine.update_equity(10_000)
        intent = _make_intent(size=100.0)
        decision = engine.validate(intent, RiskLevel.MEDIUM)
        assert decision.approved is True
        assert decision.adjusted_size == 50.0


class TestPresets:
    def test_all_presets_exist(self):
        assert "conservative" in PRESETS
        assert "balanced" in PRESETS
        assert "advanced" in PRESETS

    def test_conservative_strictest(self):
        c = get_preset("conservative")
        b = get_preset("balanced")
        assert c.max_daily_loss < b.max_daily_loss
        assert c.max_position_size < b.max_position_size

    def test_advanced_most_permissive(self):
        a = get_preset("advanced")
        assert RiskLevel.HIGH in a.allowed_risk_levels

    def test_unknown_defaults_to_balanced(self):
        p = get_preset("nonexistent")
        b = get_preset("balanced")
        assert p.max_daily_loss == b.max_daily_loss

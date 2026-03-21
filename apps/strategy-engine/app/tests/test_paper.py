from __future__ import annotations

import pytest

from app.models.strategy import (
    RiskLevel,
    Signal,
    SignalDirection,
    TradeIntent,
)
from app.paper_execution.simulator import PaperTradingSimulator


def _make_intent(
    market_id: str = "m1",
    direction: SignalDirection = SignalDirection.BUY,
    size: float = 100.0,
    limit_price: float = 0.50,
    confidence: float = 0.70,
    stop_loss: float | None = None,
    take_profit: float | None = None,
) -> TradeIntent:
    signal = Signal(
        strategy_slug="test",
        market_id=market_id,
        direction=direction,
        confidence=confidence,
        target_price=0.55,
    )
    return TradeIntent(
        signal=signal,
        side=direction,
        size=size,
        limit_price=limit_price,
        stop_loss=stop_loss,
        take_profit=take_profit,
    )


class TestPaperTradingSimulator:
    def test_execute_fill(self):
        sim = PaperTradingSimulator(initial_balance=10_000)
        intent = _make_intent()
        result = sim.execute(intent)
        assert result["status"] == "filled"
        assert result["fill_size"] == 100.0
        assert sim.balance < 10_000

    def test_positions_after_fill(self):
        sim = PaperTradingSimulator(initial_balance=10_000)
        intent = _make_intent()
        sim.execute(intent)
        positions = sim.get_positions()
        assert len(positions) == 1
        assert positions[0]["market_id"] == "m1"

    def test_close_position(self):
        sim = PaperTradingSimulator(initial_balance=10_000)
        intent = _make_intent(limit_price=0.50)
        result = sim.execute(intent)
        pos_id = result["position_id"]

        close_result = sim.close_position(pos_id, exit_price=0.55)
        assert close_result["status"] == "closed"
        assert close_result["realised_pnl"] > 0
        assert len(sim.get_positions()) == 0

    def test_close_nonexistent_position(self):
        sim = PaperTradingSimulator()
        result = sim.close_position("fake-id")
        assert result["status"] == "error"

    def test_pnl_tracking(self):
        sim = PaperTradingSimulator(initial_balance=10_000)
        intent = _make_intent(limit_price=0.50, size=200)
        result = sim.execute(intent)
        pos_id = result["position_id"]
        sim.close_position(pos_id, exit_price=0.55)

        pnl = sim.get_pnl()
        assert pnl["realised_pnl"] > 0
        assert pnl["open_positions"] == 0
        assert pnl["closed_trades"] == 1

    def test_insufficient_balance(self):
        sim = PaperTradingSimulator(initial_balance=10.0)
        intent = _make_intent(size=1000, limit_price=0.50)
        result = sim.execute(intent)
        # Should still fill but with reduced size
        if result["status"] == "filled":
            assert result["fill_size"] < 1000
        else:
            assert result["status"] == "rejected"

    def test_stop_loss_trigger(self):
        sim = PaperTradingSimulator(initial_balance=10_000)
        intent = _make_intent(
            limit_price=0.50,
            stop_loss=0.45,
            take_profit=0.60,
        )
        result = sim.execute(intent)
        pos_id = result["position_id"]

        # Price drops to stop loss
        auto_closed = sim.update_prices({"m1": 0.44})
        assert len(auto_closed) == 1
        assert auto_closed[0]["trigger"] == "stop_loss"
        assert len(sim.get_positions()) == 0

    def test_take_profit_trigger(self):
        sim = PaperTradingSimulator(initial_balance=10_000)
        intent = _make_intent(
            limit_price=0.50,
            stop_loss=0.40,
            take_profit=0.60,
        )
        result = sim.execute(intent)

        auto_closed = sim.update_prices({"m1": 0.62})
        assert len(auto_closed) == 1
        assert auto_closed[0]["trigger"] == "take_profit"

    def test_risk_rejection_low_confidence(self):
        sim = PaperTradingSimulator(initial_balance=10_000, risk_preset="conservative")
        intent = _make_intent(confidence=0.30)
        result = sim.execute(intent, strategy_risk_level=RiskLevel.LOW)
        assert result["status"] == "rejected"

    def test_multiple_positions(self):
        sim = PaperTradingSimulator(initial_balance=10_000)
        for i in range(3):
            intent = _make_intent(market_id=f"m{i}", size=50)
            result = sim.execute(intent)
            assert result["status"] == "filled"
        assert len(sim.get_positions()) == 3

    def test_equity_calculation(self):
        sim = PaperTradingSimulator(initial_balance=10_000)
        intent = _make_intent(limit_price=0.50, size=100)
        sim.execute(intent)
        pnl = sim.get_pnl()
        # Equity = balance + unrealised P&L
        assert pnl["equity"] == pytest.approx(pnl["current_balance"] + pnl["unrealised_pnl"])

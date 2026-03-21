from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from app.models.strategy import (
    RiskDecision,
    RiskLevel,
    RiskLimits,
    SignalDirection,
    TradeIntent,
)
from app.risk.engine import RiskEngine
from app.risk.presets import get_preset


class PaperPosition:
    """Represents a single open paper-trading position."""

    def __init__(
        self,
        position_id: str,
        market_id: str,
        side: str,
        outcome: str,
        size: float,
        entry_price: float,
        stop_loss: float | None = None,
        take_profit: float | None = None,
    ) -> None:
        self.position_id = position_id
        self.market_id = market_id
        self.side = side
        self.outcome = outcome
        self.size = size
        self.entry_price = entry_price
        self.stop_loss = stop_loss
        self.take_profit = take_profit
        self.opened_at = datetime.utcnow()
        self.current_price = entry_price

    def unrealised_pnl(self) -> float:
        if self.side == "buy":
            return (self.current_price - self.entry_price) * self.size
        return (self.entry_price - self.current_price) * self.size

    def to_dict(self) -> dict[str, Any]:
        return {
            "position_id": self.position_id,
            "market_id": self.market_id,
            "side": self.side,
            "outcome": self.outcome,
            "size": self.size,
            "entry_price": self.entry_price,
            "current_price": self.current_price,
            "unrealised_pnl": round(self.unrealised_pnl(), 4),
            "stop_loss": self.stop_loss,
            "take_profit": self.take_profit,
            "opened_at": self.opened_at.isoformat(),
        }


class PaperTradingSimulator:
    """Simulates trade execution with virtual capital.

    Maintains positions, tracks P&L, and enforces risk limits through
    the RiskEngine.
    """

    def __init__(
        self,
        initial_balance: float = 10_000.0,
        risk_limits: RiskLimits | None = None,
        risk_preset: str = "balanced",
    ) -> None:
        self.initial_balance = initial_balance
        self.balance = initial_balance
        self.positions: dict[str, PaperPosition] = {}
        self.closed_trades: list[dict[str, Any]] = []
        self.risk_engine = RiskEngine(limits=risk_limits or get_preset(risk_preset))
        self.risk_engine.update_equity(initial_balance)
        self.risk_engine.peak_equity = initial_balance

    def execute(
        self,
        trade_intent: TradeIntent,
        strategy_risk_level: RiskLevel = RiskLevel.MEDIUM,
        fill_price: float | None = None,
    ) -> dict[str, Any]:
        """Attempt to execute a trade intent.

        Returns a dict with the execution result including fill info or
        rejection reason.
        """
        # Validate through risk engine
        self.risk_engine.open_positions = len(self.positions)
        decision = self.risk_engine.validate(trade_intent, strategy_risk_level)

        if not decision.approved:
            return {
                "status": "rejected",
                "trade_intent_id": trade_intent.id,
                "reasons": decision.reasons,
            }

        # Simulate fill
        actual_price = fill_price if fill_price is not None else trade_intent.limit_price
        actual_size = decision.adjusted_size if decision.adjusted_size else trade_intent.size

        # Check sufficient balance
        cost = actual_price * actual_size
        if cost > self.balance:
            actual_size = round(self.balance / actual_price, 2)
            if actual_size <= 0:
                return {
                    "status": "rejected",
                    "trade_intent_id": trade_intent.id,
                    "reasons": ["Insufficient balance."],
                }
            cost = actual_price * actual_size

        self.balance -= cost

        position_id = str(uuid.uuid4())
        position = PaperPosition(
            position_id=position_id,
            market_id=trade_intent.signal.market_id,
            side=trade_intent.side.value,
            outcome=trade_intent.outcome,
            size=actual_size,
            entry_price=actual_price,
            stop_loss=trade_intent.stop_loss,
            take_profit=trade_intent.take_profit,
        )
        self.positions[position_id] = position

        return {
            "status": "filled",
            "position_id": position_id,
            "trade_intent_id": trade_intent.id,
            "fill_price": actual_price,
            "fill_size": actual_size,
            "cost": round(cost, 4),
            "remaining_balance": round(self.balance, 4),
        }

    def close_position(
        self,
        position_id: str,
        exit_price: float | None = None,
    ) -> dict[str, Any]:
        """Close an open position and realise P&L."""
        pos = self.positions.get(position_id)
        if pos is None:
            return {"status": "error", "reason": f"Position {position_id} not found."}

        price = exit_price if exit_price is not None else pos.current_price
        pos.current_price = price
        pnl = pos.unrealised_pnl()

        # Return capital + P&L
        returned = pos.entry_price * pos.size + pnl
        self.balance += returned
        self.risk_engine.record_pnl(pnl)

        trade_record = {
            **pos.to_dict(),
            "exit_price": price,
            "realised_pnl": round(pnl, 4),
            "closed_at": datetime.utcnow().isoformat(),
        }
        self.closed_trades.append(trade_record)
        del self.positions[position_id]

        return {"status": "closed", **trade_record}

    def update_prices(self, price_map: dict[str, float]) -> list[dict[str, Any]]:
        """Update current prices and check stop-loss / take-profit triggers.

        ``price_map`` maps market_id to current price.
        Returns a list of auto-closed position results.
        """
        auto_closed: list[dict[str, Any]] = []
        for pos in list(self.positions.values()):
            if pos.market_id in price_map:
                pos.current_price = price_map[pos.market_id]

                # Stop-loss check
                if pos.stop_loss is not None:
                    if pos.side == "buy" and pos.current_price <= pos.stop_loss:
                        result = self.close_position(pos.position_id, pos.stop_loss)
                        result["trigger"] = "stop_loss"
                        auto_closed.append(result)
                        continue
                    if pos.side == "sell" and pos.current_price >= pos.stop_loss:
                        result = self.close_position(pos.position_id, pos.stop_loss)
                        result["trigger"] = "stop_loss"
                        auto_closed.append(result)
                        continue

                # Take-profit check
                if pos.take_profit is not None:
                    if pos.side == "buy" and pos.current_price >= pos.take_profit:
                        result = self.close_position(pos.position_id, pos.take_profit)
                        result["trigger"] = "take_profit"
                        auto_closed.append(result)
                        continue
                    if pos.side == "sell" and pos.current_price <= pos.take_profit:
                        result = self.close_position(pos.position_id, pos.take_profit)
                        result["trigger"] = "take_profit"
                        auto_closed.append(result)
                        continue

        return auto_closed

    def get_positions(self) -> list[dict[str, Any]]:
        """Return all open positions."""
        return [p.to_dict() for p in self.positions.values()]

    def get_pnl(self) -> dict[str, Any]:
        """Return aggregate P&L summary."""
        unrealised = sum(p.unrealised_pnl() for p in self.positions.values())
        realised = sum(t.get("realised_pnl", 0.0) for t in self.closed_trades)
        return {
            "initial_balance": self.initial_balance,
            "current_balance": round(self.balance, 4),
            "unrealised_pnl": round(unrealised, 4),
            "realised_pnl": round(realised, 4),
            "total_pnl": round(realised + unrealised, 4),
            "open_positions": len(self.positions),
            "closed_trades": len(self.closed_trades),
            "equity": round(self.balance + unrealised, 4),
        }

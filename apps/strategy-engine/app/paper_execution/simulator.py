from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from app.models.strategy import (
    MarketData,
    RiskLevel,
    RiskLimits,
    TradeIntent,
)
from app.paper_execution.analysis import (
    AggregateAnalysis,
    TradeAnalysisMetrics,
    compute_aggregate_analysis,
    compute_trade_analysis,
)
from app.paper_execution.fill_models import (
    FillResult,
    compute_fee,
    estimate_queue_position,
    generate_synthetic_orderbook,
    should_reject_fill,
    simulate_fill_latency,
    walk_orderbook,
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
    the RiskEngine. Enhanced with realistic fill models including
    orderbook walking, slippage, fees, latency, and rejection simulation.
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
        self.trade_analyses: list[TradeAnalysisMetrics] = []
        self.cumulative_volume: float = 0.0
        self.risk_engine = RiskEngine(limits=risk_limits or get_preset(risk_preset))
        self.risk_engine.update_equity(initial_balance)
        self.risk_engine.peak_equity = initial_balance

    def execute(
        self,
        trade_intent: TradeIntent,
        strategy_risk_level: RiskLevel = RiskLevel.MEDIUM,
        fill_price: float | None = None,
        market_data: MarketData | None = None,
    ) -> dict[str, Any]:
        """Attempt to execute a trade intent with realistic fill simulation.

        When ``market_data`` is provided, uses orderbook walking, dynamic
        fees, latency simulation, and rejection modelling. Falls back to
        simple fill when ``market_data`` is None (backward compatible).
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

        actual_size = decision.adjusted_size if decision.adjusted_size else trade_intent.size

        # ── Enhanced simulation (when market data available) ──────────
        if market_data is not None:
            return self._execute_enhanced(
                trade_intent, actual_size, market_data, fill_price
            )

        # ── Legacy simple fill ────────────────────────────────────────
        actual_price = fill_price if fill_price is not None else trade_intent.limit_price
        return self._execute_simple(trade_intent, actual_price, actual_size)

    def _execute_enhanced(
        self,
        trade_intent: TradeIntent,
        requested_size: float,
        market_data: MarketData,
        fill_price_override: float | None,
    ) -> dict[str, Any]:
        """Execute with full realistic simulation."""

        side = trade_intent.side.value
        midpoint = (market_data.outcome_yes_price + market_data.outcome_no_price) / 2

        # 1. Check for liquidity dry-up / rejection
        rejected, rejection_reason = should_reject_fill(
            liquidity=market_data.liquidity,
            spread=market_data.spread,
        )

        if rejected:
            analysis = compute_trade_analysis(
                side=side,
                requested_size=requested_size,
                requested_price=trade_intent.limit_price,
                fill_price=0.0,
                fill_size=0.0,
                midpoint=midpoint,
                spread=market_data.spread,
                fee=0.0,
                fee_type="taker",
                slippage_bps=0.0,
                latency_ms=0.0,
                tranches_count=0,
                is_partial=False,
                was_rejected=True,
                rejection_reason=rejection_reason,
                queue_position=None,
                estimated_wait_ticks=None,
                pnl=0.0,
            )
            self.trade_analyses.append(analysis)

            return {
                "status": "rejected",
                "trade_intent_id": trade_intent.id,
                "reasons": [f"Market condition: {rejection_reason}"],
                "analysis": self._analysis_to_dict(analysis),
            }

        # 2. Get orderbook (real data or synthetic)
        if market_data.orderbook_asks and market_data.orderbook_bids:
            asks = market_data.orderbook_asks
            bids = market_data.orderbook_bids
        else:
            liquidity_factor = max(0.3, market_data.liquidity / 100_000) if market_data.liquidity > 0 else 1.0
            bids, asks = generate_synthetic_orderbook(
                midpoint=midpoint,
                spread=market_data.spread or 0.02,
                liquidity_factor=liquidity_factor,
            )

        # 3. Walk orderbook for fill
        book_side = asks if side.lower() == "buy" else bids
        fill_result = walk_orderbook(
            side=side,
            size=requested_size,
            orderbook_levels=book_side,
            midpoint=midpoint,
        )

        if fill_result.rejected:
            analysis = compute_trade_analysis(
                side=side,
                requested_size=requested_size,
                requested_price=trade_intent.limit_price,
                fill_price=0.0,
                fill_size=0.0,
                midpoint=midpoint,
                spread=market_data.spread,
                fee=0.0,
                fee_type="taker",
                slippage_bps=0.0,
                latency_ms=0.0,
                tranches_count=0,
                is_partial=False,
                was_rejected=True,
                rejection_reason=fill_result.rejection_reason,
                queue_position=None,
                estimated_wait_ticks=None,
                pnl=0.0,
            )
            self.trade_analyses.append(analysis)

            return {
                "status": "rejected",
                "trade_intent_id": trade_intent.id,
                "reasons": [f"Fill failed: {fill_result.rejection_reason}"],
                "analysis": self._analysis_to_dict(analysis),
            }

        # 4. Use override price if provided, otherwise use VWAP from walk
        actual_price = fill_price_override if fill_price_override is not None else fill_result.avg_fill_price
        actual_size = fill_result.filled_size

        # 5. Simulate latency
        latency_ms = simulate_fill_latency()

        # 6. Compute fee (market orders are taker, limit orders at resting price are maker)
        is_limit_resting = trade_intent.limit_price != midpoint
        is_maker = is_limit_resting and not fill_result.is_partial
        notional = actual_price * actual_size
        fee = compute_fee(notional, self.cumulative_volume, is_maker)
        self.cumulative_volume += notional

        # 7. Queue position (for limit orders)
        queue_position = None
        estimated_wait_ticks = None
        if is_limit_resting:
            same_side_book = bids if side.lower() == "buy" else asks
            queue_est = estimate_queue_position(
                price=trade_intent.limit_price,
                size=actual_size,
                orderbook_levels=same_side_book,
            )
            queue_position = queue_est.position_behind
            estimated_wait_ticks = queue_est.estimated_wait_ticks

        # 8. Check balance
        cost = actual_price * actual_size + abs(fee)
        if cost > self.balance:
            actual_size = round((self.balance - abs(fee)) / actual_price, 2)
            if actual_size <= 0:
                return {
                    "status": "rejected",
                    "trade_intent_id": trade_intent.id,
                    "reasons": ["Insufficient balance after fees."],
                }
            cost = actual_price * actual_size + abs(fee)

        self.balance -= cost

        # 9. Create position
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

        # 10. Compute trade analysis
        worst_price = max(t.price for t in fill_result.tranches) if fill_result.tranches else actual_price
        best_price = min(t.price for t in fill_result.tranches) if fill_result.tranches else actual_price
        if side.lower() == "sell":
            worst_price, best_price = best_price, worst_price

        analysis = compute_trade_analysis(
            side=side,
            requested_size=requested_size,
            requested_price=trade_intent.limit_price,
            fill_price=actual_price,
            fill_size=actual_size,
            midpoint=midpoint,
            spread=market_data.spread,
            fee=fee,
            fee_type="maker" if is_maker else "taker",
            slippage_bps=fill_result.slippage_bps,
            latency_ms=latency_ms,
            tranches_count=len(fill_result.tranches),
            is_partial=fill_result.is_partial,
            was_rejected=False,
            rejection_reason=None,
            queue_position=queue_position,
            estimated_wait_ticks=estimated_wait_ticks,
            pnl=0.0,  # P&L computed on close
            worst_fill_price=worst_price,
            best_fill_price=best_price,
        )
        self.trade_analyses.append(analysis)

        status = "partial_fill" if fill_result.is_partial else "filled"

        return {
            "status": status,
            "position_id": position_id,
            "trade_intent_id": trade_intent.id,
            "fill_price": round(actual_price, 6),
            "fill_size": actual_size,
            "requested_size": requested_size,
            "cost": round(cost, 4),
            "fee": round(fee, 6),
            "fee_type": "maker" if is_maker else "taker",
            "slippage_bps": fill_result.slippage_bps,
            "simulated_latency_ms": latency_ms,
            "tranches": [{"price": t.price, "size": t.size} for t in fill_result.tranches],
            "remaining_balance": round(self.balance, 4),
            "analysis": self._analysis_to_dict(analysis),
        }

    def _execute_simple(
        self,
        trade_intent: TradeIntent,
        actual_price: float,
        actual_size: float,
    ) -> dict[str, Any]:
        """Legacy simple fill (no market data)."""
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

    def get_analysis(self) -> dict[str, Any]:
        """Return aggregate trade execution analysis."""
        agg = compute_aggregate_analysis(self.trade_analyses)
        return {
            "total_trades": agg.total_trades,
            "total_fills": agg.total_fills,
            "total_rejections": agg.total_rejections,
            "partial_fill_count": agg.partial_fill_count,
            "avg_slippage_bps": agg.avg_slippage_bps,
            "total_slippage_cost": agg.total_slippage_cost,
            "total_spread_cost": agg.total_spread_cost,
            "total_fee_cost": agg.total_fee_cost,
            "total_execution_cost": agg.total_execution_cost,
            "maker_fill_pct": agg.maker_fill_pct,
            "taker_fill_pct": agg.taker_fill_pct,
            "avg_fill_rate": agg.avg_fill_rate,
            "avg_latency_ms": agg.avg_latency_ms,
            "ideal_total_pnl": agg.ideal_total_pnl,
            "realistic_total_pnl": agg.realistic_total_pnl,
            "realism_drag_pct": agg.realism_drag_pct,
            "execution_quality_score": agg.execution_quality_score,
            "feedback": agg.feedback,
        }

    def get_trade_analyses(self) -> list[dict[str, Any]]:
        """Return per-trade analysis metrics."""
        return [self._analysis_to_dict(a) for a in self.trade_analyses]

    @staticmethod
    def _analysis_to_dict(a: TradeAnalysisMetrics) -> dict[str, Any]:
        return {
            "slippage_bps": a.slippage_bps,
            "slippage_cost_usd": a.slippage_cost_usd,
            "spread_cost_usd": a.spread_cost_usd,
            "fee_cost_usd": a.fee_cost_usd,
            "fee_type": a.fee_type,
            "total_execution_cost_usd": a.total_execution_cost_usd,
            "fill_rate": a.fill_rate,
            "is_partial": a.is_partial,
            "tranches_count": a.tranches_count,
            "vwap": a.vwap,
            "worst_fill_price": a.worst_fill_price,
            "best_fill_price": a.best_fill_price,
            "simulated_latency_ms": a.simulated_latency_ms,
            "ideal_pnl": a.ideal_pnl,
            "realistic_pnl": a.realistic_pnl,
            "realism_drag_pct": a.realism_drag_pct,
            "queue_position": a.queue_position,
            "estimated_wait_ticks": a.estimated_wait_ticks,
            "was_rejected": a.was_rejected,
            "rejection_reason": a.rejection_reason,
        }

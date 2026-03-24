from __future__ import annotations

import time
import uuid
from datetime import datetime

import numpy as np

from app.data.market_data import generate_market_data_series
from app.models.strategy import (
    BacktestResult,
    MarketData,
    SignalDirection,
    StrategyConfig,
)
from app.paper_execution.analysis import (
    AggregateAnalysis,
    TradeAnalysisMetrics,
    compute_aggregate_analysis,
    compute_trade_analysis,
)
from app.paper_execution.fill_models import (
    compute_fee,
    generate_synthetic_orderbook,
    simulate_fill_latency,
    walk_orderbook,
)
from app.risk.engine import RiskEngine
from app.risk.presets import get_preset
from app.strategies.base import BaseStrategy


class BacktestEngine:
    """Runs a strategy over historical (or simulated) market data and
    collects performance metrics.

    Enhanced with realistic fill models: orderbook walking, size-scaled
    slippage, dynamic fees, and latency simulation.
    """

    def __init__(
        self,
        strategy: BaseStrategy,
        config: StrategyConfig | None = None,
        risk_preset: str = "balanced",
        realistic_fills: bool = True,
    ) -> None:
        self.strategy = strategy
        self.config = config or StrategyConfig()
        self.strategy.configure(self.config)
        self.risk_engine = RiskEngine(limits=get_preset(risk_preset))
        self.realistic_fills = realistic_fills

    def run(
        self,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        market_data_series: list[MarketData] | None = None,
        num_snapshots: int = 100,
        base_price: float = 0.50,
        volatility: float = 0.02,
        seed: int | None = 42,
    ) -> BacktestResult:
        """Execute backtest and return results.

        If ``market_data_series`` is not provided, mock data is generated.
        When ``realistic_fills`` is True, uses orderbook walking and
        dynamic fees instead of perfect fills.
        """
        t0 = time.time()

        if market_data_series is None:
            market_data_series = generate_market_data_series(
                num_snapshots=num_snapshots,
                base_price=base_price,
                volatility=volatility,
                seed=seed,
            )

        if start_date is None:
            start_date = datetime.utcnow()
        if end_date is None:
            end_date = datetime.utcnow()

        capital = self.config.capital
        equity = capital
        self.risk_engine.update_equity(equity)

        trades: list[dict] = []
        equity_curve: list[float] = [equity]
        position: dict | None = None
        meta = self.strategy.metadata()
        trade_analyses: list[TradeAnalysisMetrics] = []
        cumulative_volume: float = 0.0

        for snapshot in market_data_series:
            signal = self.strategy.generate_signal(snapshot)

            if signal.direction == SignalDirection.HOLD:
                # Mark-to-market open position
                if position is not None:
                    unrealised = self._calc_unrealised(position, snapshot.outcome_yes_price)
                    equity_curve.append(round(capital + sum(t["pnl"] for t in trades) + unrealised, 2))
                else:
                    equity_curve.append(equity_curve[-1])
                continue

            intent = self.strategy.generate_trade_intent(signal)
            decision = self.risk_engine.validate(intent, strategy_risk_level=meta.risk_level)

            if not decision.approved:
                equity_curve.append(equity_curve[-1])
                continue

            actual_size = decision.adjusted_size if decision.adjusted_size else intent.size

            # Close existing position if direction flips
            if position is not None and position["side"] != signal.direction.value:
                exit_price = snapshot.outcome_yes_price

                # Apply realistic fill on exit
                if self.realistic_fills:
                    exit_result = self._simulate_fill(
                        side="sell" if position["side"] == "buy" else "buy",
                        size=position["size"],
                        price=exit_price,
                        snapshot=snapshot,
                        cumulative_volume=cumulative_volume,
                    )
                    exit_price = exit_result["fill_price"]
                    cumulative_volume += exit_price * exit_result["fill_size"]

                pnl = self._close_position(position, exit_price)

                # Deduct fees from P&L if realistic
                if self.realistic_fills:
                    pnl -= exit_result.get("fee", 0)

                trades.append({
                    "market_id": snapshot.market_id,
                    "side": position["side"],
                    "entry_price": position["entry_price"],
                    "exit_price": exit_price,
                    "size": position["size"],
                    "pnl": round(pnl, 4),
                    **({"slippage_bps": exit_result.get("slippage_bps", 0),
                        "fee": exit_result.get("fee", 0),
                        "latency_ms": exit_result.get("latency_ms", 0),
                        } if self.realistic_fills else {}),
                })
                equity += pnl
                self.risk_engine.record_pnl(pnl)
                position = None

            # Open new position
            if position is None:
                entry_price = intent.limit_price

                if self.realistic_fills:
                    entry_result = self._simulate_fill(
                        side=signal.direction.value,
                        size=actual_size,
                        price=entry_price,
                        snapshot=snapshot,
                        cumulative_volume=cumulative_volume,
                    )
                    entry_price = entry_result["fill_price"]
                    actual_size = entry_result["fill_size"]
                    cumulative_volume += entry_price * actual_size

                    # Track analysis for the entry
                    midpoint = (snapshot.outcome_yes_price + snapshot.outcome_no_price) / 2
                    analysis = compute_trade_analysis(
                        side=signal.direction.value,
                        requested_size=intent.size,
                        requested_price=intent.limit_price,
                        fill_price=entry_price,
                        fill_size=actual_size,
                        midpoint=midpoint,
                        spread=snapshot.spread,
                        fee=entry_result.get("fee", 0),
                        fee_type=entry_result.get("fee_type", "taker"),
                        slippage_bps=entry_result.get("slippage_bps", 0),
                        latency_ms=entry_result.get("latency_ms", 0),
                        tranches_count=entry_result.get("tranches_count", 1),
                        is_partial=entry_result.get("is_partial", False),
                        was_rejected=False,
                        rejection_reason=None,
                        queue_position=None,
                        estimated_wait_ticks=None,
                        pnl=0.0,
                    )
                    trade_analyses.append(analysis)

                    # Deduct entry fee from equity
                    equity -= entry_result.get("fee", 0)

                position = {
                    "side": signal.direction.value,
                    "entry_price": entry_price,
                    "size": actual_size,
                    "stop_loss": intent.stop_loss,
                    "take_profit": intent.take_profit,
                }
                self.risk_engine.open_positions += 1

            equity_curve.append(round(equity, 2))

        # Close any remaining position at last price
        if position is not None and market_data_series:
            last_price = market_data_series[-1].outcome_yes_price

            if self.realistic_fills:
                exit_result = self._simulate_fill(
                    side="sell" if position["side"] == "buy" else "buy",
                    size=position["size"],
                    price=last_price,
                    snapshot=market_data_series[-1],
                    cumulative_volume=cumulative_volume,
                )
                last_price = exit_result["fill_price"]

            pnl = self._close_position(position, last_price)
            if self.realistic_fills:
                pnl -= exit_result.get("fee", 0)

            trades.append({
                "market_id": market_data_series[-1].market_id,
                "side": position["side"],
                "entry_price": position["entry_price"],
                "exit_price": last_price,
                "size": position["size"],
                "pnl": round(pnl, 4),
            })
            equity += pnl

        metrics = self.strategy.compute_metrics(trades)
        sharpe = self._compute_sharpe(equity_curve)
        max_dd = self._compute_max_drawdown(equity_curve)

        result = BacktestResult(
            id=str(uuid.uuid4()),
            strategy_slug=meta.slug,
            start_date=start_date,
            end_date=end_date,
            config=self.config,
            total_trades=metrics["total_trades"],
            winning_trades=metrics.get("winning_trades", 0),
            losing_trades=metrics.get("losing_trades", 0),
            total_pnl=round(metrics["total_pnl"], 4),
            max_drawdown=round(max_dd, 4),
            sharpe_ratio=round(sharpe, 4),
            win_rate=round(metrics["win_rate"], 4),
            profit_factor=round(metrics["profit_factor"], 4),
            avg_trade_pnl=round(metrics["avg_pnl"], 4),
            equity_curve=equity_curve,
            trades=trades,
            duration_seconds=round(time.time() - t0, 3),
        )

        # Attach execution analysis if realistic fills were used
        if self.realistic_fills and trade_analyses:
            agg = compute_aggregate_analysis(trade_analyses)
            result.execution_analysis = {
                "total_trades": agg.total_trades,
                "avg_slippage_bps": agg.avg_slippage_bps,
                "total_execution_cost": agg.total_execution_cost,
                "avg_fill_rate": agg.avg_fill_rate,
                "avg_latency_ms": agg.avg_latency_ms,
                "realism_drag_pct": agg.realism_drag_pct,
                "execution_quality_score": agg.execution_quality_score,
                "feedback": agg.feedback,
            }

        return result

    def _simulate_fill(
        self,
        side: str,
        size: float,
        price: float,
        snapshot: MarketData,
        cumulative_volume: float,
    ) -> dict:
        """Simulate a realistic fill using orderbook walking and fees."""
        midpoint = (snapshot.outcome_yes_price + snapshot.outcome_no_price) / 2

        # Get or generate orderbook
        if snapshot.orderbook_asks and snapshot.orderbook_bids:
            asks = snapshot.orderbook_asks
            bids = snapshot.orderbook_bids
        else:
            liquidity_factor = max(0.3, snapshot.liquidity / 100_000) if snapshot.liquidity > 0 else 1.0
            bids, asks = generate_synthetic_orderbook(
                midpoint=midpoint,
                spread=snapshot.spread or 0.02,
                liquidity_factor=liquidity_factor,
            )

        book_side = asks if side.lower() == "buy" else bids
        fill_result = walk_orderbook(
            side=side,
            size=size,
            orderbook_levels=book_side,
            midpoint=midpoint,
        )

        if fill_result.rejected:
            # Fall back to simple fill at requested price
            return {
                "fill_price": price,
                "fill_size": size,
                "fee": 0,
                "fee_type": "taker",
                "slippage_bps": 0,
                "latency_ms": 0,
                "tranches_count": 1,
                "is_partial": False,
            }

        fill_price = fill_result.avg_fill_price
        fill_size = fill_result.filled_size
        notional = fill_price * fill_size

        # Compute fee (backtest orders are primarily taker)
        fee = compute_fee(notional, cumulative_volume, is_maker=False)

        # Simulate latency (value only, no actual delay)
        latency_ms = simulate_fill_latency()

        return {
            "fill_price": fill_price,
            "fill_size": fill_size,
            "fee": fee,
            "fee_type": "taker",
            "slippage_bps": fill_result.slippage_bps,
            "latency_ms": latency_ms,
            "tranches_count": len(fill_result.tranches),
            "is_partial": fill_result.is_partial,
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _close_position(position: dict, current_price: float) -> float:
        entry = position["entry_price"]
        size = position["size"]
        if position["side"] == "buy":
            return (current_price - entry) * size
        else:
            return (entry - current_price) * size

    @staticmethod
    def _calc_unrealised(position: dict, current_price: float) -> float:
        entry = position["entry_price"]
        size = position["size"]
        if position["side"] == "buy":
            return (current_price - entry) * size
        return (entry - current_price) * size

    @staticmethod
    def _compute_sharpe(equity_curve: list[float], risk_free: float = 0.0) -> float:
        if len(equity_curve) < 2:
            return 0.0
        returns = []
        for i in range(1, len(equity_curve)):
            if equity_curve[i - 1] != 0:
                returns.append((equity_curve[i] - equity_curve[i - 1]) / abs(equity_curve[i - 1]))
        if not returns:
            return 0.0
        arr = np.array(returns)
        std = float(np.std(arr))
        if std == 0:
            return 0.0
        mean_ret = float(np.mean(arr)) - risk_free
        return mean_ret / std

    @staticmethod
    def _compute_max_drawdown(equity_curve: list[float]) -> float:
        if not equity_curve:
            return 0.0
        peak = equity_curve[0]
        max_dd = 0.0
        for val in equity_curve:
            if val > peak:
                peak = val
            dd = (peak - val) / peak if peak > 0 else 0.0
            if dd > max_dd:
                max_dd = dd
        return max_dd

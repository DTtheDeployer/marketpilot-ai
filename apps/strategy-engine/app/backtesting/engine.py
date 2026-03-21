from __future__ import annotations

import time
import uuid
from datetime import datetime

import numpy as np

from app.data.market_data import generate_market_data_series
from app.models.strategy import (
    BacktestResult,
    MarketData,
    RiskLevel,
    SignalDirection,
    StrategyConfig,
)
from app.risk.engine import RiskEngine
from app.risk.presets import get_preset
from app.strategies.base import BaseStrategy


class BacktestEngine:
    """Runs a strategy over historical (or simulated) market data and
    collects performance metrics.
    """

    def __init__(
        self,
        strategy: BaseStrategy,
        config: StrategyConfig | None = None,
        risk_preset: str = "balanced",
    ) -> None:
        self.strategy = strategy
        self.config = config or StrategyConfig()
        self.strategy.configure(self.config)
        self.risk_engine = RiskEngine(limits=get_preset(risk_preset))

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
        peak_equity = equity
        self.risk_engine.update_equity(equity)

        trades: list[dict] = []
        equity_curve: list[float] = [equity]
        position: dict | None = None
        meta = self.strategy.metadata()

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
                pnl = self._close_position(position, snapshot.outcome_yes_price)
                trades.append({
                    "market_id": snapshot.market_id,
                    "side": position["side"],
                    "entry_price": position["entry_price"],
                    "exit_price": snapshot.outcome_yes_price,
                    "size": position["size"],
                    "pnl": round(pnl, 4),
                })
                equity += pnl
                self.risk_engine.record_pnl(pnl)
                position = None

            # Open new position
            if position is None:
                position = {
                    "side": signal.direction.value,
                    "entry_price": intent.limit_price,
                    "size": actual_size,
                    "stop_loss": intent.stop_loss,
                    "take_profit": intent.take_profit,
                }
                self.risk_engine.open_positions += 1

            equity_curve.append(round(equity, 2))

        # Close any remaining position at last price
        if position is not None and market_data_series:
            last_price = market_data_series[-1].outcome_yes_price
            pnl = self._close_position(position, last_price)
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

        return BacktestResult(
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

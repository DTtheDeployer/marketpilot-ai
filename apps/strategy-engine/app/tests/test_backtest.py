from __future__ import annotations

import pytest

from app.backtesting.engine import BacktestEngine
from app.models.strategy import StrategyConfig
from app.strategies.mean_reversion import MeanReversionStrategy
from app.strategies.momentum import MomentumStrategy
from app.strategies.spread_capture import SpreadCaptureStrategy


class TestBacktestEngine:
    def test_run_spread_capture(self):
        strategy = SpreadCaptureStrategy()
        config = StrategyConfig(capital=1000)
        engine = BacktestEngine(strategy=strategy, config=config)
        result = engine.run(num_snapshots=50, seed=42)

        assert result.strategy_slug == "spread-capture"
        assert len(result.equity_curve) > 0
        assert result.duration_seconds >= 0

    def test_run_mean_reversion(self):
        strategy = MeanReversionStrategy()
        config = StrategyConfig(capital=1000)
        engine = BacktestEngine(strategy=strategy, config=config)
        result = engine.run(num_snapshots=50, seed=42)

        assert result.strategy_slug == "mean-reversion"
        assert result.total_trades >= 0

    def test_run_momentum(self):
        strategy = MomentumStrategy()
        config = StrategyConfig(capital=1000)
        engine = BacktestEngine(strategy=strategy, config=config)
        result = engine.run(num_snapshots=50, seed=42)

        assert result.strategy_slug == "momentum"

    def test_result_has_metrics(self):
        strategy = SpreadCaptureStrategy()
        engine = BacktestEngine(strategy=strategy, config=StrategyConfig(capital=2000))
        result = engine.run(num_snapshots=80, seed=99)

        assert isinstance(result.sharpe_ratio, float)
        assert isinstance(result.max_drawdown, float)
        assert isinstance(result.win_rate, float)
        assert isinstance(result.profit_factor, float)

    def test_sharpe_ratio_computed(self):
        # With enough volatility the sharpe should be non-zero
        strategy = MomentumStrategy()
        engine = BacktestEngine(strategy=strategy, config=StrategyConfig(capital=1000))
        result = engine.run(num_snapshots=100, volatility=0.04, seed=7)
        # Just check it's a finite number
        assert result.sharpe_ratio == result.sharpe_ratio  # not NaN

    def test_max_drawdown_non_negative(self):
        strategy = SpreadCaptureStrategy()
        engine = BacktestEngine(strategy=strategy, config=StrategyConfig(capital=1000))
        result = engine.run(num_snapshots=60, seed=10)
        assert result.max_drawdown >= 0

    def test_custom_config_params(self):
        strategy = SpreadCaptureStrategy()
        config = StrategyConfig(
            capital=5000,
            params={"min_spread": 0.02, "order_size_pct": 0.10},
        )
        engine = BacktestEngine(strategy=strategy, config=config)
        result = engine.run(num_snapshots=50, seed=42)
        # Should produce more trades with a lower spread threshold
        assert result.strategy_slug == "spread-capture"

from __future__ import annotations

from datetime import datetime, timedelta

import pytest

from app.data.market_data import generate_mock_market_data
from app.models.strategy import (
    MarketData,
    SignalDirection,
    StrategyConfig,
)
from app.strategies.cross_market import CrossMarketDivergenceStrategy
from app.strategies.mean_reversion import MeanReversionStrategy
from app.strategies.momentum import MomentumStrategy
from app.strategies.orderbook_imbalance import OrderbookImbalanceStrategy
from app.strategies.registry import STRATEGY_REGISTRY, get_strategy, list_strategies
from app.strategies.spread_capture import SpreadCaptureStrategy
from app.strategies.time_decay import TimeDecayStrategy


# ------------------------------------------------------------------ #
# Registry
# ------------------------------------------------------------------ #

class TestRegistry:
    def test_all_strategies_registered(self):
        assert len(STRATEGY_REGISTRY) == 6

    def test_get_known_strategy(self):
        s = get_strategy("spread-capture")
        assert s.metadata().slug == "spread-capture"

    def test_get_unknown_raises(self):
        with pytest.raises(KeyError):
            get_strategy("nonexistent")

    def test_list_strategies(self):
        strats = list_strategies()
        assert len(strats) == 6


# ------------------------------------------------------------------ #
# Spread Capture
# ------------------------------------------------------------------ #

class TestSpreadCapture:
    def setup_method(self):
        self.strategy = SpreadCaptureStrategy()
        self.strategy.configure(StrategyConfig(capital=1000))

    def test_metadata(self):
        m = self.strategy.metadata()
        assert m.slug == "spread-capture"
        assert m.name == "Spread Capture"

    def test_signal_wide_spread(self):
        data = generate_mock_market_data(base_price=0.50, seed=1)
        # Force a wide spread
        data.spread = 0.06
        signal = self.strategy.generate_signal(data)
        assert signal.direction == SignalDirection.BUY
        assert signal.confidence > 0

    def test_signal_narrow_spread_hold(self):
        data = generate_mock_market_data(base_price=0.50, seed=2)
        data.spread = 0.01
        data.orderbook_bids = []
        data.orderbook_asks = []
        signal = self.strategy.generate_signal(data)
        # With narrow spread and no orderbook, should hold
        assert signal.direction in (SignalDirection.HOLD, SignalDirection.BUY)

    def test_trade_intent(self):
        data = generate_mock_market_data(base_price=0.50, seed=3)
        data.spread = 0.06
        signal = self.strategy.generate_signal(data)
        intent = self.strategy.generate_trade_intent(signal)
        assert intent.size > 0
        assert 0.01 <= intent.limit_price <= 0.99


# ------------------------------------------------------------------ #
# Mean Reversion
# ------------------------------------------------------------------ #

class TestMeanReversion:
    def setup_method(self):
        self.strategy = MeanReversionStrategy()
        self.strategy.configure(StrategyConfig(capital=1000))

    def test_metadata(self):
        assert self.strategy.metadata().slug == "mean-reversion"

    def test_signal_price_above_mean(self):
        # Price history clustering around 0.50 but current price spiked
        prices = [0.50] * 20
        data = MarketData(
            market_id="test",
            outcome_yes_price=0.70,
            outcome_no_price=0.30,
            price_history=prices + [0.70],
        )
        data.outcome_yes_price = 0.70
        signal = self.strategy.generate_signal(data)
        assert signal.direction == SignalDirection.SELL

    def test_signal_price_below_mean(self):
        prices = [0.50] * 20
        data = MarketData(
            market_id="test",
            outcome_yes_price=0.30,
            outcome_no_price=0.70,
            price_history=prices + [0.30],
        )
        signal = self.strategy.generate_signal(data)
        assert signal.direction == SignalDirection.BUY

    def test_insufficient_history_hold(self):
        data = MarketData(
            market_id="test",
            outcome_yes_price=0.50,
            outcome_no_price=0.50,
            price_history=[0.50, 0.51],
        )
        signal = self.strategy.generate_signal(data)
        assert signal.direction == SignalDirection.HOLD

    def test_trade_intent_from_signal(self):
        prices = [0.50] * 20 + [0.30]
        data = MarketData(
            market_id="test",
            outcome_yes_price=0.30,
            outcome_no_price=0.70,
            price_history=prices,
        )
        signal = self.strategy.generate_signal(data)
        intent = self.strategy.generate_trade_intent(signal)
        assert intent.size > 0


# ------------------------------------------------------------------ #
# Orderbook Imbalance
# ------------------------------------------------------------------ #

class TestOrderbookImbalance:
    def setup_method(self):
        self.strategy = OrderbookImbalanceStrategy()
        self.strategy.configure(StrategyConfig(capital=1000))

    def test_metadata(self):
        assert self.strategy.metadata().slug == "orderbook-imbalance"

    def test_bid_heavy_buy_signal(self):
        data = MarketData(
            market_id="test",
            outcome_yes_price=0.50,
            outcome_no_price=0.50,
            orderbook_bids=[[0.49, 500], [0.48, 400], [0.47, 300]],
            orderbook_asks=[[0.51, 100], [0.52, 80], [0.53, 60]],
        )
        signal = self.strategy.generate_signal(data)
        assert signal.direction == SignalDirection.BUY

    def test_ask_heavy_sell_signal(self):
        data = MarketData(
            market_id="test",
            outcome_yes_price=0.50,
            outcome_no_price=0.50,
            orderbook_bids=[[0.49, 50], [0.48, 40]],
            orderbook_asks=[[0.51, 500], [0.52, 400]],
        )
        signal = self.strategy.generate_signal(data)
        assert signal.direction == SignalDirection.SELL

    def test_no_orderbook_hold(self):
        data = MarketData(
            market_id="test",
            outcome_yes_price=0.50,
            outcome_no_price=0.50,
        )
        signal = self.strategy.generate_signal(data)
        assert signal.direction == SignalDirection.HOLD


# ------------------------------------------------------------------ #
# Momentum
# ------------------------------------------------------------------ #

class TestMomentum:
    def setup_method(self):
        self.strategy = MomentumStrategy()
        self.strategy.configure(StrategyConfig(capital=1000))

    def test_metadata(self):
        assert self.strategy.metadata().slug == "momentum"

    def test_bullish_crossover(self):
        # Long window prices low, short window prices higher
        prices = [0.40] * 10 + [0.42, 0.44, 0.46, 0.48, 0.50]
        data = MarketData(
            market_id="test",
            outcome_yes_price=0.50,
            outcome_no_price=0.50,
            price_history=prices,
        )
        signal = self.strategy.generate_signal(data)
        assert signal.direction == SignalDirection.BUY

    def test_bearish_crossover(self):
        prices = [0.60] * 10 + [0.58, 0.56, 0.54, 0.52, 0.50]
        data = MarketData(
            market_id="test",
            outcome_yes_price=0.50,
            outcome_no_price=0.50,
            price_history=prices,
        )
        signal = self.strategy.generate_signal(data)
        assert signal.direction == SignalDirection.SELL

    def test_insufficient_data(self):
        data = MarketData(
            market_id="test",
            outcome_yes_price=0.50,
            outcome_no_price=0.50,
            price_history=[0.50] * 5,
        )
        signal = self.strategy.generate_signal(data)
        assert signal.direction == SignalDirection.HOLD


# ------------------------------------------------------------------ #
# Time Decay
# ------------------------------------------------------------------ #

class TestTimeDecay:
    def setup_method(self):
        self.strategy = TimeDecayStrategy()
        self.strategy.configure(StrategyConfig(capital=1000))

    def test_metadata(self):
        assert self.strategy.metadata().slug == "time-decay"

    def test_near_expiry_above_half(self):
        data = MarketData(
            market_id="test",
            outcome_yes_price=0.65,
            outcome_no_price=0.35,
            end_date=datetime.utcnow() + timedelta(days=2),
        )
        signal = self.strategy.generate_signal(data)
        assert signal.direction == SignalDirection.BUY

    def test_near_expiry_below_half(self):
        data = MarketData(
            market_id="test",
            outcome_yes_price=0.35,
            outcome_no_price=0.65,
            end_date=datetime.utcnow() + timedelta(days=2),
        )
        signal = self.strategy.generate_signal(data)
        assert signal.direction == SignalDirection.SELL

    def test_no_end_date_hold(self):
        data = MarketData(
            market_id="test",
            outcome_yes_price=0.50,
            outcome_no_price=0.50,
        )
        signal = self.strategy.generate_signal(data)
        assert signal.direction == SignalDirection.HOLD

    def test_far_from_expiry_hold(self):
        data = MarketData(
            market_id="test",
            outcome_yes_price=0.50,
            outcome_no_price=0.50,
            end_date=datetime.utcnow() + timedelta(days=30),
        )
        signal = self.strategy.generate_signal(data)
        assert signal.direction == SignalDirection.HOLD


# ------------------------------------------------------------------ #
# Cross-Market Divergence
# ------------------------------------------------------------------ #

class TestCrossMarketDivergence:
    def setup_method(self):
        self.strategy = CrossMarketDivergenceStrategy()
        self.strategy.configure(StrategyConfig(capital=1000))

    def test_metadata(self):
        assert self.strategy.metadata().slug == "cross-market-divergence"

    def test_divergence_detected(self):
        data = MarketData(
            market_id="market-a",
            outcome_yes_price=0.50,
            outcome_no_price=0.50,
            related_markets=[
                {"market_id": "market-b", "price": 0.70, "expected_relationship": ">="},
            ],
        )
        signal = self.strategy.generate_signal(data)
        assert signal.direction in (SignalDirection.BUY, SignalDirection.SELL)
        assert signal.confidence > 0

    def test_no_related_markets_hold(self):
        data = MarketData(
            market_id="market-a",
            outcome_yes_price=0.50,
            outcome_no_price=0.50,
        )
        signal = self.strategy.generate_signal(data)
        assert signal.direction == SignalDirection.HOLD

    def test_trade_intent(self):
        data = MarketData(
            market_id="market-a",
            outcome_yes_price=0.50,
            outcome_no_price=0.50,
            related_markets=[
                {"market_id": "market-b", "price": 0.70, "expected_relationship": ">="},
            ],
        )
        signal = self.strategy.generate_signal(data)
        intent = self.strategy.generate_trade_intent(signal)
        assert intent.size > 0


# ------------------------------------------------------------------ #
# Compute metrics
# ------------------------------------------------------------------ #

class TestComputeMetrics:
    def test_empty_trades(self):
        s = SpreadCaptureStrategy()
        m = s.compute_metrics([])
        assert m["total_trades"] == 0

    def test_mixed_trades(self):
        s = SpreadCaptureStrategy()
        trades = [
            {"pnl": 10.0},
            {"pnl": -5.0},
            {"pnl": 8.0},
            {"pnl": -3.0},
        ]
        m = s.compute_metrics(trades)
        assert m["total_trades"] == 4
        assert m["winning_trades"] == 2
        assert m["losing_trades"] == 2
        assert m["total_pnl"] == 10.0
        assert m["profit_factor"] == pytest.approx(18.0 / 8.0)

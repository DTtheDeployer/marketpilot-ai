from __future__ import annotations

import statistics

from app.models.strategy import (
    MarketData,
    RiskLevel,
    Signal,
    SignalDirection,
    StrategyConfig,
    StrategyMeta,
    TradeIntent,
)
from app.strategies.base import BaseStrategy


class MeanReversionStrategy(BaseStrategy):
    """Bets that prices revert to their historical mean after deviating.

    When the current price is significantly above or below the rolling
    average, the strategy takes a contrarian position expecting reversion.
    """

    def metadata(self) -> StrategyMeta:
        return StrategyMeta(
            slug="mean-reversion",
            name="Mean Reversion",
            description="Trades against price deviations from the historical mean.",
            thesis=(
                "Prediction market prices often overshoot on news and sentiment. "
                "By identifying statistically significant deviations from the mean, "
                "we can profit from the subsequent reversion."
            ),
            risk_level=RiskLevel.MEDIUM,
            config_defaults={
                "lookback_periods": 20,
                "z_score_threshold": 1.5,
                "order_size_pct": 0.08,
            },
            tags=["contrarian", "mean-reversion", "statistical"],
        )

    def generate_signal(self, market_data: MarketData) -> Signal:
        params = self._config.params
        lookback = int(params.get("lookback_periods", 20))
        z_threshold = float(params.get("z_score_threshold", 1.5))

        prices = market_data.price_history
        if len(prices) < max(lookback, 3):
            return Signal(
                strategy_slug="mean-reversion",
                market_id=market_data.market_id,
                direction=SignalDirection.HOLD,
                confidence=0.0,
                target_price=market_data.outcome_yes_price,
                reasoning="Insufficient price history for mean-reversion analysis.",
            )

        window = prices[-lookback:]
        mean = statistics.mean(window)
        stdev = statistics.pstdev(window)
        current = market_data.outcome_yes_price

        if stdev == 0:
            return Signal(
                strategy_slug="mean-reversion",
                market_id=market_data.market_id,
                direction=SignalDirection.HOLD,
                confidence=0.0,
                target_price=current,
                reasoning="Zero standard deviation — price is flat.",
            )

        z_score = (current - mean) / stdev

        if z_score > z_threshold:
            confidence = min(abs(z_score) / (z_threshold * 2), 1.0)
            return Signal(
                strategy_slug="mean-reversion",
                market_id=market_data.market_id,
                direction=SignalDirection.SELL,
                confidence=round(confidence, 4),
                target_price=round(mean, 4),
                reasoning=(
                    f"Price {current:.4f} is {z_score:.2f} stdevs above mean {mean:.4f}. "
                    "Expecting downward reversion."
                ),
                metadata={"z_score": round(z_score, 4), "mean": round(mean, 4), "stdev": round(stdev, 4)},
            )

        if z_score < -z_threshold:
            confidence = min(abs(z_score) / (z_threshold * 2), 1.0)
            return Signal(
                strategy_slug="mean-reversion",
                market_id=market_data.market_id,
                direction=SignalDirection.BUY,
                confidence=round(confidence, 4),
                target_price=round(mean, 4),
                reasoning=(
                    f"Price {current:.4f} is {z_score:.2f} stdevs below mean {mean:.4f}. "
                    "Expecting upward reversion."
                ),
                metadata={"z_score": round(z_score, 4), "mean": round(mean, 4), "stdev": round(stdev, 4)},
            )

        return Signal(
            strategy_slug="mean-reversion",
            market_id=market_data.market_id,
            direction=SignalDirection.HOLD,
            confidence=0.0,
            target_price=round(mean, 4),
            reasoning=f"Z-score {z_score:.2f} within threshold +/-{z_threshold}. No trade.",
        )

    def generate_trade_intent(self, signal: Signal) -> TradeIntent:
        size_pct = self._config.params.get("order_size_pct", 0.08)
        capital = self._config.capital
        size = round(capital * size_pct, 2)

        if signal.direction == SignalDirection.BUY:
            limit_price = round(signal.target_price * 0.98, 4)
            stop_loss = round(limit_price - 0.08, 4)
            take_profit = round(signal.target_price, 4)
        else:
            limit_price = round(signal.target_price * 1.02, 4)
            stop_loss = round(limit_price + 0.08, 4)
            take_profit = round(signal.target_price, 4)

        return TradeIntent(
            signal=signal,
            side=signal.direction,
            outcome="yes" if signal.direction == SignalDirection.BUY else "no",
            size=size,
            limit_price=max(min(limit_price, 0.99), 0.01),
            stop_loss=max(min(stop_loss, 0.99), 0.01),
            take_profit=max(min(take_profit, 0.99), 0.01),
        )

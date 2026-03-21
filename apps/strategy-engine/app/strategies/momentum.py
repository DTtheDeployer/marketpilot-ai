from __future__ import annotations

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


class MomentumStrategy(BaseStrategy):
    """Follows the trend: buys when prices are rising, sells when falling.

    Uses a simple moving average crossover of short vs long windows to
    determine momentum direction and strength.
    """

    def metadata(self) -> StrategyMeta:
        return StrategyMeta(
            slug="momentum",
            name="Momentum",
            description="Trend-following strategy based on moving average crossover.",
            thesis=(
                "Markets in motion tend to stay in motion. When a short-term average "
                "crosses above the long-term average, upward momentum is confirmed "
                "and prices are likely to continue rising."
            ),
            risk_level=RiskLevel.MEDIUM,
            config_defaults={
                "short_window": 5,
                "long_window": 15,
                "order_size_pct": 0.07,
                "min_crossover_gap": 0.005,
            },
            tags=["trend", "momentum", "moving-average"],
        )

    def generate_signal(self, market_data: MarketData) -> Signal:
        params = self._config.params
        short_w = int(params.get("short_window", 5))
        long_w = int(params.get("long_window", 15))
        min_gap = float(params.get("min_crossover_gap", 0.005))

        prices = market_data.price_history
        if len(prices) < long_w:
            return Signal(
                strategy_slug="momentum",
                market_id=market_data.market_id,
                direction=SignalDirection.HOLD,
                confidence=0.0,
                target_price=market_data.outcome_yes_price,
                reasoning=f"Need at least {long_w} price points; have {len(prices)}.",
            )

        short_ma = sum(prices[-short_w:]) / short_w
        long_ma = sum(prices[-long_w:]) / long_w
        gap = short_ma - long_ma

        if gap > min_gap:
            confidence = min(abs(gap) / 0.05, 1.0)
            target = min(market_data.outcome_yes_price + abs(gap), 0.99)
            return Signal(
                strategy_slug="momentum",
                market_id=market_data.market_id,
                direction=SignalDirection.BUY,
                confidence=round(confidence, 4),
                target_price=round(target, 4),
                reasoning=(
                    f"Bullish crossover: short MA {short_ma:.4f} > long MA {long_ma:.4f} "
                    f"by {gap:.4f}."
                ),
                metadata={"short_ma": round(short_ma, 4), "long_ma": round(long_ma, 4), "gap": round(gap, 4)},
            )

        if gap < -min_gap:
            confidence = min(abs(gap) / 0.05, 1.0)
            target = max(market_data.outcome_yes_price - abs(gap), 0.01)
            return Signal(
                strategy_slug="momentum",
                market_id=market_data.market_id,
                direction=SignalDirection.SELL,
                confidence=round(confidence, 4),
                target_price=round(target, 4),
                reasoning=(
                    f"Bearish crossover: short MA {short_ma:.4f} < long MA {long_ma:.4f} "
                    f"by {abs(gap):.4f}."
                ),
                metadata={"short_ma": round(short_ma, 4), "long_ma": round(long_ma, 4), "gap": round(gap, 4)},
            )

        return Signal(
            strategy_slug="momentum",
            market_id=market_data.market_id,
            direction=SignalDirection.HOLD,
            confidence=0.0,
            target_price=market_data.outcome_yes_price,
            reasoning=f"Moving averages converged (gap {gap:.4f}). No clear trend.",
        )

    def generate_trade_intent(self, signal: Signal) -> TradeIntent:
        size_pct = self._config.params.get("order_size_pct", 0.07)
        capital = self._config.capital
        size = round(capital * size_pct, 2)

        if signal.direction == SignalDirection.BUY:
            limit_price = round(signal.target_price * 0.99, 4)
            stop_loss = round(limit_price - 0.06, 4)
            take_profit = round(signal.target_price * 1.03, 4)
        else:
            limit_price = round(signal.target_price * 1.01, 4)
            stop_loss = round(limit_price + 0.06, 4)
            take_profit = round(signal.target_price * 0.97, 4)

        return TradeIntent(
            signal=signal,
            side=signal.direction,
            outcome="yes" if signal.direction == SignalDirection.BUY else "no",
            size=size,
            limit_price=max(min(limit_price, 0.99), 0.01),
            stop_loss=max(min(stop_loss, 0.99), 0.01),
            take_profit=max(min(take_profit, 0.99), 0.01),
        )

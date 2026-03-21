from __future__ import annotations

from datetime import datetime

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


class TimeDecayStrategy(BaseStrategy):
    """Exploits time-value decay as markets approach resolution.

    As a prediction market's end date nears, prices should converge toward
    0 or 1.  This strategy identifies markets where the price has not yet
    converged and bets on the convergence direction.
    """

    def metadata(self) -> StrategyMeta:
        return StrategyMeta(
            slug="time-decay",
            name="Time Decay",
            description="Profits from price convergence as markets approach expiry.",
            thesis=(
                "Markets that are close to expiry but still trading far from 0 or 1 "
                "represent an opportunity: the price must converge, and the direction "
                "of convergence can often be inferred from the current price bias."
            ),
            risk_level=RiskLevel.LOW,
            config_defaults={
                "days_to_expiry_max": 7,
                "convergence_threshold": 0.20,
                "order_size_pct": 0.05,
            },
            tags=["time-decay", "expiry", "convergence"],
        )

    def generate_signal(self, market_data: MarketData) -> Signal:
        params = self._config.params
        max_days = float(params.get("days_to_expiry_max", 7))
        conv_thresh = float(params.get("convergence_threshold", 0.20))

        if market_data.end_date is None:
            return Signal(
                strategy_slug="time-decay",
                market_id=market_data.market_id,
                direction=SignalDirection.HOLD,
                confidence=0.0,
                target_price=market_data.outcome_yes_price,
                reasoning="No end date available — cannot assess time decay.",
            )

        now = datetime.utcnow()
        days_left = (market_data.end_date - now).total_seconds() / 86400.0

        if days_left < 0 or days_left > max_days:
            return Signal(
                strategy_slug="time-decay",
                market_id=market_data.market_id,
                direction=SignalDirection.HOLD,
                confidence=0.0,
                target_price=market_data.outcome_yes_price,
                reasoning=f"Days to expiry ({days_left:.1f}) outside window [0, {max_days}].",
            )

        price = market_data.outcome_yes_price
        distance_from_edge = min(price, 1.0 - price)

        if distance_from_edge < conv_thresh:
            return Signal(
                strategy_slug="time-decay",
                market_id=market_data.market_id,
                direction=SignalDirection.HOLD,
                confidence=0.0,
                target_price=price,
                reasoning=f"Price {price:.4f} already near edge. Convergence mostly priced in.",
            )

        time_pressure = 1.0 - (days_left / max_days)
        confidence = min(time_pressure * (distance_from_edge / 0.5), 1.0)

        if price > 0.5:
            direction = SignalDirection.BUY
            target = min(price + distance_from_edge * 0.5, 0.95)
        else:
            direction = SignalDirection.SELL
            target = max(price - distance_from_edge * 0.5, 0.05)

        return Signal(
            strategy_slug="time-decay",
            market_id=market_data.market_id,
            direction=direction,
            confidence=round(confidence, 4),
            target_price=round(target, 4),
            reasoning=(
                f"Market expires in {days_left:.1f} days. Price {price:.4f} still "
                f"{distance_from_edge:.4f} from nearest edge. Time pressure {time_pressure:.2%}."
            ),
            metadata={"days_left": round(days_left, 2), "time_pressure": round(time_pressure, 4)},
        )

    def generate_trade_intent(self, signal: Signal) -> TradeIntent:
        size_pct = self._config.params.get("order_size_pct", 0.05)
        capital = self._config.capital
        size = round(capital * size_pct, 2)

        if signal.direction == SignalDirection.BUY:
            limit_price = round(signal.target_price * 0.98, 4)
        else:
            limit_price = round(signal.target_price * 1.02, 4)

        return TradeIntent(
            signal=signal,
            side=signal.direction,
            outcome="yes" if signal.direction == SignalDirection.BUY else "no",
            size=size,
            limit_price=max(min(limit_price, 0.99), 0.01),
            stop_loss=round(max(limit_price - 0.04, 0.01), 4) if signal.direction == SignalDirection.BUY else round(min(limit_price + 0.04, 0.99), 4),
            take_profit=round(min(signal.target_price, 0.99), 4),
        )

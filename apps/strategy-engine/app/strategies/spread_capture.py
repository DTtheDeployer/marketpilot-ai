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


class SpreadCaptureStrategy(BaseStrategy):
    """Captures the bid-ask spread by placing resting limit orders on both sides.

    The strategy identifies markets where the spread between the best bid and
    best ask is wide enough to be profitable after fees.  It places a buy at
    the bid and a sell at the ask, earning the spread when both fill.
    """

    def metadata(self) -> StrategyMeta:
        return StrategyMeta(
            slug="spread-capture",
            name="Spread Capture",
            description="Market-making style strategy that profits from wide bid-ask spreads.",
            thesis=(
                "Prediction markets often have thin liquidity and wide spreads. "
                "By posting resting orders on both sides we can capture the spread "
                "as profit when both legs fill."
            ),
            risk_level=RiskLevel.LOW,
            config_defaults={
                "min_spread": 0.04,
                "order_size_pct": 0.05,
                "edge_buffer": 0.005,
            },
            tags=["market-making", "low-risk", "liquidity"],
        )

    def configure(self, config: StrategyConfig) -> None:
        super().configure(config)

    def generate_signal(self, market_data: MarketData) -> Signal:
        params = self._config.params
        min_spread = params.get("min_spread", 0.04)

        spread = market_data.spread
        if spread <= 0 and market_data.orderbook_bids and market_data.orderbook_asks:
            best_bid = market_data.orderbook_bids[0][0]
            best_ask = market_data.orderbook_asks[0][0]
            spread = best_ask - best_bid

        if spread <= 0:
            spread = abs(market_data.outcome_no_price - (1.0 - market_data.outcome_yes_price))
            if spread <= 0:
                spread = 0.02

        if spread >= min_spread:
            mid = market_data.outcome_yes_price
            confidence = min(spread / 0.10, 1.0)
            return Signal(
                strategy_slug="spread-capture",
                market_id=market_data.market_id,
                direction=SignalDirection.BUY,
                confidence=round(confidence, 4),
                target_price=round(mid, 4),
                reasoning=f"Spread of {spread:.4f} exceeds minimum {min_spread}. Mid-price {mid:.4f}.",
                metadata={"spread": spread, "mid": mid},
            )

        return Signal(
            strategy_slug="spread-capture",
            market_id=market_data.market_id,
            direction=SignalDirection.HOLD,
            confidence=0.0,
            target_price=market_data.outcome_yes_price,
            reasoning=f"Spread {spread:.4f} below threshold {min_spread}.",
        )

    def generate_trade_intent(self, signal: Signal) -> TradeIntent:
        edge = self._config.params.get("edge_buffer", 0.005)
        size_pct = self._config.params.get("order_size_pct", 0.05)
        capital = self._config.capital
        size = round(capital * size_pct, 2)

        limit_price = round(signal.target_price - edge, 4)
        stop_loss = round(limit_price - 0.05, 4) if limit_price > 0.05 else 0.01

        return TradeIntent(
            signal=signal,
            side=signal.direction,
            outcome="yes",
            size=size,
            limit_price=max(limit_price, 0.01),
            stop_loss=max(stop_loss, 0.01),
            take_profit=round(signal.target_price + edge, 4),
        )

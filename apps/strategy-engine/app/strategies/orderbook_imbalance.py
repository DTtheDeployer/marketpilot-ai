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


class OrderbookImbalanceStrategy(BaseStrategy):
    """Detects large imbalances between bid and ask volume and trades in
    the direction of the heavier side, anticipating a price move.
    """

    def metadata(self) -> StrategyMeta:
        return StrategyMeta(
            slug="orderbook-imbalance",
            name="Orderbook Imbalance",
            description="Trades based on bid/ask volume imbalance in the order book.",
            thesis=(
                "When one side of the book is significantly heavier, the price tends "
                "to move in that direction as resting liquidity gets consumed."
            ),
            risk_level=RiskLevel.MEDIUM,
            config_defaults={
                "imbalance_threshold": 0.65,
                "depth_levels": 5,
                "order_size_pct": 0.06,
            },
            tags=["orderbook", "microstructure", "momentum"],
        )

    def generate_signal(self, market_data: MarketData) -> Signal:
        params = self._config.params
        threshold = float(params.get("imbalance_threshold", 0.65))
        depth = int(params.get("depth_levels", 5))

        bids = market_data.orderbook_bids[:depth]
        asks = market_data.orderbook_asks[:depth]

        if not bids or not asks:
            return Signal(
                strategy_slug="orderbook-imbalance",
                market_id=market_data.market_id,
                direction=SignalDirection.HOLD,
                confidence=0.0,
                target_price=market_data.outcome_yes_price,
                reasoning="Order book data unavailable.",
            )

        bid_volume = sum(level[1] for level in bids if len(level) >= 2)
        ask_volume = sum(level[1] for level in asks if len(level) >= 2)
        total_volume = bid_volume + ask_volume

        if total_volume == 0:
            return Signal(
                strategy_slug="orderbook-imbalance",
                market_id=market_data.market_id,
                direction=SignalDirection.HOLD,
                confidence=0.0,
                target_price=market_data.outcome_yes_price,
                reasoning="Zero volume in order book.",
            )

        bid_ratio = bid_volume / total_volume

        if bid_ratio > threshold:
            confidence = min((bid_ratio - 0.5) * 2, 1.0)
            return Signal(
                strategy_slug="orderbook-imbalance",
                market_id=market_data.market_id,
                direction=SignalDirection.BUY,
                confidence=round(confidence, 4),
                target_price=round(market_data.outcome_yes_price + 0.02, 4),
                reasoning=(
                    f"Bid-side imbalance {bid_ratio:.2%} exceeds threshold {threshold:.2%}. "
                    "Expecting upward price pressure."
                ),
                metadata={"bid_ratio": round(bid_ratio, 4), "bid_vol": bid_volume, "ask_vol": ask_volume},
            )

        ask_ratio = 1 - bid_ratio
        if ask_ratio > threshold:
            confidence = min((ask_ratio - 0.5) * 2, 1.0)
            return Signal(
                strategy_slug="orderbook-imbalance",
                market_id=market_data.market_id,
                direction=SignalDirection.SELL,
                confidence=round(confidence, 4),
                target_price=round(market_data.outcome_yes_price - 0.02, 4),
                reasoning=(
                    f"Ask-side imbalance {ask_ratio:.2%} exceeds threshold {threshold:.2%}. "
                    "Expecting downward price pressure."
                ),
                metadata={"ask_ratio": round(ask_ratio, 4), "bid_vol": bid_volume, "ask_vol": ask_volume},
            )

        return Signal(
            strategy_slug="orderbook-imbalance",
            market_id=market_data.market_id,
            direction=SignalDirection.HOLD,
            confidence=0.0,
            target_price=market_data.outcome_yes_price,
            reasoning=f"Bid ratio {bid_ratio:.2%} within balanced range.",
        )

    def generate_trade_intent(self, signal: Signal) -> TradeIntent:
        size_pct = self._config.params.get("order_size_pct", 0.06)
        capital = self._config.capital
        size = round(capital * size_pct, 2)

        if signal.direction == SignalDirection.BUY:
            limit_price = round(signal.target_price - 0.01, 4)
        else:
            limit_price = round(signal.target_price + 0.01, 4)

        return TradeIntent(
            signal=signal,
            side=signal.direction,
            outcome="yes" if signal.direction == SignalDirection.BUY else "no",
            size=size,
            limit_price=max(min(limit_price, 0.99), 0.01),
            stop_loss=round(max(limit_price - 0.06, 0.01), 4) if signal.direction == SignalDirection.BUY else round(min(limit_price + 0.06, 0.99), 4),
            take_profit=round(min(limit_price + 0.04, 0.99), 4) if signal.direction == SignalDirection.BUY else round(max(limit_price - 0.04, 0.01), 4),
        )

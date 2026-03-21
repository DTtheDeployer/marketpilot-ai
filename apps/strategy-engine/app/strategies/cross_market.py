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


class CrossMarketDivergenceStrategy(BaseStrategy):
    """Identifies pricing inconsistencies between related markets and
    exploits the arbitrage-like divergence.

    For example, if market A (``Will X happen by June?``) is priced at 0.70
    but market B (``Will X happen by December?``) is priced at 0.60, there
    is a logical inconsistency that should converge.
    """

    def metadata(self) -> StrategyMeta:
        return StrategyMeta(
            slug="cross-market-divergence",
            name="Cross-Market Divergence",
            description="Exploits pricing inconsistencies between correlated prediction markets.",
            thesis=(
                "Related prediction markets should maintain logical price relationships. "
                "When they diverge, the mispricing creates a near-arbitrage opportunity "
                "that corrects as participants notice the inconsistency."
            ),
            risk_level=RiskLevel.HIGH,
            config_defaults={
                "min_divergence": 0.08,
                "order_size_pct": 0.10,
                "correlation_threshold": 0.5,
            },
            tags=["arbitrage", "cross-market", "divergence"],
        )

    def generate_signal(self, market_data: MarketData) -> Signal:
        params = self._config.params
        min_div = float(params.get("min_divergence", 0.08))

        related = market_data.related_markets
        if not related:
            return Signal(
                strategy_slug="cross-market-divergence",
                market_id=market_data.market_id,
                direction=SignalDirection.HOLD,
                confidence=0.0,
                target_price=market_data.outcome_yes_price,
                reasoning="No related markets provided for divergence analysis.",
            )

        current_price = market_data.outcome_yes_price
        best_divergence = 0.0
        best_related = None

        for rm in related:
            related_price = rm.get("price", rm.get("outcome_yes_price", 0.5))
            expected_relationship = rm.get("expected_relationship", ">=")

            if expected_relationship == ">=" and current_price < related_price:
                div = related_price - current_price
            elif expected_relationship == "<=" and current_price > related_price:
                div = current_price - related_price
            else:
                div = abs(current_price - related_price)

            if div > best_divergence:
                best_divergence = div
                best_related = rm

        if best_divergence < min_div or best_related is None:
            return Signal(
                strategy_slug="cross-market-divergence",
                market_id=market_data.market_id,
                direction=SignalDirection.HOLD,
                confidence=0.0,
                target_price=current_price,
                reasoning=f"Max divergence {best_divergence:.4f} below threshold {min_div}.",
            )

        related_price = best_related.get("price", best_related.get("outcome_yes_price", 0.5))
        confidence = min(best_divergence / 0.20, 1.0)

        if current_price < related_price:
            direction = SignalDirection.BUY
            target = round(current_price + best_divergence * 0.5, 4)
        else:
            direction = SignalDirection.SELL
            target = round(current_price - best_divergence * 0.5, 4)

        return Signal(
            strategy_slug="cross-market-divergence",
            market_id=market_data.market_id,
            direction=direction,
            confidence=round(confidence, 4),
            target_price=max(min(target, 0.99), 0.01),
            reasoning=(
                f"Divergence of {best_divergence:.4f} detected against related market "
                f"'{best_related.get('market_id', 'unknown')}' (price {related_price:.4f})."
            ),
            metadata={
                "divergence": round(best_divergence, 4),
                "related_market_id": best_related.get("market_id"),
                "related_price": related_price,
            },
        )

    def generate_trade_intent(self, signal: Signal) -> TradeIntent:
        size_pct = self._config.params.get("order_size_pct", 0.10)
        capital = self._config.capital
        size = round(capital * size_pct, 2)

        if signal.direction == SignalDirection.BUY:
            limit_price = round(signal.target_price * 0.98, 4)
            stop_loss = round(limit_price - 0.08, 4)
        else:
            limit_price = round(signal.target_price * 1.02, 4)
            stop_loss = round(limit_price + 0.08, 4)

        return TradeIntent(
            signal=signal,
            side=signal.direction,
            outcome="yes" if signal.direction == SignalDirection.BUY else "no",
            size=size,
            limit_price=max(min(limit_price, 0.99), 0.01),
            stop_loss=max(min(stop_loss, 0.99), 0.01),
            take_profit=round(max(min(signal.target_price, 0.99), 0.01), 4),
        )

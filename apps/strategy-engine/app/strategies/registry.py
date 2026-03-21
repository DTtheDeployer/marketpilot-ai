from __future__ import annotations

from typing import Type

from app.strategies.base import BaseStrategy
from app.strategies.cross_market import CrossMarketDivergenceStrategy
from app.strategies.mean_reversion import MeanReversionStrategy
from app.strategies.momentum import MomentumStrategy
from app.strategies.orderbook_imbalance import OrderbookImbalanceStrategy
from app.strategies.spread_capture import SpreadCaptureStrategy
from app.strategies.time_decay import TimeDecayStrategy

STRATEGY_REGISTRY: dict[str, Type[BaseStrategy]] = {
    "spread-capture": SpreadCaptureStrategy,
    "mean-reversion": MeanReversionStrategy,
    "orderbook-imbalance": OrderbookImbalanceStrategy,
    "momentum": MomentumStrategy,
    "time-decay": TimeDecayStrategy,
    "cross-market-divergence": CrossMarketDivergenceStrategy,
}


def get_strategy(slug: str) -> BaseStrategy:
    """Instantiate a strategy by its slug. Raises KeyError if unknown."""
    cls = STRATEGY_REGISTRY.get(slug)
    if cls is None:
        raise KeyError(f"Unknown strategy slug: {slug}")
    return cls()


def list_strategies() -> list[BaseStrategy]:
    """Return a fresh instance of every registered strategy."""
    return [cls() for cls in STRATEGY_REGISTRY.values()]

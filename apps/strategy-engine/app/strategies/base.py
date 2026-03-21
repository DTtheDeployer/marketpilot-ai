from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from app.models.strategy import (
    MarketData,
    Signal,
    StrategyConfig,
    StrategyMeta,
    TradeIntent,
)


class BaseStrategy(ABC):
    """Abstract base class every strategy must implement."""

    def __init__(self) -> None:
        self._config: StrategyConfig = StrategyConfig()

    @abstractmethod
    def metadata(self) -> StrategyMeta:
        """Return static metadata describing this strategy."""
        ...

    def configure(self, config: StrategyConfig) -> None:
        """Apply runtime configuration."""
        merged = {**self.metadata().config_defaults, **config.params}
        self._config = config.model_copy(update={"params": merged})

    @abstractmethod
    def generate_signal(self, market_data: MarketData) -> Signal:
        """Analyse market data and produce a trading signal."""
        ...

    @abstractmethod
    def generate_trade_intent(self, signal: Signal) -> TradeIntent:
        """Convert a signal into an executable trade intent."""
        ...

    def compute_metrics(self, trades: list[dict[str, Any]]) -> dict[str, Any]:
        """Compute performance metrics over a list of closed trades."""
        if not trades:
            return {
                "total_trades": 0,
                "win_rate": 0.0,
                "avg_pnl": 0.0,
                "total_pnl": 0.0,
                "profit_factor": 0.0,
            }

        pnls = [t.get("pnl", 0.0) for t in trades]
        wins = [p for p in pnls if p > 0]
        losses = [p for p in pnls if p <= 0]

        gross_profit = sum(wins) if wins else 0.0
        gross_loss = abs(sum(losses)) if losses else 0.0

        return {
            "total_trades": len(trades),
            "winning_trades": len(wins),
            "losing_trades": len(losses),
            "win_rate": len(wins) / len(trades) if trades else 0.0,
            "avg_pnl": sum(pnls) / len(pnls),
            "total_pnl": sum(pnls),
            "profit_factor": (gross_profit / gross_loss) if gross_loss > 0 else float("inf"),
        }

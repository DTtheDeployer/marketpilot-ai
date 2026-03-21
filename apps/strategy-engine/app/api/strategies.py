from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.strategy import MarketData, Signal, StrategyConfig, StrategyMeta
from app.strategies.registry import STRATEGY_REGISTRY, get_strategy, list_strategies

router = APIRouter(prefix="/strategies", tags=["strategies"])


@router.get("", response_model=list[StrategyMeta])
async def list_all_strategies() -> list[StrategyMeta]:
    """Return metadata for every registered strategy."""
    return [s.metadata() for s in list_strategies()]


@router.get("/{slug}", response_model=StrategyMeta)
async def get_strategy_meta(slug: str) -> StrategyMeta:
    """Return metadata for a single strategy by slug."""
    try:
        strategy = get_strategy(slug)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Strategy '{slug}' not found.")
    return strategy.metadata()


class SignalRequest(MarketData):
    """Market data payload optionally bundled with strategy config."""
    config: StrategyConfig | None = None


@router.post("/{slug}/signal", response_model=Signal)
async def generate_signal(slug: str, payload: SignalRequest) -> Signal:
    """Generate a signal from the given strategy and market data."""
    try:
        strategy = get_strategy(slug)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Strategy '{slug}' not found.")

    if payload.config:
        strategy.configure(payload.config)

    market_data = MarketData(**payload.model_dump(exclude={"config"}))
    signal = strategy.generate_signal(market_data)
    return signal

from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.backtesting.engine import BacktestEngine
from app.models.strategy import BacktestResult, StrategyConfig
from app.strategies.registry import get_strategy

router = APIRouter(prefix="/backtests", tags=["backtests"])

# In-memory result store (swap for Redis / DB in production)
_results: dict[str, BacktestResult] = {}


class BacktestRequest(BaseModel):
    strategy_slug: str
    config: StrategyConfig = Field(default_factory=StrategyConfig)
    risk_preset: str = "balanced"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    num_snapshots: int = 100
    base_price: float = 0.50
    volatility: float = 0.02
    seed: Optional[int] = 42


@router.post("", response_model=BacktestResult)
async def run_backtest(req: BacktestRequest) -> BacktestResult:
    """Run a backtest for the given strategy and parameters."""
    try:
        strategy = get_strategy(req.strategy_slug)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Strategy '{req.strategy_slug}' not found.")

    engine = BacktestEngine(
        strategy=strategy,
        config=req.config,
        risk_preset=req.risk_preset,
    )

    result = engine.run(
        start_date=req.start_date,
        end_date=req.end_date,
        num_snapshots=req.num_snapshots,
        base_price=req.base_price,
        volatility=req.volatility,
        seed=req.seed,
    )

    _results[result.id] = result
    return result


@router.get("/{backtest_id}", response_model=BacktestResult)
async def get_backtest(backtest_id: str) -> BacktestResult:
    """Retrieve a previously run backtest result by ID."""
    result = _results.get(backtest_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Backtest result not found.")
    return result

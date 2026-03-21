from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.models.strategy import RiskLevel, TradeIntent
from app.paper_execution.simulator import PaperTradingSimulator

router = APIRouter(prefix="/paper", tags=["paper-trading"])

# Singleton simulator (in production, scope per user / session)
_simulator = PaperTradingSimulator()


class PaperExecuteRequest(BaseModel):
    trade_intent: TradeIntent
    strategy_risk_level: RiskLevel = RiskLevel.MEDIUM
    fill_price: float | None = None


class PriceUpdateRequest(BaseModel):
    prices: dict[str, float] = Field(
        ..., description="Mapping of market_id to current price"
    )


class ClosePositionRequest(BaseModel):
    position_id: str
    exit_price: float | None = None


@router.post("/execute")
async def execute_paper_trade(req: PaperExecuteRequest) -> dict[str, Any]:
    """Execute a paper trade."""
    result = _simulator.execute(
        trade_intent=req.trade_intent,
        strategy_risk_level=req.strategy_risk_level,
        fill_price=req.fill_price,
    )
    return result


@router.post("/close")
async def close_position(req: ClosePositionRequest) -> dict[str, Any]:
    """Close an open paper position."""
    result = _simulator.close_position(req.position_id, req.exit_price)
    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result["reason"])
    return result


@router.post("/update-prices")
async def update_prices(req: PriceUpdateRequest) -> dict[str, Any]:
    """Update market prices and trigger stop-loss / take-profit."""
    auto_closed = _simulator.update_prices(req.prices)
    return {"auto_closed": auto_closed, "count": len(auto_closed)}


@router.get("/positions")
async def get_positions() -> list[dict[str, Any]]:
    """Get all open paper positions."""
    return _simulator.get_positions()


@router.get("/pnl")
async def get_pnl() -> dict[str, Any]:
    """Get aggregate P&L summary."""
    return _simulator.get_pnl()


@router.post("/reset")
async def reset_simulator() -> dict[str, str]:
    """Reset the simulator to initial state."""
    global _simulator
    _simulator = PaperTradingSimulator()
    return {"status": "reset"}

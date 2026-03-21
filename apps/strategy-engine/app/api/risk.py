from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from app.models.strategy import RiskDecision, RiskLevel, RiskLimits, TradeIntent
from app.risk.engine import RiskEngine
from app.risk.presets import PRESETS, get_preset

router = APIRouter(prefix="/risk", tags=["risk"])


class ValidateRequest(BaseModel):
    trade_intent: TradeIntent
    strategy_risk_level: RiskLevel = RiskLevel.MEDIUM
    preset: str = "balanced"
    daily_pnl: float = 0.0
    current_equity: float = 10_000.0
    peak_equity: float = 10_000.0
    open_positions: int = 0


@router.post("/validate", response_model=RiskDecision)
async def validate_trade(req: ValidateRequest) -> RiskDecision:
    """Validate a trade intent against risk limits."""
    limits = get_preset(req.preset)
    engine = RiskEngine(limits=limits)
    engine.daily_pnl = req.daily_pnl
    engine.current_equity = req.current_equity
    engine.peak_equity = req.peak_equity
    engine.open_positions = req.open_positions

    return engine.validate(req.trade_intent, req.strategy_risk_level)


@router.get("/presets")
async def list_presets() -> dict[str, Any]:
    """Return all available risk presets."""
    return {
        name: limits.model_dump()
        for name, limits in PRESETS.items()
    }


@router.get("/presets/{name}", response_model=RiskLimits)
async def get_risk_preset(name: str) -> RiskLimits:
    """Return a specific risk preset."""
    return get_preset(name)

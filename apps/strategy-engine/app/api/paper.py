from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.models.strategy import MarketData, RiskLevel, TradeIntent
from app.paper_execution.simulator import PaperTradingSimulator

router = APIRouter(prefix="/paper", tags=["paper-trading"])

# Singleton simulator (in production, scope per user / session)
_simulator = PaperTradingSimulator()


class PaperExecuteRequest(BaseModel):
    trade_intent: TradeIntent
    strategy_risk_level: RiskLevel = RiskLevel.MEDIUM
    fill_price: float | None = None
    market_data: MarketData | None = None


class PaperExecuteEnhancedRequest(BaseModel):
    """Request for enhanced paper execution with full simulation."""
    side: str
    price: float
    size: float
    market_id: str
    midpoint: float | None = None
    liquidity: float = 100_000
    spread: float = 0.02
    orderbook_bids: list[list[float]] = Field(default_factory=list)
    orderbook_asks: list[list[float]] = Field(default_factory=list)
    confidence: float = 0.5


class PriceUpdateRequest(BaseModel):
    prices: dict[str, float] = Field(
        ..., description="Mapping of market_id to current price"
    )


class ClosePositionRequest(BaseModel):
    position_id: str
    exit_price: float | None = None


@router.post("/execute")
async def execute_paper_trade(req: PaperExecuteRequest) -> dict[str, Any]:
    """Execute a paper trade, optionally with enhanced market simulation."""
    result = _simulator.execute(
        trade_intent=req.trade_intent,
        strategy_risk_level=req.strategy_risk_level,
        fill_price=req.fill_price,
        market_data=req.market_data,
    )
    return result


@router.post("/execute-enhanced")
async def execute_enhanced_paper_trade(req: PaperExecuteEnhancedRequest) -> dict[str, Any]:
    """Execute a paper trade with full realistic simulation.

    Called by the bot-scheduler for enhanced paper execution with
    orderbook walking, dynamic fees, latency, and rejection modelling.
    Returns fill result plus per-trade analysis metrics.
    """
    from app.paper_execution.fill_models import (
        compute_fee,
        generate_synthetic_orderbook,
        should_reject_fill,
        simulate_fill_latency,
        walk_orderbook,
    )
    from app.paper_execution.analysis import compute_trade_analysis

    midpoint = req.midpoint if req.midpoint is not None else req.price

    # 1. Rejection check
    rejected, rejection_reason = should_reject_fill(req.liquidity, req.spread)
    if rejected:
        analysis = compute_trade_analysis(
            side=req.side, requested_size=req.size, requested_price=req.price,
            fill_price=0.0, fill_size=0.0, midpoint=midpoint, spread=req.spread,
            fee=0.0, fee_type="taker", slippage_bps=0.0, latency_ms=0.0,
            tranches_count=0, is_partial=False, was_rejected=True,
            rejection_reason=rejection_reason, queue_position=None,
            estimated_wait_ticks=None, pnl=0.0,
        )
        return {
            "status": "rejected",
            "rejection_reason": rejection_reason,
            "fill_price": 0,
            "fill_size": 0,
            "fee": 0,
            "slippage_bps": 0,
            "simulated_latency_ms": 0,
            "is_partial": False,
            "tranches": [],
            "analysis": _analysis_to_dict(analysis),
        }

    # 2. Build orderbook
    if req.orderbook_asks and req.orderbook_bids:
        asks = req.orderbook_asks
        bids = req.orderbook_bids
    else:
        liquidity_factor = max(0.3, req.liquidity / 100_000)
        bids, asks = generate_synthetic_orderbook(
            midpoint=midpoint, spread=req.spread, liquidity_factor=liquidity_factor,
        )

    # 3. Walk orderbook
    book_side = asks if req.side.upper() == "BUY" else bids
    fill_result = walk_orderbook(
        side=req.side, size=req.size,
        orderbook_levels=book_side, midpoint=midpoint,
    )

    if fill_result.rejected:
        analysis = compute_trade_analysis(
            side=req.side, requested_size=req.size, requested_price=req.price,
            fill_price=0.0, fill_size=0.0, midpoint=midpoint, spread=req.spread,
            fee=0.0, fee_type="taker", slippage_bps=0.0, latency_ms=0.0,
            tranches_count=0, is_partial=False, was_rejected=True,
            rejection_reason=fill_result.rejection_reason, queue_position=None,
            estimated_wait_ticks=None, pnl=0.0,
        )
        return {
            "status": "rejected",
            "rejection_reason": fill_result.rejection_reason,
            "fill_price": 0,
            "fill_size": 0,
            "fee": 0,
            "slippage_bps": 0,
            "simulated_latency_ms": 0,
            "is_partial": False,
            "tranches": [],
            "analysis": _analysis_to_dict(analysis),
        }

    fill_price = fill_result.avg_fill_price
    fill_size = fill_result.filled_size

    # 4. Dynamic fee
    notional = fill_price * fill_size
    is_maker = False  # Bot-scheduler orders are typically taker
    fee = compute_fee(notional, _simulator.cumulative_volume, is_maker)
    _simulator.cumulative_volume += notional

    # 5. Latency
    latency_ms = simulate_fill_latency()

    # 6. P&L simulation (confidence-based like bot-scheduler)
    win = (hash(f"{req.market_id}-{fill_price}-{fill_size}") % 100) / 100 < (0.4 + req.confidence * 0.3)
    if win:
        pnl = fill_price * fill_size * (0.02 + (hash(f"{fill_price}") % 6) / 100)
    else:
        pnl = -(fill_price * fill_size * (0.01 + (hash(f"{fill_size}") % 5) / 100))

    # Deduct execution costs from P&L
    realistic_pnl = pnl - abs(fee) - (fill_result.slippage_bps / 10_000 * notional)

    # 7. Analysis
    tranches_list = [{"price": t.price, "size": t.size} for t in fill_result.tranches]

    worst_price = max(t.price for t in fill_result.tranches) if fill_result.tranches else fill_price
    best_price = min(t.price for t in fill_result.tranches) if fill_result.tranches else fill_price
    if req.side.upper() == "SELL":
        worst_price, best_price = best_price, worst_price

    analysis = compute_trade_analysis(
        side=req.side, requested_size=req.size, requested_price=req.price,
        fill_price=fill_price, fill_size=fill_size, midpoint=midpoint,
        spread=req.spread, fee=fee, fee_type="maker" if is_maker else "taker",
        slippage_bps=fill_result.slippage_bps, latency_ms=latency_ms,
        tranches_count=len(fill_result.tranches), is_partial=fill_result.is_partial,
        was_rejected=False, rejection_reason=None,
        queue_position=None, estimated_wait_ticks=None,
        pnl=realistic_pnl, worst_fill_price=worst_price, best_fill_price=best_price,
    )

    _simulator.trade_analyses.append(analysis)

    return {
        "status": "partial_fill" if fill_result.is_partial else "filled",
        "fill_price": round(fill_price, 6),
        "fill_size": round(fill_size, 4),
        "fee": round(fee, 6),
        "fee_type": "maker" if is_maker else "taker",
        "slippage_bps": round(fill_result.slippage_bps, 2),
        "simulated_latency_ms": round(latency_ms, 1),
        "is_partial": fill_result.is_partial,
        "tranches": tranches_list,
        "pnl": round(pnl, 4),
        "realistic_pnl": round(realistic_pnl, 4),
        "win": win,
        "analysis": _analysis_to_dict(analysis),
    }


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


@router.get("/analysis")
async def get_analysis() -> dict[str, Any]:
    """Get aggregate execution quality analysis.

    Returns execution quality score, cost breakdown, fill quality
    metrics, and actionable feedback for strategy improvement.
    """
    return _simulator.get_analysis()


@router.get("/analysis/trades")
async def get_trade_analyses() -> list[dict[str, Any]]:
    """Get per-trade execution analysis metrics."""
    return _simulator.get_trade_analyses()


@router.post("/reset")
async def reset_simulator() -> dict[str, str]:
    """Reset the simulator to initial state."""
    global _simulator
    _simulator = PaperTradingSimulator()
    return {"status": "reset"}


def _analysis_to_dict(a) -> dict[str, Any]:
    """Convert a TradeAnalysisMetrics to dict."""
    return {
        "slippage_bps": a.slippage_bps,
        "slippage_cost_usd": a.slippage_cost_usd,
        "spread_cost_usd": a.spread_cost_usd,
        "fee_cost_usd": a.fee_cost_usd,
        "fee_type": a.fee_type,
        "total_execution_cost_usd": a.total_execution_cost_usd,
        "fill_rate": a.fill_rate,
        "is_partial": a.is_partial,
        "tranches_count": a.tranches_count,
        "vwap": a.vwap,
        "worst_fill_price": a.worst_fill_price,
        "best_fill_price": a.best_fill_price,
        "simulated_latency_ms": a.simulated_latency_ms,
        "ideal_pnl": a.ideal_pnl,
        "realistic_pnl": a.realistic_pnl,
        "realism_drag_pct": a.realism_drag_pct,
        "queue_position": a.queue_position,
        "estimated_wait_ticks": a.estimated_wait_ticks,
        "was_rejected": a.was_rejected,
        "rejection_reason": a.rejection_reason,
    }

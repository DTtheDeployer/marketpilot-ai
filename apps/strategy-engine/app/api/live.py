"""
MarketPilot AI — Live Execution API Router
===========================================
Endpoints for live Polymarket trading. All routes require the caller
to verify ELITE plan + jurisdiction eligibility before invoking.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os

router = APIRouter(prefix="/live", tags=["live"])


class LiveOrderRequest(BaseModel):
    token_id: str
    side: str  # BUY or SELL
    price: float
    size: float
    order_type: str = "GTC"
    neg_risk: bool = False


class LiveOrderResponse(BaseModel):
    success: bool
    order_id: Optional[str] = None
    filled_size: float = 0.0
    filled_price: float = 0.0
    error: Optional[str] = None


class CancelRequest(BaseModel):
    order_id: str


# Lazy-initialized executor (only created when private key is configured)
_executor = None


def _get_executor():
    global _executor
    if _executor is not None:
        return _executor

    private_key = os.getenv("POLYMARKET_PRIVATE_KEY")
    if not private_key:
        raise HTTPException(
            status_code=503,
            detail="Live trading not configured. POLYMARKET_PRIVATE_KEY not set.",
        )

    from app.live_execution.polymarket_client import PolymarketExecutor

    host = os.getenv("POLYMARKET_API_URL", "https://clob.polymarket.com")
    _executor = PolymarketExecutor(private_key=private_key, host=host)
    _executor.initialize()
    return _executor


@router.get("/health")
def live_health():
    """Check if live trading is configured and Polymarket is reachable."""
    private_key = os.getenv("POLYMARKET_PRIVATE_KEY")
    if not private_key:
        return {
            "configured": False,
            "polymarket_reachable": False,
            "message": "POLYMARKET_PRIVATE_KEY not set",
        }

    try:
        executor = _get_executor()
        reachable = executor.is_healthy()
        return {
            "configured": True,
            "polymarket_reachable": reachable,
        }
    except Exception as e:
        return {
            "configured": True,
            "polymarket_reachable": False,
            "error": str(e),
        }


@router.post("/order", response_model=LiveOrderResponse)
def place_order(req: LiveOrderRequest):
    """
    Place a limit order on Polymarket.

    This endpoint should only be called after:
    1. User has ELITE subscription
    2. User passed jurisdiction eligibility check
    3. User acknowledged risk disclosures
    4. Trade passed risk engine validation

    The API server enforces checks 1-3 before calling this endpoint.
    Check 4 is performed by the unified executor.
    """
    executor = _get_executor()

    if req.side not in ("BUY", "SELL"):
        raise HTTPException(400, "side must be BUY or SELL")
    if req.price <= 0 or req.price >= 1:
        raise HTTPException(400, "price must be between 0 and 1")
    if req.size <= 0:
        raise HTTPException(400, "size must be positive")
    if req.order_type not in ("GTC", "GTD", "FOK", "FAK"):
        raise HTTPException(400, "order_type must be GTC, GTD, FOK, or FAK")

    result = executor.execute_limit_order(
        token_id=req.token_id,
        side=req.side,
        price=req.price,
        size=req.size,
        order_type=req.order_type,
        neg_risk=req.neg_risk,
    )

    return LiveOrderResponse(
        success=result.success,
        order_id=result.order_id,
        filled_size=result.filled_size,
        filled_price=result.filled_price,
        error=result.error,
    )


@router.delete("/order/{order_id}")
def cancel_order(order_id: str):
    """Cancel a single open order."""
    executor = _get_executor()
    success = executor.cancel_order(order_id)
    return {"success": success, "order_id": order_id}


@router.delete("/orders")
def cancel_all():
    """Cancel all open orders. Emergency use."""
    executor = _get_executor()
    cancelled = executor.cancel_all_orders()
    return {"success": True, "cancelled_count": cancelled}


@router.get("/orders")
def get_open_orders(market: Optional[str] = None):
    """Fetch open orders, optionally filtered by market."""
    executor = _get_executor()
    orders = executor.get_open_orders(market=market)
    return {"success": True, "data": orders}


@router.get("/balance")
def get_balance():
    """Get current USDC balance and allowance."""
    executor = _get_executor()
    balance = executor.get_balance()
    return {"success": True, "data": balance}


@router.get("/market/{condition_id}")
def get_market(condition_id: str):
    """Fetch market data directly from Polymarket."""
    executor = _get_executor()
    market = executor.get_market(condition_id)
    return {"success": True, "data": market}


@router.get("/orderbook/{token_id}")
def get_orderbook(token_id: str):
    """Fetch live orderbook from Polymarket."""
    executor = _get_executor()
    orderbook = executor.get_orderbook(token_id)
    return {"success": True, "data": orderbook}

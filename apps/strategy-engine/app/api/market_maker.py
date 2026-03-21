"""
MarketPilot AI — Market Maker API Router
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import logging

router = APIRouter(prefix="/market-maker", tags=["market-maker"])
logger = logging.getLogger(__name__)

_bot = None


def _get_bot():
    global _bot
    if _bot is not None:
        return _bot

    pk = os.getenv("POLYMARKET_PRIVATE_KEY")
    if not pk:
        raise HTTPException(503, "POLYMARKET_PRIVATE_KEY not set")

    from app.strategies.market_maker import MarketMakerBot, MarketMakerConfig
    config = MarketMakerConfig(
        quote_size_usd=float(os.getenv("MM_QUOTE_SIZE", "2.0")),
        edge_bps=int(os.getenv("MM_EDGE_BPS", "100")),
        min_spread_bps=int(os.getenv("MM_MIN_SPREAD_BPS", "150")),
    )
    _bot = MarketMakerBot(private_key=pk, config=config)
    _bot.initialize()
    return _bot


class CycleResponse(BaseModel):
    market_id: str
    market_question: str
    bid_order_id: Optional[str] = None
    ask_order_id: Optional[str] = None
    bid_price: float = 0.0
    ask_price: float = 0.0
    spread_bps: float = 0.0
    error: Optional[str] = None


@router.get("/health")
def mm_health():
    pk = os.getenv("POLYMARKET_PRIVATE_KEY")
    if not pk:
        return {"configured": False}
    try:
        bot = _get_bot()
        balance = bot.get_balance()
        return {"configured": True, "balance_usdc": balance}
    except Exception as e:
        return {"configured": True, "error": str(e)}


@router.post("/cycle", response_model=CycleResponse)
def run_cycle():
    """Run one market-making cycle: cancel, find market, quote both sides."""
    bot = _get_bot()
    result = bot.execute_cycle()
    return CycleResponse(
        market_id=result.market_id,
        market_question=result.market_question,
        bid_order_id=result.bid_order_id,
        ask_order_id=result.ask_order_id,
        bid_price=result.bid_price,
        ask_price=result.ask_price,
        spread_bps=result.spread_bps,
        error=result.error,
    )


@router.post("/cancel-all")
def cancel_all():
    bot = _get_bot()
    count = bot.cancel_all_orders()
    return {"cancelled": count}


@router.get("/balance")
def get_balance():
    bot = _get_bot()
    return {"balance_usdc": bot.get_balance()}


@router.post("/find-market")
def find_market():
    """Find the best market to quote without placing orders."""
    bot = _get_bot()
    market = bot.find_best_market()
    if not market:
        return {"found": False, "error": "No suitable market"}
    return {"found": True, "market": market}


@router.post("/start")
def start_scheduler():
    """Start the automated market-making loop."""
    from app.api.mm_scheduler import start_mm_scheduler
    return start_mm_scheduler()


@router.post("/stop")
def stop_scheduler():
    """Stop the automated market-making loop and cancel all orders."""
    from app.api.mm_scheduler import stop_mm_scheduler
    return stop_mm_scheduler()


@router.get("/status")
def scheduler_status():
    """Check if the market maker is running."""
    from app.api.mm_scheduler import is_running
    bot = _get_bot()
    return {
        "running": is_running(),
        "balance_usdc": bot.get_balance(),
    }

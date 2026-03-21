"""
MarketPilot AI — Market Maker Scheduler
Runs the market-making cycle on a loop automatically.
"""

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import Optional

logger = logging.getLogger(__name__)

_task: Optional[asyncio.Task] = None
_running = False
INTERVAL = int(os.getenv("MM_INTERVAL_SEC", "90"))  # seconds between cycles


async def _run_loop():
    """Background loop that runs market-making cycles."""
    global _running

    # Lazy import to avoid circular deps
    from app.strategies.market_maker import MarketMakerBot, MarketMakerConfig

    pk = os.getenv("POLYMARKET_PRIVATE_KEY")
    if not pk:
        logger.error("MM scheduler: POLYMARKET_PRIVATE_KEY not set")
        return

    config = MarketMakerConfig(
        quote_size_usd=float(os.getenv("MM_QUOTE_SIZE", "5.0")),
        edge_bps=int(os.getenv("MM_EDGE_BPS", "100")),
    )
    bot = MarketMakerBot(private_key=pk, config=config)
    bot.initialize()

    cycle_count = 0
    consecutive_errors = 0

    logger.info(f"Market maker scheduler started — cycle every {INTERVAL}s")

    while _running:
        cycle_count += 1
        try:
            result = bot.execute_cycle()

            if result.error and "Insufficient balance" in result.error:
                logger.warning(f"MM cycle {cycle_count}: {result.error}")
                consecutive_errors += 1
            elif result.bid_order_id or result.ask_order_id:
                logger.info(
                    f"MM cycle {cycle_count}: {result.market_question[:40]} | "
                    f"bid={result.bid_price} ask={result.ask_price} | "
                    f"bid_id={'OK' if result.bid_order_id else 'FAIL'} "
                    f"ask_id={'OK' if result.ask_order_id else 'FAIL'}"
                )
                consecutive_errors = 0
            else:
                logger.info(f"MM cycle {cycle_count}: {result.error or 'No action'}")
                consecutive_errors += 1

            if consecutive_errors >= 10:
                logger.error("MM scheduler: 10 consecutive errors, pausing for 5 minutes")
                await asyncio.sleep(300)
                consecutive_errors = 0

        except Exception as e:
            logger.error(f"MM cycle {cycle_count} error: {e}")
            consecutive_errors += 1

        await asyncio.sleep(INTERVAL)


def start_mm_scheduler():
    """Start the market maker background loop."""
    global _task, _running
    if _running:
        return {"status": "already_running"}

    _running = True
    _task = asyncio.create_task(_run_loop())
    logger.info("Market maker scheduler started")
    return {"status": "started", "interval_sec": INTERVAL}


def stop_mm_scheduler():
    """Stop the market maker background loop."""
    global _task, _running
    _running = False

    if _task:
        _task.cancel()
        _task = None

    # Cancel all open orders
    try:
        pk = os.getenv("POLYMARKET_PRIVATE_KEY")
        if pk:
            from app.strategies.market_maker import MarketMakerBot
            bot = MarketMakerBot(private_key=pk)
            bot.initialize()
            bot.cancel_all_orders()
    except Exception as e:
        logger.error(f"Failed to cancel orders on stop: {e}")

    logger.info("Market maker scheduler stopped")
    return {"status": "stopped"}


def is_running() -> bool:
    return _running

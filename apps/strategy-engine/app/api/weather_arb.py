"""
MarketPilot AI — Weather Arbitrage API Router
==============================================
FastAPI endpoints for controlling the weather arbitrage scanner,
viewing positions, signals, and triggering emergency stops.
"""

from __future__ import annotations

import logging
import os
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/weather-arb", tags=["weather-arb"])

# ---------------------------------------------------------------------------
# Singleton scanner instance
# ---------------------------------------------------------------------------

_scanner = None


def _get_scanner():
    """Lazily create the WeatherArbScanner singleton."""
    global _scanner
    if _scanner is not None:
        return _scanner

    from app.strategies.weather.scanner import WeatherArbScanner

    interval = int(os.getenv("WEATHER_ARB_INTERVAL_SEC", "120"))
    bankroll = float(os.getenv("WEATHER_ARB_BANKROLL", "100.0"))

    _scanner = WeatherArbScanner(
        scan_interval_sec=interval,
        bankroll=bankroll,
    )
    return _scanner


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------

class ScannerStatusResponse(BaseModel):
    running: bool
    scan_count: int
    scan_interval_sec: int
    last_scan_at: Optional[str] = None
    last_error: Optional[str] = None
    consecutive_errors: int = 0
    position_manager: dict = {}
    last_signals_count: int = 0
    last_markets_count: int = 0
    last_forecasts_count: int = 0


class StartStopResponse(BaseModel):
    status: str
    interval_sec: Optional[int] = None
    bankroll: Optional[float] = None
    scan_count: Optional[int] = None


class ScanResultResponse(BaseModel):
    scan_id: int
    started_at: str
    forecasts_fetched: int = 0
    markets_found: int = 0
    signals_generated: int = 0
    trades_executed: int = 0
    exits_triggered: int = 0
    elapsed_sec: float = 0.0
    errors: list[str] = []


class EmergencyStopResponse(BaseModel):
    status: str
    reason: str
    positions_closed: int


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/start", response_model=StartStopResponse)
def start_scanner():
    """Start the automated weather arb scanning loop."""
    scanner = _get_scanner()
    result = scanner.start()
    return StartStopResponse(**result)


@router.post("/stop", response_model=StartStopResponse)
def stop_scanner():
    """Stop the automated weather arb scanning loop."""
    scanner = _get_scanner()
    result = scanner.stop()
    return StartStopResponse(**result)


@router.get("/status", response_model=ScannerStatusResponse)
def get_status():
    """Get current scanner status, positions, bankroll, and daily P&L."""
    scanner = _get_scanner()
    return ScannerStatusResponse(**scanner.status())


@router.post("/scan", response_model=ScanResultResponse)
async def run_manual_scan():
    """Run a single scan manually (does not require the loop to be running)."""
    scanner = _get_scanner()
    result = await scanner.run_single_scan()
    return ScanResultResponse(**result)


@router.get("/signals")
def get_recent_signals():
    """Get the most recent 20 trade signals."""
    scanner = _get_scanner()
    signals = scanner.strategy.recent_signals[-20:]
    return {
        "count": len(signals),
        "signals": [s.to_dict() for s in signals],
    }


@router.get("/positions")
def get_positions():
    """Get all current and recent positions."""
    scanner = _get_scanner()
    pm = scanner.pm

    open_positions = [
        {
            "id": p.id,
            "market_id": p.market_id,
            "city": p.city,
            "target_date": p.target_date,
            "outcome": p.outcome,
            "entry_price": p.entry_price,
            "size_usd": p.size_usd,
            "shares": round(p.shares, 4),
            "noaa_confidence": round(p.noaa_confidence, 4),
            "forecast_temp_f": p.forecast_temp_f,
            "bucket_description": p.bucket_description,
            "opened_at": p.opened_at.isoformat(),
            "status": p.status.value,
        }
        for p in pm.open_positions
    ]

    closed_positions = [
        {
            "id": p.id,
            "market_id": p.market_id,
            "city": p.city,
            "target_date": p.target_date,
            "outcome": p.outcome,
            "entry_price": p.entry_price,
            "exit_price": p.exit_price,
            "size_usd": p.size_usd,
            "pnl": round(p.pnl, 4),
            "opened_at": p.opened_at.isoformat(),
            "closed_at": p.closed_at.isoformat() if p.closed_at else None,
            "status": p.status.value,
        }
        for p in pm.positions
        if not p.is_open
    ][-20:]  # last 20 closed

    return {
        "open": open_positions,
        "closed": closed_positions,
        "summary": pm.summary(),
    }


@router.post("/emergency-stop", response_model=EmergencyStopResponse)
async def emergency_stop():
    """Halt all trading and close all positions immediately."""
    scanner = _get_scanner()
    result = await scanner.emergency_stop(reason="Manual emergency stop via API")
    return EmergencyStopResponse(**result)

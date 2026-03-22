"""
MarketPilot AI — Weather Arbitrage Strategy Package
====================================================
Exploits pricing inefficiencies in Polymarket weather/temperature
markets using NOAA forecast data as the edge source.
"""

from app.strategies.weather.arb import WeatherArbStrategy, TradeSignal
from app.strategies.weather.position_manager import PositionManager
from app.strategies.weather.scanner import WeatherArbScanner

__all__ = [
    "WeatherArbStrategy",
    "TradeSignal",
    "PositionManager",
    "WeatherArbScanner",
]

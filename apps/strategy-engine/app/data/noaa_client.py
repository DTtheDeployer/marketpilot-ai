"""
MarketPilot AI — NOAA Weather Forecast Client
==============================================
Async client for the National Weather Service (api.weather.gov) API.
Fetches hourly temperature forecasts for 6 US cities and converts them
into confidence-weighted temperature buckets used by Polymarket weather markets.

NOAA API is free — no API key required. A descriptive User-Agent header is mandatory.
"""

from __future__ import annotations

import asyncio
import logging
import math
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# City Configuration
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class CityConfig:
    """NWS grid-point configuration for a supported city."""
    name: str
    slug: str           # short identifier used in Polymarket market slugs
    lat: float
    lon: float
    office: str         # NWS Weather Forecast Office identifier
    grid_x: int
    grid_y: int

# Pre-configured cities — grid coordinates obtained from /points/{lat},{lon}
CITIES: dict[str, CityConfig] = {
    "nyc": CityConfig(
        name="New York City", slug="nyc",
        lat=40.7128, lon=-74.0060,
        office="OKX", grid_x=33, grid_y=37,
    ),
    "chicago": CityConfig(
        name="Chicago", slug="chicago",
        lat=41.8781, lon=-87.6298,
        office="LOT", grid_x=65, grid_y=76,
    ),
    "seattle": CityConfig(
        name="Seattle", slug="seattle",
        lat=47.6062, lon=-122.3321,
        office="SEW", grid_x=124, grid_y=67,
    ),
    "atlanta": CityConfig(
        name="Atlanta", slug="atlanta",
        lat=33.7490, lon=-84.3880,
        office="FFC", grid_x=50, grid_y=86,
    ),
    "dallas": CityConfig(
        name="Dallas", slug="dallas",
        lat=32.7767, lon=-96.7970,
        office="FWD", grid_x=79, grid_y=108,
    ),
    "miami": CityConfig(
        name="Miami", slug="miami",
        lat=25.7617, lon=-80.1918,
        office="MFL", grid_x=75, grid_y=52,
    ),
}

# ---------------------------------------------------------------------------
# Confidence model — degrades with forecast horizon
# ---------------------------------------------------------------------------

CONFIDENCE_BY_HOURS: list[tuple[int, float]] = [
    (24,  0.96),
    (48,  0.94),
    (72,  0.88),
    (120, 0.80),
    (168, 0.70),
]


def confidence_for_horizon(hours_ahead: float) -> float:
    """Return a confidence score (0-1) for a forecast *hours_ahead* in the future."""
    if hours_ahead <= 0:
        return 0.98
    for limit, conf in CONFIDENCE_BY_HOURS:
        if hours_ahead <= limit:
            return conf
    return 0.60  # beyond 168 h


# ---------------------------------------------------------------------------
# Dataclasses for forecast data
# ---------------------------------------------------------------------------

@dataclass
class HourlyForecast:
    """Single hourly temperature data point from NWS."""
    city: str
    timestamp: datetime
    temperature_f: float
    wind_speed_mph: float
    short_forecast: str
    is_daytime: bool
    hours_ahead: float
    confidence: float

    @property
    def temperature_bucket_lower(self) -> int:
        """Lower bound of the 2 degF bucket this temperature falls into."""
        return int(math.floor(self.temperature_f / 2) * 2)

    @property
    def temperature_bucket_upper(self) -> int:
        return self.temperature_bucket_lower + 2


@dataclass
class CityForecast:
    """All hourly forecasts for one city."""
    city: str
    city_config: CityConfig
    forecasts: list[HourlyForecast] = field(default_factory=list)
    fetched_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    error: Optional[str] = None

    @property
    def high_today(self) -> Optional[float]:
        now = datetime.now(timezone.utc)
        today_forecasts = [
            f for f in self.forecasts
            if f.timestamp.date() == now.date() and f.is_daytime
        ]
        if not today_forecasts:
            return None
        return max(f.temperature_f for f in today_forecasts)

    @property
    def high_tomorrow(self) -> Optional[float]:
        tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).date()
        tomorrow_forecasts = [
            f for f in self.forecasts
            if f.timestamp.date() == tomorrow and f.is_daytime
        ]
        if not tomorrow_forecasts:
            return None
        return max(f.temperature_f for f in tomorrow_forecasts)

    def high_for_date(self, target_date) -> Optional[float]:
        """Get forecast high for a specific date."""
        day_forecasts = [
            f for f in self.forecasts
            if f.timestamp.date() == target_date and f.is_daytime
        ]
        if not day_forecasts:
            return None
        return max(f.temperature_f for f in day_forecasts)

    def confidence_for_date(self, target_date) -> float:
        """Average confidence for forecasts on a specific date."""
        day_forecasts = [
            f for f in self.forecasts
            if f.timestamp.date() == target_date
        ]
        if not day_forecasts:
            return 0.0
        return sum(f.confidence for f in day_forecasts) / len(day_forecasts)


# ---------------------------------------------------------------------------
# Severe weather adjustments
# ---------------------------------------------------------------------------

SEVERE_KEYWORDS = frozenset({
    "hurricane", "tropical storm", "tornado", "severe thunderstorm",
    "blizzard", "ice storm", "extreme heat", "extreme cold",
})


def severe_weather_adjustment(short_forecast: str) -> float:
    """Return a confidence *multiplier* (< 1.0) if severe weather is mentioned."""
    lower = short_forecast.lower()
    for kw in SEVERE_KEYWORDS:
        if kw in lower:
            return 0.70  # 30 % penalty
    if "thunderstorm" in lower:
        return 0.90
    return 1.0


# ---------------------------------------------------------------------------
# NOAA Client
# ---------------------------------------------------------------------------

class NOAAClient:
    """Async client for the NWS weather.gov API."""

    BASE_URL = "https://api.weather.gov"
    USER_AGENT = "(MarketPilotAI, contact@marketpilot.dev)"

    def __init__(self, timeout: float = 30.0, max_retries: int = 3):
        self._timeout = timeout
        self._max_retries = max_retries
        self._client: Optional[httpx.AsyncClient] = None
        # Cache: office+grid -> hourly forecast URL
        self._grid_cache: dict[str, str] = {}

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.BASE_URL,
                headers={"User-Agent": self.USER_AGENT, "Accept": "application/geo+json"},
                timeout=httpx.Timeout(self._timeout),
                follow_redirects=True,
            )
        return self._client

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    # ----- low-level request with retry -----

    async def _get(self, url: str) -> dict:
        """GET with exponential-backoff retry."""
        client = await self._get_client()
        last_exc: Optional[Exception] = None
        for attempt in range(1, self._max_retries + 1):
            try:
                resp = await client.get(url)
                if resp.status_code == 200:
                    return resp.json()
                if resp.status_code == 503:
                    # NWS occasionally returns 503 — retry
                    logger.warning("NOAA 503 on %s (attempt %d/%d)", url, attempt, self._max_retries)
                    await asyncio.sleep(2 ** attempt)
                    continue
                if resp.status_code == 500:
                    logger.warning("NOAA 500 on %s (attempt %d/%d)", url, attempt, self._max_retries)
                    await asyncio.sleep(2 ** attempt)
                    continue
                resp.raise_for_status()
            except httpx.HTTPStatusError as exc:
                last_exc = exc
                logger.warning("NOAA HTTP %s on %s (attempt %d)", exc.response.status_code, url, attempt)
                await asyncio.sleep(2 ** attempt)
            except (httpx.ConnectError, httpx.ReadTimeout, httpx.ConnectTimeout) as exc:
                last_exc = exc
                logger.warning("NOAA network error on %s: %s (attempt %d)", url, exc, attempt)
                await asyncio.sleep(2 ** attempt)

        raise ConnectionError(f"NOAA API failed after {self._max_retries} retries: {last_exc}")

    # ----- grid endpoint resolution -----

    async def _resolve_grid_url(self, city: CityConfig) -> str:
        """Return the hourly forecast URL for a city, caching the grid endpoint."""
        cache_key = f"{city.office}/{city.grid_x},{city.grid_y}"
        if cache_key in self._grid_cache:
            return self._grid_cache[cache_key]

        # Use the pre-configured grid coordinates directly
        url = f"/gridpoints/{city.office}/{city.grid_x},{city.grid_y}/forecast/hourly"
        self._grid_cache[cache_key] = url
        logger.debug("Resolved grid URL for %s: %s", city.name, url)
        return url

    async def resolve_grid_from_latlon(self, city: CityConfig) -> str:
        """Dynamically resolve grid from lat/lon (fallback if hard-coded grids are stale)."""
        cache_key = f"latlon:{city.lat},{city.lon}"
        if cache_key in self._grid_cache:
            return self._grid_cache[cache_key]

        data = await self._get(f"/points/{city.lat},{city.lon}")
        props = data["properties"]
        office = props["gridId"]
        gx = props["gridX"]
        gy = props["gridY"]
        url = f"/gridpoints/{office}/{gx},{gy}/forecast/hourly"
        self._grid_cache[cache_key] = url
        logger.info("Resolved %s via lat/lon -> %s/%d,%d", city.name, office, gx, gy)
        return url

    # ----- fetch forecasts -----

    async def get_hourly_forecast(self, city_slug: str) -> CityForecast:
        """Fetch hourly forecasts for a single city."""
        if city_slug not in CITIES:
            raise ValueError(f"Unknown city: {city_slug}. Available: {list(CITIES.keys())}")

        city = CITIES[city_slug]
        now = datetime.now(timezone.utc)

        try:
            url = await self._resolve_grid_url(city)
            data = await self._get(url)
        except ConnectionError:
            # Fallback: try dynamic resolution
            try:
                logger.info("Falling back to lat/lon resolution for %s", city.name)
                url = await self.resolve_grid_from_latlon(city)
                data = await self._get(url)
            except Exception as exc:
                logger.error("Failed to fetch forecast for %s: %s", city.name, exc)
                return CityForecast(city=city_slug, city_config=city, error=str(exc))

        periods = data.get("properties", {}).get("periods", [])
        forecasts: list[HourlyForecast] = []

        for period in periods:
            try:
                ts = datetime.fromisoformat(period["startTime"])
                hours_ahead = (ts - now).total_seconds() / 3600.0
                if hours_ahead < 0:
                    continue  # skip past periods

                temp_f = float(period["temperature"])
                wind_str = period.get("windSpeed", "0 mph")
                wind_mph = float(wind_str.split()[0]) if wind_str else 0.0

                short_fc = period.get("shortForecast", "")
                base_confidence = confidence_for_horizon(hours_ahead)
                severe_mult = severe_weather_adjustment(short_fc)
                final_confidence = base_confidence * severe_mult

                forecasts.append(HourlyForecast(
                    city=city_slug,
                    timestamp=ts,
                    temperature_f=temp_f,
                    wind_speed_mph=wind_mph,
                    short_forecast=short_fc,
                    is_daytime=period.get("isDaytime", True),
                    hours_ahead=hours_ahead,
                    confidence=round(final_confidence, 4),
                ))
            except (KeyError, ValueError, TypeError) as exc:
                logger.debug("Skipping malformed period for %s: %s", city.name, exc)
                continue

        logger.info("Fetched %d hourly forecasts for %s", len(forecasts), city.name)
        return CityForecast(city=city_slug, city_config=city, forecasts=forecasts)

    async def scan_all_cities(self) -> dict[str, CityForecast]:
        """Fetch forecasts for all 6 cities concurrently."""
        tasks = {slug: self.get_hourly_forecast(slug) for slug in CITIES}
        results: dict[str, CityForecast] = {}

        gathered = await asyncio.gather(*tasks.values(), return_exceptions=True)

        for slug, result in zip(tasks.keys(), gathered):
            if isinstance(result, Exception):
                logger.error("Error fetching %s: %s", slug, result)
                results[slug] = CityForecast(
                    city=slug,
                    city_config=CITIES[slug],
                    error=str(result),
                )
            else:
                results[slug] = result

        success = sum(1 for r in results.values() if r.error is None)
        logger.info("NOAA scan complete: %d/%d cities succeeded", success, len(CITIES))
        return results


def temperature_to_bucket(temp_f: float) -> tuple[int, int]:
    """Convert a temperature to its 2 degF bucket (lower, upper)."""
    lower = int(math.floor(temp_f / 2) * 2)
    return lower, lower + 2

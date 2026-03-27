"""
MarketPilot AI — The Odds API Client
=====================================
Async client for The Odds API (https://the-odds-api.com).
Fetches sharp bookmaker odds for sports events and converts them
to implied probabilities for comparison with Polymarket prices.

Requires environment variable:
  ODDS_API_KEY  — Free tier: 500 requests/month
"""

from __future__ import annotations

import logging
import os
import time
from dataclasses import dataclass
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

BASE_URL = "https://api.the-odds-api.com/v4"

# Sports we track on Polymarket
TRACKED_SPORTS = [
    "upcoming_mma_mixed_martial_arts",
    "basketball_nba",
    "soccer_epl",
    "soccer_uefa_champions_league",
    "americanfootball_nfl",
]

# Cache TTL — 5 minutes to conserve the free-tier quota
_CACHE_TTL_SEC = 300


@dataclass
class BookmakerOdds:
    """Structured bookmaker odds for a single event."""
    event_id: str
    event: str           # e.g. "Fighter A vs Fighter B"
    team1: str
    team2: str
    team1_prob: float    # implied probability for team1
    team2_prob: float    # implied probability for team2
    draw_prob: float     # 0 for sports without draws
    best_book: str       # bookmaker with the sharpest line
    sport: str           # sport key
    commence_time: str   # ISO timestamp

    def to_dict(self) -> dict:
        return {
            "event_id": self.event_id,
            "event": self.event,
            "team1": self.team1,
            "team2": self.team2,
            "team1_prob": round(self.team1_prob, 4),
            "team2_prob": round(self.team2_prob, 4),
            "draw_prob": round(self.draw_prob, 4),
            "best_book": self.best_book,
            "sport": self.sport,
            "commence_time": self.commence_time,
        }


# ---------------------------------------------------------------------------
# Odds conversion helpers
# ---------------------------------------------------------------------------

def american_to_prob(american: float) -> float:
    """Convert American odds to implied probability."""
    if american >= 100:
        return 100.0 / (american + 100.0)
    else:
        return abs(american) / (abs(american) + 100.0)


def decimal_to_prob(decimal_odds: float) -> float:
    """Convert decimal odds to implied probability."""
    if decimal_odds <= 0:
        return 0.0
    return 1.0 / decimal_odds


def _normalize_probs(*probs: float) -> list[float]:
    """Remove vig by normalizing probabilities to sum to 1."""
    total = sum(probs)
    if total <= 0:
        return [0.0] * len(probs)
    return [p / total for p in probs]


# ---------------------------------------------------------------------------
# Cache
# ---------------------------------------------------------------------------

class _OddsCache:
    """Simple in-memory cache with TTL."""

    def __init__(self) -> None:
        self._store: dict[str, tuple[float, object]] = {}

    def get(self, key: str) -> Optional[object]:
        entry = self._store.get(key)
        if entry is None:
            return None
        ts, value = entry
        if time.time() - ts > _CACHE_TTL_SEC:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: object) -> None:
        self._store[key] = (time.time(), value)

    def clear(self) -> None:
        self._store.clear()


# ---------------------------------------------------------------------------
# Client
# ---------------------------------------------------------------------------

class OddsClient:
    """Async client for The Odds API."""

    def __init__(self) -> None:
        self._api_key = os.getenv("ODDS_API_KEY", "")
        self._client: Optional[httpx.AsyncClient] = None
        self._cache = _OddsCache()

        if not self._api_key:
            logger.warning(
                "ODDS_API_KEY not set — OddsClient will return empty results. "
                "Get a free key at https://the-odds-api.com"
            )

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(30.0),
                follow_redirects=True,
            )
        return self._client

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key)

    # ------------------------------------------------------------------ #
    #  Sports list                                                        #
    # ------------------------------------------------------------------ #

    async def get_sports(self) -> list[dict]:
        """List available sports from The Odds API."""
        if not self._api_key:
            return []

        cached = self._cache.get("sports")
        if cached is not None:
            return cached  # type: ignore

        client = await self._get_client()
        try:
            resp = await client.get(
                f"{BASE_URL}/sports",
                params={"apiKey": self._api_key},
            )
            resp.raise_for_status()
            data = resp.json()
            self._cache.set("sports", data)
            return data
        except Exception as exc:
            logger.error("Failed to fetch sports: %s", exc)
            return []

    # ------------------------------------------------------------------ #
    #  Odds for a sport                                                   #
    # ------------------------------------------------------------------ #

    async def get_odds(
        self,
        sport_key: str,
        regions: str = "us,eu",
        markets: str = "h2h",
    ) -> list[BookmakerOdds]:
        """Get odds for a specific sport. Returns structured BookmakerOdds."""
        if not self._api_key:
            return []

        cache_key = f"odds:{sport_key}:{regions}:{markets}"
        cached = self._cache.get(cache_key)
        if cached is not None:
            return cached  # type: ignore

        client = await self._get_client()
        try:
            resp = await client.get(
                f"{BASE_URL}/sports/{sport_key}/odds",
                params={
                    "apiKey": self._api_key,
                    "regions": regions,
                    "markets": markets,
                    "oddsFormat": "decimal",
                },
            )
            resp.raise_for_status()
            events = resp.json()
            results = self._parse_odds_response(events, sport_key)
            self._cache.set(cache_key, results)
            logger.info("Fetched %d events for %s", len(results), sport_key)
            return results
        except Exception as exc:
            logger.error("Failed to fetch odds for %s: %s", sport_key, exc)
            return []

    # ------------------------------------------------------------------ #
    #  Live (in-play) odds                                                #
    # ------------------------------------------------------------------ #

    async def get_live_odds(self, sport_key: str) -> list[BookmakerOdds]:
        """Get in-play odds for a sport (if available on free tier)."""
        if not self._api_key:
            return []

        cache_key = f"live:{sport_key}"
        cached = self._cache.get(cache_key)
        if cached is not None:
            return cached  # type: ignore

        client = await self._get_client()
        try:
            resp = await client.get(
                f"{BASE_URL}/sports/{sport_key}/odds-live",
                params={
                    "apiKey": self._api_key,
                    "regions": "us,eu",
                    "markets": "h2h",
                    "oddsFormat": "decimal",
                },
            )
            if resp.status_code == 404:
                # Live odds not available for this sport right now
                return []
            resp.raise_for_status()
            events = resp.json()
            results = self._parse_odds_response(events, sport_key)
            self._cache.set(cache_key, results)
            return results
        except Exception as exc:
            logger.error("Failed to fetch live odds for %s: %s", sport_key, exc)
            return []

    # ------------------------------------------------------------------ #
    #  Fetch all tracked sports                                           #
    # ------------------------------------------------------------------ #

    async def get_all_tracked_odds(self) -> list[BookmakerOdds]:
        """Fetch odds for all tracked sports. Returns combined list."""
        all_odds: list[BookmakerOdds] = []
        for sport_key in TRACKED_SPORTS:
            odds = await self.get_odds(sport_key)
            all_odds.extend(odds)
        logger.info("Fetched %d total events across %d sports", len(all_odds), len(TRACKED_SPORTS))
        return all_odds

    # ------------------------------------------------------------------ #
    #  Parse API response                                                 #
    # ------------------------------------------------------------------ #

    def _parse_odds_response(
        self, events: list[dict], sport_key: str
    ) -> list[BookmakerOdds]:
        """Parse The Odds API response into BookmakerOdds objects."""
        results: list[BookmakerOdds] = []

        for event in events:
            event_id = event.get("id", "")
            team1 = event.get("home_team", "")
            team2 = event.get("away_team", "")
            commence = event.get("commence_time", "")

            if not team1 or not team2:
                continue

            bookmakers = event.get("bookmakers", [])
            if not bookmakers:
                continue

            # Find the sharpest line (Pinnacle > DraftKings > first available)
            best_book = None
            sharp_priority = ["pinnacle", "draftkings", "fanduel", "betfair"]
            for pref in sharp_priority:
                for bm in bookmakers:
                    if pref in bm.get("key", "").lower():
                        best_book = bm
                        break
                if best_book:
                    break
            if best_book is None:
                best_book = bookmakers[0]

            # Extract h2h market outcomes
            h2h_market = None
            for market in best_book.get("markets", []):
                if market.get("key") == "h2h":
                    h2h_market = market
                    break
            if h2h_market is None:
                continue

            outcomes = h2h_market.get("outcomes", [])
            if len(outcomes) < 2:
                continue

            # Map outcomes to teams
            team1_decimal = 0.0
            team2_decimal = 0.0
            draw_decimal = 0.0

            for outcome in outcomes:
                name = outcome.get("name", "")
                price = float(outcome.get("price", 0))
                if name == team1:
                    team1_decimal = price
                elif name == team2:
                    team2_decimal = price
                elif name.lower() == "draw":
                    draw_decimal = price

            if team1_decimal <= 0 or team2_decimal <= 0:
                continue

            # Convert to implied probs and remove vig
            raw_probs = [decimal_to_prob(team1_decimal), decimal_to_prob(team2_decimal)]
            if draw_decimal > 0:
                raw_probs.append(decimal_to_prob(draw_decimal))
            normed = _normalize_probs(*raw_probs)

            team1_prob = normed[0]
            team2_prob = normed[1]
            draw_prob = normed[2] if len(normed) > 2 else 0.0

            results.append(BookmakerOdds(
                event_id=event_id,
                event=f"{team1} vs {team2}",
                team1=team1,
                team2=team2,
                team1_prob=team1_prob,
                team2_prob=team2_prob,
                draw_prob=draw_prob,
                best_book=best_book.get("title", best_book.get("key", "unknown")),
                sport=sport_key,
                commence_time=commence,
            ))

        return results

    # ------------------------------------------------------------------ #
    #  Cleanup                                                            #
    # ------------------------------------------------------------------ #

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()
        self._cache.clear()

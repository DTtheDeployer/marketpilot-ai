"""
MarketPilot AI — Sports Arbitrage Strategy
============================================
Core strategy logic: compares sharp bookmaker odds from The Odds API
against Polymarket sports market prices. When Polymarket is mispriced
relative to bookmaker consensus, it generates trade signals.

Entry criteria:
  - Edge (bookmaker_implied_prob - polymarket_price) >= 5%
  - Market volume >= $10,000
  - Time to resolution < 48 hours

Exit:
  - Sports markets resolve when the event ends — hold to resolution
  - Quarter-Kelly position sizing
"""

from __future__ import annotations

import logging
import re
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

from app.data.odds_client import BookmakerOdds
from app.strategies.weather.position_manager import (
    PositionManager,
    Position,
    PositionStatus,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Sports Signal
# ---------------------------------------------------------------------------


@dataclass
class SportsSignal:
    """A sports arb trade signal ready for execution."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    event: str = ""
    sport: str = ""
    side: str = "BUY"
    outcome: str = "YES"          # which outcome to buy
    team: str = ""                # team/fighter we're backing
    bookmaker_prob: float = 0.0   # sharp bookmaker implied probability
    polymarket_price: float = 0.0 # current Polymarket price
    edge_pct: float = 0.0        # bookmaker_prob - polymarket_price
    kelly_size: float = 0.0      # position size in USD
    confidence: str = ""          # "high" / "medium"
    market_id: str = ""
    token_id: str = ""
    condition_id: str = ""
    market_question: str = ""
    best_book: str = ""           # bookmaker name
    commence_time: str = ""       # event start time
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    executed: bool = False
    execution_error: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "event": self.event,
            "sport": self.sport,
            "side": self.side,
            "outcome": self.outcome,
            "team": self.team,
            "bookmaker_prob": round(self.bookmaker_prob, 4),
            "polymarket_price": round(self.polymarket_price, 4),
            "edge_pct": round(self.edge_pct, 4),
            "kelly_size": round(self.kelly_size, 2),
            "confidence": self.confidence,
            "market_id": self.market_id,
            "token_id": self.token_id,
            "market_question": self.market_question,
            "best_book": self.best_book,
            "commence_time": self.commence_time,
            "created_at": self.created_at.isoformat(),
            "executed": self.executed,
            "execution_error": self.execution_error,
        }


# ---------------------------------------------------------------------------
# Polymarket sports market representation
# ---------------------------------------------------------------------------


@dataclass
class SportsMarket:
    """Parsed Polymarket sports market."""
    market_id: str
    condition_id: str
    question: str
    yes_price: float
    no_price: float
    token_id_yes: str
    token_id_no: str
    volume_24h: float = 0.0
    active: bool = True
    end_date: Optional[str] = None  # ISO date

    # Extracted team/fighter names for matching
    team1: Optional[str] = None
    team2: Optional[str] = None

    @classmethod
    def from_gamma_market(cls, market: dict) -> Optional["SportsMarket"]:
        """Parse a market from the Gamma Markets API response."""
        question = market.get("question", "")
        if not question:
            return None

        # Gamma API returns JSON-encoded strings, not native arrays
        import json as _json
        def _parse_field(val):
            if isinstance(val, str):
                try:
                    return _json.loads(val)
                except (ValueError, TypeError):
                    return []
            return val or []

        outcomes = _parse_field(market.get("outcomes"))
        prices = _parse_field(market.get("outcomePrices"))
        token_ids = _parse_field(market.get("clobTokenIds"))

        # Also support nested tokens format (older API versions)
        tokens = market.get("tokens") or []
        if tokens and len(tokens) >= 2 and not outcomes:
            yes_token = next((t for t in tokens if t.get("outcome", "").upper() == "YES"), None)
            no_token = next((t for t in tokens if t.get("outcome", "").upper() == "NO"), None)
            if yes_token and no_token:
                outcomes = ["Yes", "No"]
                prices = [str(yes_token.get("price", 0)), str(no_token.get("price", 0))]
                token_ids = [yes_token.get("token_id", ""), no_token.get("token_id", "")]

        if len(outcomes) < 2 or len(prices) < 2:
            return None

        # Map outcomes to Yes/No
        yes_idx = next((i for i, o in enumerate(outcomes) if o.lower() == "yes"), None)
        no_idx = next((i for i, o in enumerate(outcomes) if o.lower() == "no"), None)
        if yes_idx is None or no_idx is None:
            return None

        yes_price = float(prices[yes_idx]) if yes_idx < len(prices) else 0.0
        no_price = float(prices[no_idx]) if no_idx < len(prices) else 0.0
        yes_token_id = token_ids[yes_idx] if yes_idx < len(token_ids) else ""
        no_token_id = token_ids[no_idx] if no_idx < len(token_ids) else ""

        # Try to extract team names from question
        team1, team2 = _extract_teams(question)

        return cls(
            market_id=market.get("id", market.get("condition_id", "")),
            condition_id=market.get("condition_id", market.get("id", "")),
            question=question,
            yes_price=yes_price,
            no_price=no_price,
            token_id_yes=yes_token_id,
            token_id_no=no_token_id,
            volume_24h=float(market.get("volume", 0)),
            active=market.get("active", True),
            end_date=market.get("end_date_iso"),
            team1=team1,
            team2=team2,
        )


# ---------------------------------------------------------------------------
# Fuzzy matching helpers
# ---------------------------------------------------------------------------

# Common patterns: "Will X beat Y", "X vs Y", "X to win against Y"
_VS_PATTERN = re.compile(
    r"(.+?)\s+(?:vs\.?|versus|v\.?)\s+(.+?)(?:\?|$)",
    re.IGNORECASE,
)
_BEAT_PATTERN = re.compile(
    r"will\s+(.+?)\s+(?:beat|defeat|win against)\s+(.+?)(?:\?|$)",
    re.IGNORECASE,
)
_WIN_PATTERN = re.compile(
    r"(.+?)\s+(?:to win|wins?)\b",
    re.IGNORECASE,
)


def _extract_teams(question: str) -> tuple[Optional[str], Optional[str]]:
    """Extract team/fighter names from a Polymarket question."""
    # Try "X vs Y" pattern
    m = _VS_PATTERN.search(question)
    if m:
        return _clean_name(m.group(1)), _clean_name(m.group(2))

    # Try "Will X beat Y" pattern
    m = _BEAT_PATTERN.search(question)
    if m:
        return _clean_name(m.group(1)), _clean_name(m.group(2))

    return None, None


def _clean_name(name: str) -> str:
    """Clean up a team/fighter name for matching."""
    name = name.strip()
    # Remove common prefixes
    for prefix in ("will ", "the ", "team "):
        if name.lower().startswith(prefix):
            name = name[len(prefix):]
    return name.strip()


def _normalize_for_match(name: str) -> str:
    """Normalize a name for fuzzy matching."""
    s = name.lower().strip()
    # Remove common noise
    for noise in ("vs", "vs.", "v.", "versus", "the ", "fc ", "ufc "):
        s = s.replace(noise, " ")
    # Remove punctuation
    s = re.sub(r"[^a-z0-9\s]", "", s)
    # Collapse whitespace
    s = re.sub(r"\s+", " ", s).strip()
    return s


def fuzzy_match_event(
    bookmaker_odds: BookmakerOdds,
    sports_market: SportsMarket,
) -> Optional[tuple[str, str, float, float]]:
    """
    Check if a bookmaker event matches a Polymarket market.
    Returns (matched_team, outcome_side, book_prob, poly_price) or None.

    Matching strategy:
    - Normalize both team names
    - Check if both bookmaker teams appear in the Polymarket question
    - OR check if extracted team names overlap
    """
    question_norm = _normalize_for_match(sports_market.question)
    team1_norm = _normalize_for_match(bookmaker_odds.team1)
    team2_norm = _normalize_for_match(bookmaker_odds.team2)

    # Check: do both bookmaker team names appear in the question?
    team1_in_q = _name_in_text(team1_norm, question_norm)
    team2_in_q = _name_in_text(team2_norm, question_norm)

    if not (team1_in_q and team2_in_q):
        # Try matching against extracted team names
        if sports_market.team1 and sports_market.team2:
            pm_team1 = _normalize_for_match(sports_market.team1)
            pm_team2 = _normalize_for_match(sports_market.team2)

            t1_match = _name_in_text(team1_norm, pm_team1) or _name_in_text(pm_team1, team1_norm)
            t2_match = _name_in_text(team2_norm, pm_team2) or _name_in_text(pm_team2, team2_norm)

            # Also try cross-matching (bookmaker team order might differ)
            t1_cross = _name_in_text(team1_norm, pm_team2) or _name_in_text(pm_team2, team1_norm)
            t2_cross = _name_in_text(team2_norm, pm_team1) or _name_in_text(pm_team1, team2_norm)

            if not ((t1_match and t2_match) or (t1_cross and t2_cross)):
                return None
        else:
            return None

    # Determine which side to trade
    # The Polymarket YES token typically corresponds to team1/first named
    # We figure out which bookmaker team corresponds to YES
    # If the question asks "Will [team1] win/beat [team2]?" → YES = team1
    question_lower = sports_market.question.lower()

    # Try to determine which team is the YES outcome
    if sports_market.team1:
        pm_t1 = _normalize_for_match(sports_market.team1)
        if _name_in_text(team1_norm, pm_t1) or _name_in_text(pm_t1, team1_norm):
            # YES = bookmaker team1
            return (bookmaker_odds.team1, "YES", bookmaker_odds.team1_prob, sports_market.yes_price)
        elif _name_in_text(team2_norm, pm_t1) or _name_in_text(pm_t1, team2_norm):
            # YES = bookmaker team2
            return (bookmaker_odds.team2, "YES", bookmaker_odds.team2_prob, sports_market.yes_price)

    # Fallback: if team1 name appears first in question, assume YES = team1
    pos1 = question_norm.find(team1_norm.split()[0]) if team1_norm else 999
    pos2 = question_norm.find(team2_norm.split()[0]) if team2_norm else 999

    if pos1 < pos2:
        return (bookmaker_odds.team1, "YES", bookmaker_odds.team1_prob, sports_market.yes_price)
    else:
        return (bookmaker_odds.team2, "YES", bookmaker_odds.team2_prob, sports_market.yes_price)


def _name_in_text(name: str, text: str) -> bool:
    """Check if a normalized name appears in normalized text."""
    if not name or not text:
        return False
    # Check if all significant words of the name appear in the text
    name_words = [w for w in name.split() if len(w) > 2]
    if not name_words:
        return False
    matches = sum(1 for w in name_words if w in text)
    return matches >= max(1, len(name_words) * 0.6)


# ---------------------------------------------------------------------------
# Sports Arb Strategy
# ---------------------------------------------------------------------------


class SportsArbStrategy:
    """
    Core sports arbitrage strategy.

    Compares sharp bookmaker odds from The Odds API against Polymarket
    sports market prices and generates trade signals when:
      1. Edge (bookmaker_prob - polymarket_price) >= MIN_EDGE
      2. Market has sufficient volume
      3. Event starts within 48 hours
    """

    MIN_EDGE: float = 0.05           # 5% minimum edge
    MIN_VOLUME: float = 10_000.0     # $10K minimum volume
    MAX_HOURS_TO_EVENT: int = 48     # 48h max time to resolution

    def __init__(self, position_manager: PositionManager):
        self.pm = position_manager
        self._recent_signals: list[SportsSignal] = []

    @property
    def recent_signals(self) -> list[SportsSignal]:
        return self._recent_signals[-50:]

    # ------------------------------------------------------------------ #
    #  Opportunity scanning                                               #
    # ------------------------------------------------------------------ #

    def scan_opportunities(
        self,
        bookmaker_odds: list[BookmakerOdds],
        sports_markets: list[SportsMarket],
    ) -> list[SportsSignal]:
        """
        Match bookmaker odds to Polymarket sports markets and
        generate trade signals for mispriced markets.
        """
        signals: list[SportsSignal] = []

        for bm_event in bookmaker_odds:
            for market in sports_markets:
                if not market.active:
                    continue

                match = fuzzy_match_event(bm_event, market)
                if match is None:
                    continue

                team, outcome_side, book_prob, poly_price = match

                # Calculate edge
                edge = book_prob - poly_price
                if edge < self.MIN_EDGE:
                    # Also check the NO side
                    no_book_prob = 1.0 - book_prob
                    no_poly_price = market.no_price
                    no_edge = no_book_prob - no_poly_price
                    if no_edge >= self.MIN_EDGE:
                        # Trade the NO side instead
                        other_team = bm_event.team2 if team == bm_event.team1 else bm_event.team1
                        signal = self._build_signal(
                            bm_event, market, other_team, "NO",
                            no_book_prob, no_poly_price, no_edge,
                        )
                        if signal:
                            signals.append(signal)
                    continue

                signal = self._build_signal(
                    bm_event, market, team, outcome_side,
                    book_prob, poly_price, edge,
                )
                if signal:
                    signals.append(signal)

        # Sort by edge descending
        signals.sort(key=lambda s: s.edge_pct, reverse=True)
        self._recent_signals.extend(signals)
        logger.info("Sports arb scan found %d signals", len(signals))
        return signals

    def _build_signal(
        self,
        bm_event: BookmakerOdds,
        market: SportsMarket,
        team: str,
        outcome: str,
        book_prob: float,
        poly_price: float,
        edge: float,
    ) -> Optional[SportsSignal]:
        """Build a SportsSignal if it passes all filters."""
        # Volume filter
        if market.volume_24h < self.MIN_VOLUME:
            return None

        # Ensure poly_price is reasonable
        if poly_price <= 0.01 or poly_price >= 0.99:
            return None

        # Kelly sizing
        payout_ratio = (1.0 - poly_price) / poly_price
        kelly = self.pm.kelly_size(win_probability=book_prob, payout_ratio=payout_ratio)
        if kelly <= 0:
            return None

        confidence = "high" if edge >= 0.10 else "medium"
        token_id = market.token_id_yes if outcome == "YES" else market.token_id_no

        return SportsSignal(
            event=bm_event.event,
            sport=bm_event.sport,
            side="BUY",
            outcome=outcome,
            team=team,
            bookmaker_prob=book_prob,
            polymarket_price=poly_price,
            edge_pct=edge,
            kelly_size=kelly,
            confidence=confidence,
            market_id=market.market_id,
            token_id=token_id,
            condition_id=market.condition_id,
            market_question=market.question,
            best_book=bm_event.best_book,
            commence_time=bm_event.commence_time,
        )

    # ------------------------------------------------------------------ #
    #  Signal execution                                                   #
    # ------------------------------------------------------------------ #

    def execute_signals(
        self,
        signals: list[SportsSignal],
        execute_fn,
    ) -> list[SportsSignal]:
        """
        Execute trade signals using the provided execution function.
        execute_fn(signal) -> Optional[str] (order_id)
        """
        executed: list[SportsSignal] = []

        for signal in signals:
            allowed, reason = self.pm.can_open_position(signal.kelly_size)
            if not allowed:
                logger.info("Skipping signal %s: %s", signal.id[:8], reason)
                signal.execution_error = reason
                continue

            try:
                order_id = execute_fn(signal)
                if order_id:
                    signal.executed = True
                    pos = Position(
                        id=signal.id,
                        market_id=signal.market_id,
                        token_id=signal.token_id,
                        city=signal.sport,  # reuse city field for sport
                        target_date=signal.commence_time,
                        side=signal.side,
                        outcome=signal.outcome,
                        entry_price=signal.polymarket_price,
                        size_usd=signal.kelly_size,
                        shares=signal.kelly_size / signal.polymarket_price if signal.polymarket_price > 0 else 0,
                        noaa_confidence=signal.bookmaker_prob,  # reuse field
                        forecast_temp_f=0.0,
                        bucket_description=signal.event,
                        order_id=order_id,
                    )
                    self.pm.open_position(pos)
                    executed.append(signal)
                else:
                    signal.execution_error = "execute_fn returned None"
            except Exception as exc:
                signal.execution_error = str(exc)
                logger.error("Failed to execute signal %s: %s", signal.id[:8], exc)

        logger.info("Executed %d/%d sports signals", len(executed), len(signals))
        return executed

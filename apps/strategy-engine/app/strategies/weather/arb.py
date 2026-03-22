"""
MarketPilot AI — Weather Arbitrage Strategy
============================================
Core strategy logic: matches NOAA temperature forecasts to Polymarket
weather markets and generates trade signals when the NOAA-implied
probability diverges significantly from the market price.

Entry criteria:
  - NOAA confidence >= 85 %
  - Market price <= 15 cents (i.e. market says < 15 % chance)
  - Positive expected value

Exit criteria:
  - Price >= 45 cents (3x return target)
  - NOAA confidence drops below 70 %
"""

from __future__ import annotations

import logging
import re
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone, date, timedelta
from typing import Optional

from app.data.noaa_client import CityForecast, HourlyForecast, CITIES, temperature_to_bucket
from app.strategies.weather.position_manager import (
    PositionManager,
    Position,
    PositionStatus,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Trade Signal
# ---------------------------------------------------------------------------

@dataclass
class TradeSignal:
    """A weather-arb trade signal ready for execution."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    city: str = ""
    market_id: str = ""
    token_id: str = ""
    condition_id: str = ""
    market_question: str = ""
    side: str = "BUY"
    outcome: str = "YES"          # which outcome token to buy
    market_price: float = 0.0     # current market price (e.g. 0.12)
    noaa_confidence: float = 0.0  # NOAA-implied probability
    forecast_temp_f: float = 0.0
    target_date: str = ""         # YYYY-MM-DD
    bucket_description: str = ""  # e.g. "above 72°F"
    expected_value: float = 0.0
    kelly_size_usd: float = 0.0
    payout_ratio: float = 0.0
    signal_strength: str = ""     # "strong" / "moderate"
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    executed: bool = False
    execution_error: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "city": self.city,
            "market_id": self.market_id,
            "token_id": self.token_id,
            "market_question": self.market_question,
            "side": self.side,
            "outcome": self.outcome,
            "market_price": self.market_price,
            "noaa_confidence": round(self.noaa_confidence, 4),
            "forecast_temp_f": self.forecast_temp_f,
            "target_date": self.target_date,
            "bucket_description": self.bucket_description,
            "expected_value": round(self.expected_value, 4),
            "kelly_size_usd": self.kelly_size_usd,
            "signal_strength": self.signal_strength,
            "created_at": self.created_at.isoformat(),
            "executed": self.executed,
            "execution_error": self.execution_error,
        }


# ---------------------------------------------------------------------------
# Market matching helpers
# ---------------------------------------------------------------------------

# Patterns to extract city and threshold from Polymarket question text
# Examples:
#   "Will the high temperature in NYC be above 72°F on March 25?"
#   "Will Chicago's high exceed 40°F on Saturday?"
#   "NYC high above 72°F on 3/25"

CITY_ALIASES: dict[str, str] = {
    "new york": "nyc", "nyc": "nyc", "new york city": "nyc",
    "chicago": "chicago",
    "seattle": "seattle",
    "atlanta": "atlanta",
    "dallas": "dallas",
    "miami": "miami",
}

_THRESHOLD_RE = re.compile(
    r"(?:above|over|exceed|at least|higher than|≥|>=)\s*(\d+)\s*°?\s*F",
    re.IGNORECASE,
)

_BELOW_THRESHOLD_RE = re.compile(
    r"(?:below|under|lower than|at most|≤|<=)\s*(\d+)\s*°?\s*F",
    re.IGNORECASE,
)

_DATE_PATTERNS = [
    # "March 25" / "Mar 25"
    re.compile(r"(January|February|March|April|May|June|July|August|September|October|November|December|"
               r"Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})", re.IGNORECASE),
    # "3/25"
    re.compile(r"(\d{1,2})/(\d{1,2})"),
    # Day names -> next occurrence
    re.compile(r"(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)", re.IGNORECASE),
]

MONTH_MAP = {
    "january": 1, "jan": 1, "february": 2, "feb": 2, "march": 3, "mar": 3,
    "april": 4, "apr": 4, "may": 5, "june": 6, "jun": 6, "july": 7, "jul": 7,
    "august": 8, "aug": 8, "september": 9, "sep": 9, "october": 10, "oct": 10,
    "november": 11, "nov": 11, "december": 12, "dec": 12,
}

DAY_MAP = {
    "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
    "friday": 4, "saturday": 5, "sunday": 6,
}


def _parse_target_date(question: str) -> Optional[date]:
    """Try to extract the target date from a market question."""
    now = datetime.now(timezone.utc)
    year = now.year

    # Month + day
    m = _DATE_PATTERNS[0].search(question)
    if m:
        month = MONTH_MAP.get(m.group(1).lower())
        day = int(m.group(2))
        if month:
            try:
                d = date(year, month, day)
                # If the date is in the past, try next year
                if d < now.date():
                    d = date(year + 1, month, day)
                return d
            except ValueError:
                pass

    # M/D format
    m = _DATE_PATTERNS[1].search(question)
    if m:
        try:
            month, day = int(m.group(1)), int(m.group(2))
            d = date(year, month, day)
            if d < now.date():
                d = date(year + 1, month, day)
            return d
        except ValueError:
            pass

    # Day name -> next occurrence
    m = _DATE_PATTERNS[2].search(question)
    if m:
        target_weekday = DAY_MAP.get(m.group(1).lower())
        if target_weekday is not None:
            today = now.date()
            days_ahead = (target_weekday - today.weekday()) % 7
            if days_ahead == 0:
                days_ahead = 7  # assume next week if it says "Saturday" on Saturday
            return today + timedelta(days=days_ahead)

    return None


def _extract_city(question: str) -> Optional[str]:
    """Extract city slug from market question text."""
    lower = question.lower()
    for alias, slug in CITY_ALIASES.items():
        if alias in lower:
            return slug
    return None


def _extract_threshold(question: str) -> Optional[tuple[str, float]]:
    """
    Extract temperature threshold and direction from question.
    Returns ("above", 72.0) or ("below", 32.0) or None.
    """
    m = _THRESHOLD_RE.search(question)
    if m:
        return ("above", float(m.group(1)))
    m = _BELOW_THRESHOLD_RE.search(question)
    if m:
        return ("below", float(m.group(1)))
    return None


# ---------------------------------------------------------------------------
# Polymarket weather market representation
# ---------------------------------------------------------------------------

@dataclass
class WeatherMarket:
    """Parsed Polymarket weather/temperature market."""
    market_id: str
    condition_id: str
    question: str
    city: Optional[str]
    threshold_direction: Optional[str]   # "above" or "below"
    threshold_temp_f: Optional[float]
    target_date: Optional[date]
    yes_price: float
    no_price: float
    token_id_yes: str
    token_id_no: str
    volume_24h: float = 0.0
    active: bool = True

    @classmethod
    def from_gamma_market(cls, market: dict) -> Optional[WeatherMarket]:
        """Parse a market from the Gamma Markets API response."""
        question = market.get("question", "")
        city = _extract_city(question)
        threshold = _extract_threshold(question)
        target_date = _parse_target_date(question)

        tokens = market.get("tokens", [])
        if len(tokens) < 2:
            return None

        yes_token = next((t for t in tokens if t.get("outcome", "").upper() == "YES"), None)
        no_token = next((t for t in tokens if t.get("outcome", "").upper() == "NO"), None)
        if not yes_token or not no_token:
            return None

        yes_price = float(yes_token.get("price", 0))
        no_price = float(no_token.get("price", 0))

        return cls(
            market_id=market.get("id", market.get("condition_id", "")),
            condition_id=market.get("condition_id", ""),
            question=question,
            city=city,
            threshold_direction=threshold[0] if threshold else None,
            threshold_temp_f=threshold[1] if threshold else None,
            target_date=target_date,
            yes_price=yes_price,
            no_price=no_price,
            token_id_yes=yes_token.get("token_id", ""),
            token_id_no=no_token.get("token_id", ""),
            volume_24h=float(market.get("volume", 0)),
            active=market.get("active", True),
        )


# ---------------------------------------------------------------------------
# Weather Arb Strategy
# ---------------------------------------------------------------------------

class WeatherArbStrategy:
    """
    Core weather arbitrage strategy.

    Compares NOAA forecast confidence against Polymarket weather market
    prices and generates trade signals when:
      1. NOAA is highly confident (>= 85 %) in a temperature outcome
      2. The market is pricing that outcome cheaply (<= 15 cents)
      3. Expected value is positive
    """

    # Entry thresholds
    MIN_NOAA_CONFIDENCE: float = 0.85
    MAX_ENTRY_PRICE: float = 0.15

    # Exit thresholds
    EXIT_PRICE_TARGET: float = 0.45      # 3x on a 15c entry
    EXIT_CONFIDENCE_FLOOR: float = 0.70

    def __init__(self, position_manager: PositionManager):
        self.pm = position_manager
        self._recent_signals: list[TradeSignal] = []

    @property
    def recent_signals(self) -> list[TradeSignal]:
        return self._recent_signals[-50:]  # keep last 50

    # ------------------------------------------------------------------ #
    #  Opportunity scanning                                               #
    # ------------------------------------------------------------------ #

    def scan_opportunities(
        self,
        city_forecasts: dict[str, CityForecast],
        weather_markets: list[WeatherMarket],
    ) -> list[TradeSignal]:
        """
        Match NOAA forecasts to Polymarket weather markets and
        generate trade signals for mispriced markets.
        """
        signals: list[TradeSignal] = []

        for market in weather_markets:
            if not market.active:
                continue
            if market.city is None or market.threshold_temp_f is None:
                continue
            if market.target_date is None:
                continue

            forecast = city_forecasts.get(market.city)
            if forecast is None or forecast.error:
                continue

            signal = self._evaluate_market(market, forecast)
            if signal is not None:
                signals.append(signal)

        # Sort by expected value descending
        signals.sort(key=lambda s: s.expected_value, reverse=True)
        self._recent_signals.extend(signals)
        logger.info("Weather arb scan found %d signals", len(signals))
        return signals

    def _evaluate_market(
        self, market: WeatherMarket, forecast: CityForecast
    ) -> Optional[TradeSignal]:
        """Evaluate a single market against NOAA forecast data."""
        target_date = market.target_date
        if target_date is None:
            return None

        high_temp = forecast.high_for_date(target_date)
        if high_temp is None:
            return None

        confidence = forecast.confidence_for_date(target_date)
        threshold = market.threshold_temp_f
        direction = market.threshold_direction

        # Determine NOAA-implied probability for the YES outcome
        if direction == "above":
            # Market asks: "Will high be above X?"
            # If forecast high is well above threshold -> high confidence YES
            temp_margin = high_temp - threshold
            if temp_margin > 6:
                noaa_prob_yes = min(confidence, 0.98)
            elif temp_margin > 3:
                noaa_prob_yes = confidence * 0.95
            elif temp_margin > 0:
                noaa_prob_yes = confidence * 0.80
            elif temp_margin > -2:
                noaa_prob_yes = confidence * 0.50
            else:
                noaa_prob_yes = confidence * 0.20
        elif direction == "below":
            temp_margin = threshold - high_temp
            if temp_margin > 6:
                noaa_prob_yes = min(confidence, 0.98)
            elif temp_margin > 3:
                noaa_prob_yes = confidence * 0.95
            elif temp_margin > 0:
                noaa_prob_yes = confidence * 0.80
            elif temp_margin > -2:
                noaa_prob_yes = confidence * 0.50
            else:
                noaa_prob_yes = confidence * 0.20
        else:
            return None

        # --- Check BUY YES opportunity ---
        # We buy YES if NOAA says high prob and market is cheap
        signal = self._check_buy_yes(market, forecast, noaa_prob_yes, high_temp, target_date)
        if signal:
            return signal

        # --- Check BUY NO opportunity (inverse) ---
        noaa_prob_no = 1.0 - noaa_prob_yes
        signal = self._check_buy_no(market, forecast, noaa_prob_no, high_temp, target_date)
        if signal:
            return signal

        return None

    def _check_buy_yes(
        self,
        market: WeatherMarket,
        forecast: CityForecast,
        noaa_prob_yes: float,
        high_temp: float,
        target_date: date,
    ) -> Optional[TradeSignal]:
        """Check if buying YES is profitable."""
        price = market.yes_price
        if price <= 0 or price > self.MAX_ENTRY_PRICE:
            return None
        if noaa_prob_yes < self.MIN_NOAA_CONFIDENCE:
            return None

        # Expected value: EV = (prob * payout) - ((1-prob) * stake)
        # For a $1 binary: payout on win = (1 - price), loss on lose = price
        ev = (noaa_prob_yes * (1.0 - price)) - ((1.0 - noaa_prob_yes) * price)
        if ev <= 0:
            return None

        payout_ratio = (1.0 - price) / price
        kelly_size = self.pm.kelly_size_for_market(noaa_prob_yes, price)
        if kelly_size <= 0:
            return None

        strength = "strong" if noaa_prob_yes >= 0.92 and price <= 0.10 else "moderate"
        bucket_desc = f"{'above' if market.threshold_direction == 'above' else 'below'} {market.threshold_temp_f:.0f}°F"

        return TradeSignal(
            city=market.city or "",
            market_id=market.market_id,
            token_id=market.token_id_yes,
            condition_id=market.condition_id,
            market_question=market.question,
            side="BUY",
            outcome="YES",
            market_price=price,
            noaa_confidence=noaa_prob_yes,
            forecast_temp_f=high_temp,
            target_date=str(target_date),
            bucket_description=bucket_desc,
            expected_value=ev,
            kelly_size_usd=kelly_size,
            payout_ratio=payout_ratio,
            signal_strength=strength,
        )

    def _check_buy_no(
        self,
        market: WeatherMarket,
        forecast: CityForecast,
        noaa_prob_no: float,
        high_temp: float,
        target_date: date,
    ) -> Optional[TradeSignal]:
        """Check if buying NO is profitable."""
        price = market.no_price
        if price <= 0 or price > self.MAX_ENTRY_PRICE:
            return None
        if noaa_prob_no < self.MIN_NOAA_CONFIDENCE:
            return None

        ev = (noaa_prob_no * (1.0 - price)) - ((1.0 - noaa_prob_no) * price)
        if ev <= 0:
            return None

        payout_ratio = (1.0 - price) / price
        kelly_size = self.pm.kelly_size_for_market(noaa_prob_no, price)
        if kelly_size <= 0:
            return None

        strength = "strong" if noaa_prob_no >= 0.92 and price <= 0.10 else "moderate"
        inv_dir = "below" if market.threshold_direction == "above" else "above"
        bucket_desc = f"{inv_dir} {market.threshold_temp_f:.0f}°F"

        return TradeSignal(
            city=market.city or "",
            market_id=market.market_id,
            token_id=market.token_id_no,
            condition_id=market.condition_id,
            market_question=market.question,
            side="BUY",
            outcome="NO",
            market_price=price,
            noaa_confidence=noaa_prob_no,
            forecast_temp_f=high_temp,
            target_date=str(target_date),
            bucket_description=bucket_desc,
            expected_value=ev,
            kelly_size_usd=kelly_size,
            payout_ratio=payout_ratio,
            signal_strength=strength,
        )

    # ------------------------------------------------------------------ #
    #  Exit checking                                                      #
    # ------------------------------------------------------------------ #

    def check_exits(
        self,
        positions: list[Position],
        city_forecasts: dict[str, CityForecast],
        current_prices: dict[str, float],   # token_id -> current price
    ) -> list[tuple[Position, str]]:
        """
        Check open positions for exit conditions.
        Returns list of (position, reason) to close.
        """
        exits: list[tuple[Position, str]] = []

        for pos in positions:
            if not pos.is_open:
                continue

            current_price = current_prices.get(pos.token_id)
            if current_price is None:
                continue

            # Exit 1: profit target
            if current_price >= self.EXIT_PRICE_TARGET:
                exits.append((pos, f"Profit target hit: ${current_price:.2f} >= ${self.EXIT_PRICE_TARGET:.2f}"))
                continue

            # Exit 2: confidence drop
            forecast = city_forecasts.get(pos.city)
            if forecast:
                try:
                    target_date = date.fromisoformat(pos.target_date)
                    new_confidence = forecast.confidence_for_date(target_date)
                    if 0 < new_confidence < self.EXIT_CONFIDENCE_FLOOR:
                        exits.append((
                            pos,
                            f"Confidence dropped: {new_confidence:.2%} < {self.EXIT_CONFIDENCE_FLOOR:.2%}",
                        ))
                        continue
                except ValueError:
                    pass

            # Exit 3: market expired (target date has passed)
            try:
                target = date.fromisoformat(pos.target_date)
                if target < datetime.now(timezone.utc).date():
                    exits.append((pos, f"Market expired: target date {pos.target_date} has passed"))
                    continue
            except ValueError:
                pass

        if exits:
            logger.info("Found %d positions to exit", len(exits))
        return exits

    # ------------------------------------------------------------------ #
    #  Signal execution                                                   #
    # ------------------------------------------------------------------ #

    def execute_signals(
        self,
        signals: list[TradeSignal],
        execute_fn,
    ) -> list[TradeSignal]:
        """
        Execute a list of trade signals using the provided execution function.

        execute_fn(signal: TradeSignal) -> Optional[str]
            Should return an order_id on success, None on failure.
        """
        executed: list[TradeSignal] = []

        for signal in signals:
            # Pre-flight check
            allowed, reason = self.pm.can_open_position(signal.kelly_size_usd)
            if not allowed:
                logger.info("Skipping signal %s: %s", signal.id[:8], reason)
                signal.execution_error = reason
                continue

            try:
                order_id = execute_fn(signal)
                if order_id:
                    signal.executed = True
                    # Register position
                    pos = Position(
                        id=signal.id,
                        market_id=signal.market_id,
                        token_id=signal.token_id,
                        city=signal.city,
                        target_date=signal.target_date,
                        side=signal.side,
                        outcome=signal.outcome,
                        entry_price=signal.market_price,
                        size_usd=signal.kelly_size_usd,
                        shares=signal.kelly_size_usd / signal.market_price,
                        noaa_confidence=signal.noaa_confidence,
                        forecast_temp_f=signal.forecast_temp_f,
                        bucket_description=signal.bucket_description,
                        order_id=order_id,
                    )
                    self.pm.open_position(pos)
                    executed.append(signal)
                else:
                    signal.execution_error = "execute_fn returned None"
            except Exception as exc:
                signal.execution_error = str(exc)
                logger.error("Failed to execute signal %s: %s", signal.id[:8], exc)

        logger.info("Executed %d/%d signals", len(executed), len(signals))
        return executed

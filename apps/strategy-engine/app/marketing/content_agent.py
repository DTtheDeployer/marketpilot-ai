"""
MarketPilot AI — Content Generation Agent
==========================================
Gathers bot performance data and market opportunities, generates
tweet options via Claude API, and sends them to Telegram for approval.
"""

from __future__ import annotations

import logging
import os
import re
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

import httpx
from anthropic import AsyncAnthropic

from app.marketing.prompts import (
    CONTENT_SYSTEM_PROMPT,
    CONTENT_TYPES,
    BOT_PERFORMANCE_TEMPLATE,
    MARKET_OPPORTUNITIES_TEMPLATE,
    SINGLE_OPPORTUNITY_TEMPLATE,
    GENERATE_TWEETS_PROMPT,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class GeneratedTweet:
    """A single generated tweet option."""
    id: str = field(default_factory=lambda: uuid.uuid4().hex[:12])
    content: str = ""
    content_type: str = "COMMENTARY"
    generated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "pending"  # pending | approved | posted | skipped
    draft_id: Optional[str] = None  # Typefully draft ID once posted

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "content": self.content,
            "content_type": self.content_type,
            "generated_at": self.generated_at.isoformat(),
            "status": self.status,
            "draft_id": self.draft_id,
            "char_count": len(self.content),
        }


# ---------------------------------------------------------------------------
# Content Agent
# ---------------------------------------------------------------------------

class ContentAgent:
    """
    Generates daily marketing content using Claude API.

    Workflow:
      1. Gather bot performance data
      2. Find interesting / mispriced markets
      3. Generate 3-5 tweet options via Claude
      4. Send to Telegram for human approval
      5. Post approved tweets via Typefully
    """

    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY", "")
        if not api_key:
            logger.warning("ANTHROPIC_API_KEY not set — content generation will fail")

        self._client = AsyncAnthropic(api_key=api_key) if api_key else None
        self._http_client: Optional[httpx.AsyncClient] = None
        self._generated: list[GeneratedTweet] = []
        self._model = os.getenv("CONTENT_MODEL", "claude-sonnet-4-20250514")

    async def _get_http_client(self) -> httpx.AsyncClient:
        if self._http_client is None or self._http_client.is_closed:
            self._http_client = httpx.AsyncClient(
                timeout=httpx.Timeout(30.0),
                follow_redirects=True,
            )
        return self._http_client

    # ------------------------------------------------------------------ #
    #  Data gathering                                                     #
    # ------------------------------------------------------------------ #

    async def get_bot_performance(self) -> dict:
        """
        Pull bot performance stats. Tries our own API first, falls
        back to mock data for development.
        """
        try:
            client = await self._get_http_client()
            base_url = os.getenv("STRATEGY_ENGINE_URL", "http://localhost:8000")
            resp = await client.get(f"{base_url}/weather-arb/positions")
            if resp.status_code == 200:
                data = resp.json()
                summary = data.get("summary", {})
                closed = data.get("closed", [])

                pnls = [t.get("pnl", 0) for t in closed]
                wins = sum(1 for p in pnls if p > 0)
                total = len(closed)

                return {
                    "total_trades": total,
                    "win_rate": wins / total if total > 0 else 0.0,
                    "total_pnl": summary.get("total_pnl", 0.0),
                    "bankroll": summary.get("bankroll", 100.0),
                    "open_positions": summary.get("open_positions", 0),
                    "total_deployed": summary.get("total_deployed", 0.0),
                    "avg_trade_size": (
                        sum(t.get("size_usd", 0) for t in closed) / total
                        if total > 0 else 0.0
                    ),
                    "best_trade": max(pnls) if pnls else 0.0,
                    "worst_trade": min(pnls) if pnls else 0.0,
                    "days_running": summary.get("days_running", 1),
                }
        except Exception as exc:
            logger.warning("Could not fetch live performance data: %s", exc)

        # Mock data for development / pre-launch
        logger.info("Using mock performance data for content generation")
        return {
            "total_trades": 47,
            "win_rate": 0.72,
            "total_pnl": 38.40,
            "bankroll": 100.0,
            "open_positions": 3,
            "total_deployed": 14.20,
            "avg_trade_size": 3.50,
            "best_trade": 8.20,
            "worst_trade": -2.10,
            "days_running": 14,
        }

    async def get_interesting_markets(self) -> list[dict]:
        """
        Find mispriced weather markets by comparing NOAA data
        to Polymarket prices. Returns a list of opportunity dicts.
        """
        opportunities = []

        try:
            from app.data.noaa_client import NOAAClient, CITIES
            from app.strategies.weather.arb import WeatherArbStrategy, WeatherMarket

            noaa = NOAAClient()
            try:
                forecasts = await noaa.scan_all_cities()

                # Fetch markets from Gamma API
                client = await self._get_http_client()
                markets: list[WeatherMarket] = []
                gamma_url = "https://gamma-api.polymarket.com"

                for tag in ("weather", "temperature"):
                    resp = await client.get(
                        f"{gamma_url}/markets",
                        params={"tag": tag, "active": "true", "closed": "false", "limit": "50"},
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        if not isinstance(data, list):
                            data = data.get("data", data.get("markets", []))
                        for raw in data:
                            parsed = WeatherMarket.from_gamma_market(raw)
                            if parsed and parsed.city:
                                markets.append(parsed)

                # Find mispriced ones
                for market in markets:
                    city_slug = market.city
                    if city_slug not in forecasts or forecasts[city_slug].error:
                        continue

                    forecast = forecasts[city_slug]
                    if market.target_date:
                        high = forecast.high_for_date(market.target_date)
                        confidence = forecast.confidence_for_date(market.target_date)
                    else:
                        high = forecast.high_today
                        confidence = 0.90

                    if high is None or confidence < 0.7:
                        continue

                    market_price = market.yes_price or 0.5
                    if market_price <= 0 or confidence <= market_price:
                        continue

                    ev_ratio = confidence / market_price
                    if ev_ratio >= 2.0:
                        opportunities.append({
                            "city": market.city_name or city_slug,
                            "market_question": market.question or "temperature market",
                            "market_price": market_price,
                            "noaa_confidence": confidence,
                            "ev_ratio": ev_ratio,
                            "forecast_temp": high,
                        })
            finally:
                await noaa.close()

        except Exception as exc:
            logger.warning("Could not fetch live market opportunities: %s", exc)

        if not opportunities:
            # Mock data for development / when no live markets available
            logger.info("Using mock market opportunity data for content generation")
            opportunities = [
                {
                    "city": "New York City",
                    "market_question": "Will NYC high temp be above 62F on Thursday?",
                    "market_price": 0.11,
                    "noaa_confidence": 0.94,
                    "ev_ratio": 8.5,
                    "forecast_temp": 67,
                },
                {
                    "city": "Miami",
                    "market_question": "Will Miami high temp be above 84F on Friday?",
                    "market_price": 0.22,
                    "noaa_confidence": 0.88,
                    "ev_ratio": 4.0,
                    "forecast_temp": 87,
                },
            ]

        # Sort by EV ratio descending, return top 5
        opportunities.sort(key=lambda x: x["ev_ratio"], reverse=True)
        return opportunities[:5]

    # ------------------------------------------------------------------ #
    #  Tweet generation via Claude                                        #
    # ------------------------------------------------------------------ #

    async def generate_tweets(self, count: int = 4) -> list[GeneratedTweet]:
        """
        Generate tweet options using Claude API.
        Returns a list of GeneratedTweet objects.
        """
        if not self._client:
            logger.error("Cannot generate tweets — ANTHROPIC_API_KEY not set")
            return []

        # Gather data
        perf_data = await self.get_bot_performance()
        market_opps = await self.get_interesting_markets()

        # Build the performance section
        performance_section = BOT_PERFORMANCE_TEMPLATE.format(**perf_data)

        # Build the market opportunities section
        if market_opps:
            opp_text = ""
            for opp in market_opps:
                opp_text += SINGLE_OPPORTUNITY_TEMPLATE.format(**opp)
            market_section = MARKET_OPPORTUNITIES_TEMPLATE.format(opportunities=opp_text)
        else:
            market_section = "(No live market opportunities available right now.)"

        # Decide content type mix
        content_types = "PROOF, EDUCATION, BUILD_LOG, COMMENTARY"

        prompt = GENERATE_TWEETS_PROMPT.format(
            count=count,
            content_types=content_types,
            performance_data=performance_section,
            market_data=market_section,
        )

        try:
            response = await self._client.messages.create(
                model=self._model,
                max_tokens=2048,
                system=CONTENT_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}],
            )

            response_text = response.content[0].text
            tweets = self.parse_tweets(response_text)
            self._generated.extend(tweets)

            logger.info("Generated %d tweets via Claude API", len(tweets))
            return tweets

        except Exception as exc:
            logger.error("Claude API call failed: %s", exc)
            return []

    def parse_tweets(self, response_text: str) -> list[GeneratedTweet]:
        """Parse Claude's response into individual GeneratedTweet objects."""
        tweets: list[GeneratedTweet] = []

        # Pattern: TWEET N [TYPE: SOMETHING]\n<content>
        pattern = r"TWEET\s+\d+\s*\[TYPE:\s*(\w+)\]\s*\n(.*?)(?=TWEET\s+\d+\s*\[TYPE:|\Z)"
        matches = re.findall(pattern, response_text, re.DOTALL)

        for content_type, content in matches:
            content = content.strip()
            if not content:
                continue

            # Validate content type
            ct = content_type.upper()
            if ct not in CONTENT_TYPES:
                ct = "COMMENTARY"

            # Truncate if over 280 characters
            if len(content) > 280:
                logger.warning(
                    "Tweet exceeded 280 chars (%d), truncating: %s...",
                    len(content), content[:80],
                )
                content = content[:277] + "..."

            tweets.append(GeneratedTweet(
                content=content,
                content_type=ct,
            ))

        if not tweets:
            # Fallback: try splitting by double newlines
            logger.warning("Regex parsing found no tweets, trying fallback split")
            blocks = [b.strip() for b in response_text.split("\n\n") if b.strip()]
            for block in blocks:
                if len(block) > 20 and len(block) <= 300:
                    tweets.append(GeneratedTweet(
                        content=block[:280],
                        content_type="COMMENTARY",
                    ))
                if len(tweets) >= 5:
                    break

        return tweets

    # ------------------------------------------------------------------ #
    #  Daily workflow                                                      #
    # ------------------------------------------------------------------ #

    async def run_daily(self) -> list[GeneratedTweet]:
        """
        Full daily content workflow:
          1. Generate 3-5 tweet options
          2. Send to Telegram for approval
          3. Return generated tweets
        """
        logger.info("Starting daily content generation")

        tweets = await self.generate_tweets(count=4)
        if not tweets:
            logger.warning("No tweets generated — skipping Telegram approval")
            return []

        # Send to Telegram for approval
        try:
            from app.marketing.telegram_approvals import TelegramApprovalBot
            approval_bot = TelegramApprovalBot()

            if approval_bot.enabled:
                for tweet in tweets:
                    await approval_bot.send_approval_request(
                        tweet_id=tweet.id,
                        content=tweet.content,
                        content_type=tweet.content_type,
                    )
                logger.info("Sent %d tweets to Telegram for approval", len(tweets))
            else:
                logger.info(
                    "Telegram approvals not configured — tweets generated but not sent for review"
                )
        except Exception as exc:
            logger.error("Failed to send tweets to Telegram: %s", exc)

        return tweets

    # ------------------------------------------------------------------ #
    #  State access                                                       #
    # ------------------------------------------------------------------ #

    @property
    def recent_tweets(self) -> list[GeneratedTweet]:
        """Return the most recent 50 generated tweets."""
        return self._generated[-50:]

    def get_tweet_by_id(self, tweet_id: str) -> Optional[GeneratedTweet]:
        """Look up a generated tweet by ID."""
        for tweet in self._generated:
            if tweet.id == tweet_id:
                return tweet
        return None

    def mark_tweet_status(self, tweet_id: str, status: str) -> bool:
        """Update the status of a generated tweet."""
        tweet = self.get_tweet_by_id(tweet_id)
        if tweet:
            tweet.status = status
            return True
        return False

    async def close(self) -> None:
        """Clean up HTTP clients."""
        if self._http_client and not self._http_client.is_closed:
            await self._http_client.aclose()

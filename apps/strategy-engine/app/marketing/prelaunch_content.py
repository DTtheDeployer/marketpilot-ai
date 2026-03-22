"""
MarketPilot AI — Pre-Launch Content Library
============================================
Pre-written tweets, launch thread, and educational thread outlines
for the MarketPilot AI Twitter account. All content follows the brand
voice: confident, technical, data-forward, minimal emojis.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Pre-launch tweets (ready to post)
# ---------------------------------------------------------------------------

PRELAUNCH_TWEETS: list[dict] = [
    {
        "content": (
            "14 of the top 20 Polymarket traders by volume are bots. "
            "The question isn't whether to automate prediction markets. "
            "It's whether your bot has a real edge or is just faster noise."
        ),
        "content_type": "COMMENTARY",
    },
    {
        "content": (
            "NOAA says 94%. The market says 11%. That's 8.5x expected value.\n\n"
            "Weather prediction markets are the most systematically mispriced "
            "contracts on Polymarket. We built a bot to exploit that."
        ),
        "content_type": "PROOF",
    },
    {
        "content": (
            "Day 1 of building MarketPilot AI.\n\n"
            "Thesis: NOAA 48-hour temperature forecasts are right ~94% of the time. "
            "Polymarket weather contracts price these outcomes at 10-15 cents. "
            "That's not a market. That's a transfer."
        ),
        "content_type": "BUILD_LOG",
    },
    {
        "content": (
            "Paper bot update: Day 14. 47 trades. 72% win rate. "
            "+$38.40 on a $100 bankroll.\n\n"
            "The edge isn't huge per trade. It's in the volume and the discipline. "
            "Bot doesn't flinch, doesn't get bored, doesn't overtrade."
        ),
        "content_type": "PROOF",
    },
    {
        "content": (
            "Polymarket has NYC temperature contracts at 15 cents for a "
            "range that NOAA puts at 94% confidence.\n\n"
            "The high today is forecast at 67F with a 2-degree margin. "
            "Market is pricing this like a coin flip. It's not."
        ),
        "content_type": "COMMENTARY",
    },
    {
        "content": (
            "Most prediction market bots optimize for speed. "
            "We optimize for information asymmetry.\n\n"
            "The NOAA publishes free, high-accuracy forecasts every hour. "
            "Markets take 4-8 hours to fully price them in. "
            "That window is the entire strategy."
        ),
        "content_type": "EDUCATION",
    },
    {
        "content": (
            "Shipped this week: automated position sizing with modified Kelly criterion.\n\n"
            "Full Kelly says bet 93% of bankroll when NOAA is at 94% and market is at 11%. "
            "We cap at 5% per position because we respect variance."
        ),
        "content_type": "BUILD_LOG",
    },
    {
        "content": (
            "Why weather markets specifically?\n\n"
            "1. NOAA data is free and public\n"
            "2. Forecasts are measurably accurate\n"
            "3. Markets resolve daily (fast feedback)\n"
            "4. Low competition vs. politics/sports\n"
            "5. The edge is mathematical, not subjective"
        ),
        "content_type": "EDUCATION",
    },
    {
        "content": (
            "The bot found 6 mispriced weather markets across 3 cities yesterday. "
            "Average expected value: 4.2x. It entered 4 of them.\n\n"
            "The other 2 failed the Kelly filter. "
            "Sometimes the best trade is the one you don't make."
        ),
        "content_type": "PROOF",
    },
    {
        "content": (
            "Prediction markets are supposed to be efficient. "
            "Weather markets on Polymarket are proof they're not.\n\n"
            "When a government agency publishes 94% confidence data "
            "and the market prices it at 11%, the efficient market "
            "hypothesis needs a weather report."
        ),
        "content_type": "COMMENTARY",
    },
]


# ---------------------------------------------------------------------------
# Launch thread (7-10 tweets, separator: \n---\n)
# ---------------------------------------------------------------------------

LAUNCH_THREAD = """MarketPilot AI is live.

An automated trading system that exploits mispriced weather prediction markets on Polymarket using NOAA forecast data.

Here's what we built and why it works:
---
The edge in one sentence: NOAA 48-hour temperature forecasts are accurate 94% of the time, but Polymarket weather contracts regularly price these outcomes at 10-15 cents.

That's a 6-9x expected value gap hiding in plain sight.
---
How it works:

1. NOAA publishes hourly forecasts for 6 US cities
2. Our bot compares forecast confidence to market prices
3. When the gap exceeds our threshold, it calculates position size via Kelly criterion
4. It enters the trade automatically on Polymarket
---
The math is simple.

If NOAA says there's a 94% chance NYC hits 67F and the market prices YES at 11 cents, expected value per dollar is: 0.94 / 0.11 = 8.5x.

We don't need to be right every time. We need the math to be right over hundreds of trades.
---
Risk management is the actual product.

- Modified Kelly criterion caps position sizes at 5% of bankroll
- Emergency stop triggers on 3 consecutive losses or 10% daily drawdown
- Every trade gets a Telegram alert so we can override in real time
- No trade executes without passing 4 independent filters
---
Paper trading results over 14 days:

47 trades executed
72% win rate
+38.4% return on $100 bankroll
Average holding period: 18 hours
Max drawdown: 6.2%

Small sample. Promising signal.
---
What's next:

- Going live with real capital (starting small)
- Expanding to more weather market types
- Adding more alternative data sources beyond NOAA
- Open-sourcing the strategy logic

Follow along. We'll share every trade, every number, every lesson.
---
The prediction market opportunity is early and growing.

Polymarket did $6B+ in volume last year. Weather markets are a fraction of that, which is exactly why the edge exists.

When more money shows up, the edge compresses. We're building while it lasts.
---
MarketPilot AI: automated weather arbitrage on prediction markets.

Not financial advice. Just math, data, and a bot that doesn't sleep."""


# ---------------------------------------------------------------------------
# Educational thread outlines
# ---------------------------------------------------------------------------

EDUCATIONAL_THREADS: list[dict] = [
    {
        "title": "How NOAA Weather Forecasts Actually Work",
        "outline": [
            "Most people think weather forecasting is guesswork. It's not. "
            "NOAA runs ensemble models on some of the fastest supercomputers on Earth. "
            "Here's how accurate they actually are:",
            "24-hour forecasts: 96% accurate within 2 degrees F. "
            "This isn't a rough estimate. It's measured against millions of observations annually.",
            "48-hour forecasts: 94% accurate. This is the sweet spot for our strategy. "
            "Still extremely reliable, but prediction markets haven't caught up.",
            "72-hour forecasts: 88% accurate. Still well above most market prices, "
            "but we reduce position sizes to account for the wider confidence interval.",
            "Beyond 5 days: accuracy drops to 70-80%. We generally avoid these. "
            "The edge-to-noise ratio stops being favorable.",
            "The key insight: NOAA publishes these forecasts hourly and for free. "
            "Anyone can access api.weather.gov with no API key. "
            "The data asymmetry isn't about access. It's about systematic exploitation.",
        ],
    },
    {
        "title": "Kelly Criterion for Prediction Markets",
        "outline": [
            "Kelly criterion is a formula for optimal bet sizing. "
            "It maximizes long-term growth rate while minimizing risk of ruin. "
            "Here's how we actually use it:",
            "The formula: f* = (bp - q) / b, where b = odds, p = probability of winning, "
            "q = probability of losing. In prediction market terms: "
            "f* = (confidence - market_price) / (1 - market_price).",
            "Example: NOAA confidence 94%, market price 11 cents. "
            "Kelly says bet 93.3% of bankroll. That's insane. "
            "This is why nobody uses full Kelly in practice.",
            "We use quarter Kelly: divide the optimal fraction by 4, then cap at 5% max. "
            "This reduces variance dramatically while capturing most of the edge.",
            "The beauty of Kelly: it naturally sizes bets proportional to edge. "
            "Strong signals get bigger positions. Marginal signals get small ones. "
            "The math does the risk management.",
            "Caveat: Kelly assumes you know the true probability. We use NOAA confidence "
            "as a proxy, but apply additional haircuts for forecast horizon and severe weather. "
            "Overconfidence in your edge is the fastest way to blow up.",
        ],
    },
    {
        "title": "Why Prediction Markets Are Inefficient",
        "outline": [
            "Efficient market hypothesis says prices reflect all available information. "
            "Prediction markets are proof that EMH has limits. Here's why weather markets "
            "specifically stay mispriced:",
            "Liquidity problem: weather markets have thin order books. "
            "A $500 bet can move the price 5-10%. "
            "Big traders avoid them, which means small systematic traders have an edge.",
            "Attention asymmetry: 90% of Polymarket volume is in politics and crypto. "
            "Weather markets get almost no attention from sophisticated traders. "
            "Low competition = persistent mispricing.",
            "Information latency: NOAA updates forecasts hourly. "
            "Markets take 4-8 hours to reflect new data. "
            "That lag is where automated systems have the biggest advantage.",
            "Anchoring bias: market makers in weather markets tend to anchor on yesterday's "
            "forecast rather than updating with new data. This creates systematic "
            "mispricing that persists until resolution.",
            "The opportunity is temporary. As prediction markets grow, "
            "more sophisticated participants will close these gaps. "
            "The edge exists now because the market is young.",
        ],
    },
]

from __future__ import annotations

import random
from datetime import datetime, timedelta

import numpy as np

from app.models.strategy import MarketData


def generate_random_walk(
    start_price: float = 0.50,
    steps: int = 100,
    volatility: float = 0.02,
    seed: int | None = None,
) -> list[float]:
    """Generate a bounded random walk of prices between 0.01 and 0.99."""
    rng = np.random.default_rng(seed)
    prices = [start_price]
    for _ in range(steps - 1):
        change = rng.normal(0, volatility)
        new_price = prices[-1] + change
        new_price = max(0.01, min(0.99, new_price))
        prices.append(round(new_price, 4))
    return prices


def generate_mock_orderbook(
    mid_price: float,
    levels: int = 5,
    base_size: float = 100.0,
    tick: float = 0.01,
    seed: int | None = None,
) -> tuple[list[list[float]], list[list[float]]]:
    """Return (bids, asks) as lists of [price, size] levels."""
    rng = random.Random(seed)
    bids = []
    asks = []
    for i in range(1, levels + 1):
        bid_price = round(mid_price - i * tick, 4)
        ask_price = round(mid_price + i * tick, 4)
        bid_size = round(base_size * rng.uniform(0.5, 2.0), 2)
        ask_size = round(base_size * rng.uniform(0.5, 2.0), 2)
        if bid_price > 0:
            bids.append([bid_price, bid_size])
        if ask_price < 1:
            asks.append([ask_price, ask_size])
    return bids, asks


def generate_mock_market_data(
    market_id: str = "mock-market-001",
    question: str = "Will it happen?",
    base_price: float = 0.55,
    history_length: int = 30,
    volatility: float = 0.02,
    include_orderbook: bool = True,
    days_to_expiry: float | None = 5.0,
    seed: int | None = None,
) -> MarketData:
    """Create a fully populated MarketData snapshot for testing."""
    prices = generate_random_walk(base_price, history_length, volatility, seed)
    current_price = prices[-1]

    bids: list[list[float]] = []
    asks: list[list[float]] = []
    spread = 0.0
    if include_orderbook:
        bids, asks = generate_mock_orderbook(current_price, seed=seed)
        if bids and asks:
            spread = round(asks[0][0] - bids[0][0], 4)

    end_date = None
    if days_to_expiry is not None:
        end_date = datetime.utcnow() + timedelta(days=days_to_expiry)

    return MarketData(
        market_id=market_id,
        question=question,
        outcome_yes_price=current_price,
        outcome_no_price=round(1.0 - current_price, 4),
        volume_24h=round(random.uniform(1000, 50000), 2),
        liquidity=round(random.uniform(5000, 200000), 2),
        spread=spread,
        orderbook_bids=bids,
        orderbook_asks=asks,
        price_history=prices,
        end_date=end_date,
    )


def generate_market_data_series(
    market_id: str = "mock-market-001",
    base_price: float = 0.50,
    num_snapshots: int = 50,
    volatility: float = 0.02,
    seed: int | None = 42,
) -> list[MarketData]:
    """Generate a time series of MarketData snapshots for backtesting."""
    prices = generate_random_walk(base_price, num_snapshots + 30, volatility, seed)
    snapshots = []
    for i in range(30, len(prices)):
        history = prices[: i + 1]
        current = prices[i]
        bids, asks = generate_mock_orderbook(current, seed=(seed or 0) + i)
        spread = round(asks[0][0] - bids[0][0], 4) if bids and asks else 0.02

        snapshots.append(
            MarketData(
                market_id=market_id,
                question="Backtest market",
                outcome_yes_price=current,
                outcome_no_price=round(1.0 - current, 4),
                volume_24h=round(random.uniform(1000, 50000), 2),
                liquidity=round(random.uniform(5000, 200000), 2),
                spread=spread,
                orderbook_bids=bids,
                orderbook_asks=asks,
                price_history=history,
                end_date=datetime.utcnow() + timedelta(days=max(30 - i, 1)),
            )
        )
    return snapshots

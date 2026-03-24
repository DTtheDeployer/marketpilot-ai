"""
MarketPilot AI — Realistic Fill Simulation Models
==================================================
Composable, stateless functions for simulating realistic order fills
in paper trading mode. Replaces the fixed 50bps slippage with:

- Orderbook walking (partial fills + size-scaled slippage)
- Fill latency simulation
- Dynamic maker/taker fee tiers
- Order queue position estimation
- Liquidity dry-up / rejection scenarios
"""

from __future__ import annotations

import math
import random
from dataclasses import dataclass, field


# ── Fill Result ──────────────────────────────────────────────────────────────


@dataclass
class FillTranche:
    """A single price level consumed during an orderbook walk."""
    price: float
    size: float


@dataclass
class FillResult:
    """Outcome of a simulated fill attempt."""
    filled_size: float
    avg_fill_price: float
    tranches: list[FillTranche] = field(default_factory=list)
    slippage_bps: float = 0.0
    is_partial: bool = False
    rejected: bool = False
    rejection_reason: str | None = None


@dataclass
class QueueEstimate:
    """Estimated queue position for a resting limit order."""
    position_behind: float  # Total size ahead in queue
    estimated_fill_probability: float  # 0-1 per tick
    estimated_wait_ticks: int  # Estimated ticks before fill


# ── Orderbook Walking ────────────────────────────────────────────────────────


def walk_orderbook(
    side: str,
    size: float,
    orderbook_levels: list[list[float]],
    midpoint: float,
    max_fill_pct: float = 0.80,
) -> FillResult:
    """Walk the orderbook and fill proportionally at each level.

    For BUY orders, walk the asks (sorted ascending).
    For SELL orders, walk the bids (sorted descending).

    ``max_fill_pct`` caps how much of each level's displayed liquidity
    we can consume (models hidden orders and refresh rates).

    Returns a FillResult with tranches, VWAP, and slippage vs midpoint.
    """
    if not orderbook_levels or size <= 0:
        return FillResult(
            filled_size=0,
            avg_fill_price=midpoint,
            rejected=True,
            rejection_reason="empty_orderbook",
        )

    # Sort levels appropriately
    if side.upper() == "BUY":
        # Walk asks: cheapest first
        levels = sorted(orderbook_levels, key=lambda x: x[0])
    else:
        # Walk bids: most expensive first
        levels = sorted(orderbook_levels, key=lambda x: x[0], reverse=True)

    remaining = size
    tranches: list[FillTranche] = []
    total_cost = 0.0

    for level in levels:
        if remaining <= 0:
            break

        level_price = level[0]
        level_qty = level[1] if len(level) > 1 else 0.0

        # Cap consumption at max_fill_pct of displayed liquidity
        available = level_qty * max_fill_pct
        fill_at_level = min(remaining, available)

        if fill_at_level <= 0:
            continue

        tranches.append(FillTranche(price=level_price, size=fill_at_level))
        total_cost += level_price * fill_at_level
        remaining -= fill_at_level

    filled_size = size - remaining

    if filled_size <= 0:
        return FillResult(
            filled_size=0,
            avg_fill_price=midpoint,
            rejected=True,
            rejection_reason="insufficient_liquidity",
        )

    avg_price = total_cost / filled_size

    # Compute slippage vs midpoint in basis points
    if midpoint > 0:
        slippage_bps = abs(avg_price - midpoint) / midpoint * 10_000
    else:
        slippage_bps = 0.0

    return FillResult(
        filled_size=round(filled_size, 4),
        avg_fill_price=round(avg_price, 6),
        tranches=tranches,
        slippage_bps=round(slippage_bps, 2),
        is_partial=remaining > 0,
    )


# ── Fill Latency Simulation ──────────────────────────────────────────────────


def simulate_fill_latency(min_ms: int = 200, max_ms: int = 800) -> float:
    """Return a simulated fill latency in milliseconds (no actual sleep).

    Uses a log-normal distribution skewed toward the lower end,
    matching real-world CLOB round-trip patterns.
    """
    # Log-normal gives a right-skewed distribution: most fills are fast,
    # some are slow
    mu = math.log((min_ms + max_ms) / 2)
    sigma = 0.4
    latency = random.lognormvariate(mu, sigma)
    return round(max(min_ms, min(max_ms, latency)), 1)


# ── Dynamic Fee Tiers ────────────────────────────────────────────────────────

# Polymarket-inspired fee schedule (volume-tiered)
FEE_TIERS: list[tuple[float, dict[str, float]]] = [
    (0,         {"maker": 0.0000, "taker": 0.0020}),   # <$100K: 0bp / 20bp
    (100_000,   {"maker": 0.0000, "taker": 0.0015}),   # $100K-$1M: 0bp / 15bp
    (1_000_000, {"maker": -0.0005, "taker": 0.0010}),  # $1M+: -5bp (rebate) / 10bp
]


def compute_fee(
    notional: float,
    cumulative_volume: float,
    is_maker: bool,
) -> float:
    """Compute the fee for a trade based on volume tier.

    Args:
        notional: Trade value (price * size) in USD.
        cumulative_volume: Lifetime traded volume in USD (for tier).
        is_maker: True if limit order adds liquidity (rests on book).

    Returns:
        Fee amount in USD. Can be negative (rebate) for maker at high tiers.
    """
    fee_type = "maker" if is_maker else "taker"

    # Find applicable tier
    rate = FEE_TIERS[0][1][fee_type]
    for threshold, rates in FEE_TIERS:
        if cumulative_volume >= threshold:
            rate = rates[fee_type]

    return round(notional * rate, 6)


# ── Order Queue Position ─────────────────────────────────────────────────────


def estimate_queue_position(
    price: float,
    size: float,
    orderbook_levels: list[list[float]],
    avg_volume_per_tick: float = 500.0,
) -> QueueEstimate:
    """Estimate where a resting limit order sits in the queue.

    For a limit order at ``price``, compute how much size is ahead of
    us at the same price level, and estimate fill probability per tick.

    Args:
        price: Limit order price.
        size: Order size.
        orderbook_levels: The same-side book levels [[price, qty], ...].
        avg_volume_per_tick: Average trade volume per execution tick.
    """
    # Find the matching price level
    position_behind = 0.0
    for level in orderbook_levels:
        level_price = level[0]
        level_qty = level[1] if len(level) > 1 else 0.0

        if abs(level_price - price) < 1e-6:
            # Our order sits behind all existing orders at this level
            position_behind = level_qty
            break

    total_ahead = position_behind + size

    # Fill probability: fraction of volume that reaches our queue position
    if total_ahead > 0 and avg_volume_per_tick > 0:
        fill_prob = min(1.0, avg_volume_per_tick / total_ahead)
    else:
        fill_prob = 1.0

    # Estimated ticks to fill: geometric distribution mean = 1/p
    if fill_prob > 0:
        estimated_ticks = max(1, int(1.0 / fill_prob))
    else:
        estimated_ticks = 999

    return QueueEstimate(
        position_behind=round(position_behind, 2),
        estimated_fill_probability=round(fill_prob, 4),
        estimated_wait_ticks=estimated_ticks,
    )


# ── Liquidity Dry-Up / Rejection ─────────────────────────────────────────────


def should_reject_fill(
    liquidity: float,
    spread: float,
    base_rejection_rate: float = 0.02,
) -> tuple[bool, str | None]:
    """Determine whether an order should be rejected due to poor conditions.

    Simulates real-world scenarios where fills fail due to thin liquidity,
    wide spreads, or other market microstructure effects.

    Returns:
        (rejected: bool, reason: str | None)
    """
    rejection_rate = base_rejection_rate

    # Thin liquidity increases rejection rate
    if liquidity < 5_000:
        rejection_rate += 0.18  # Up to 20% total
    elif liquidity < 20_000:
        rejection_rate += 0.08  # Up to 10% total
    elif liquidity < 50_000:
        rejection_rate += 0.03  # Up to 5% total

    # Wide spread increases rejection rate
    if spread > 0.10:
        rejection_rate += 0.15
    elif spread > 0.05:
        rejection_rate += 0.08
    elif spread > 0.03:
        rejection_rate += 0.02

    # Cap at 40% — markets exist, just difficult
    rejection_rate = min(0.40, rejection_rate)

    if random.random() < rejection_rate:
        # Pick a realistic reason
        if liquidity < 5_000:
            reason = "liquidity_dryup"
        elif spread > 0.05:
            reason = "wide_spread"
        elif liquidity < 20_000:
            reason = "thin_book"
        else:
            reason = "transient_rejection"
        return True, reason

    return False, None


# ── Synthetic Orderbook Generator ────────────────────────────────────────────


def generate_synthetic_orderbook(
    midpoint: float,
    spread: float = 0.02,
    levels: int = 10,
    base_qty: float = 500.0,
    liquidity_factor: float = 1.0,
) -> tuple[list[list[float]], list[list[float]]]:
    """Generate a synthetic orderbook around a midpoint.

    Returns (bids, asks) where each is [[price, qty], ...].
    Useful when real orderbook data is unavailable.
    """
    half_spread = spread / 2
    tick = max(0.001, spread / levels)

    bids: list[list[float]] = []
    asks: list[list[float]] = []

    for i in range(levels):
        # Quantity decreases away from midpoint (realistic depth profile)
        depth_factor = max(0.3, 1.0 - (i * 0.08))
        qty = base_qty * depth_factor * liquidity_factor * (0.7 + random.random() * 0.6)

        bid_price = round(midpoint - half_spread - (i * tick), 4)
        ask_price = round(midpoint + half_spread + (i * tick), 4)

        # Clamp to valid prediction market range
        if bid_price > 0.01:
            bids.append([bid_price, round(qty, 2)])
        if ask_price < 0.99:
            asks.append([ask_price, round(qty, 2)])

    return bids, asks

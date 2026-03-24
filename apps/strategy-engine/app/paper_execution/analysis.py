"""
MarketPilot AI — Deep Trade Analysis
=====================================
Per-trade and aggregate analysis of paper trading execution quality.
Produces actionable feedback for strategy evaluation.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class TradeAnalysisMetrics:
    """Per-trade execution quality analysis."""

    # Execution costs
    slippage_bps: float = 0.0
    slippage_cost_usd: float = 0.0
    spread_cost_usd: float = 0.0
    fee_cost_usd: float = 0.0
    fee_type: str = "taker"
    total_execution_cost_usd: float = 0.0

    # Fill quality
    fill_rate: float = 1.0  # 0-1, portion of requested size filled
    is_partial: bool = False
    tranches_count: int = 1
    vwap: float = 0.0
    worst_fill_price: float = 0.0
    best_fill_price: float = 0.0

    # Latency
    simulated_latency_ms: float = 0.0

    # Realism adjustments
    ideal_pnl: float = 0.0
    realistic_pnl: float = 0.0
    realism_drag_pct: float = 0.0

    # Queue / rejection
    queue_position: float | None = None
    estimated_wait_ticks: int | None = None
    was_rejected: bool = False
    rejection_reason: str | None = None


@dataclass
class AggregateAnalysis:
    """Aggregate analysis across all paper trades for a bot/session."""

    total_trades: int = 0
    total_fills: int = 0
    total_rejections: int = 0
    partial_fill_count: int = 0
    avg_slippage_bps: float = 0.0
    total_slippage_cost: float = 0.0
    total_spread_cost: float = 0.0
    total_fee_cost: float = 0.0
    total_execution_cost: float = 0.0
    maker_fill_pct: float = 0.0
    taker_fill_pct: float = 0.0
    avg_fill_rate: float = 0.0
    avg_latency_ms: float = 0.0
    ideal_total_pnl: float = 0.0
    realistic_total_pnl: float = 0.0
    realism_drag_pct: float = 0.0
    execution_quality_score: float = 0.0  # 0-100
    feedback: list[str] = field(default_factory=list)


def compute_trade_analysis(
    side: str,
    requested_size: float,
    requested_price: float,
    fill_price: float,
    fill_size: float,
    midpoint: float,
    spread: float,
    fee: float,
    fee_type: str,
    slippage_bps: float,
    latency_ms: float,
    tranches_count: int,
    is_partial: bool,
    was_rejected: bool,
    rejection_reason: str | None,
    queue_position: float | None,
    estimated_wait_ticks: int | None,
    pnl: float,
    worst_fill_price: float | None = None,
    best_fill_price: float | None = None,
) -> TradeAnalysisMetrics:
    """Compute per-trade analysis metrics."""

    notional = fill_price * fill_size

    # Slippage cost: difference between midpoint fill and actual fill
    if side.upper() == "BUY":
        slippage_cost = (fill_price - midpoint) * fill_size
    else:
        slippage_cost = (midpoint - fill_price) * fill_size
    slippage_cost = max(0, slippage_cost)  # Only penalise adverse slippage

    # Spread cost: half-spread applied to the trade
    spread_cost = (spread / 2) * fill_size

    total_exec_cost = slippage_cost + spread_cost + abs(fee)

    # Fill rate
    fill_rate = fill_size / requested_size if requested_size > 0 else 0.0

    # Realism adjustment: ideal P&L (no costs) vs realistic P&L (with costs)
    ideal_pnl = pnl + total_exec_cost  # Add back costs to get ideal
    realistic_pnl = pnl

    if abs(ideal_pnl) > 0.001:
        realism_drag = (ideal_pnl - realistic_pnl) / abs(ideal_pnl) * 100
    else:
        realism_drag = 0.0

    return TradeAnalysisMetrics(
        slippage_bps=slippage_bps,
        slippage_cost_usd=round(slippage_cost, 4),
        spread_cost_usd=round(spread_cost, 4),
        fee_cost_usd=round(abs(fee), 4),
        fee_type=fee_type,
        total_execution_cost_usd=round(total_exec_cost, 4),
        fill_rate=round(fill_rate, 4),
        is_partial=is_partial,
        tranches_count=tranches_count,
        vwap=fill_price,
        worst_fill_price=worst_fill_price or fill_price,
        best_fill_price=best_fill_price or fill_price,
        simulated_latency_ms=latency_ms,
        ideal_pnl=round(ideal_pnl, 4),
        realistic_pnl=round(realistic_pnl, 4),
        realism_drag_pct=round(realism_drag, 2),
        queue_position=queue_position,
        estimated_wait_ticks=estimated_wait_ticks,
        was_rejected=was_rejected,
        rejection_reason=rejection_reason,
    )


def compute_aggregate_analysis(
    trades: list[TradeAnalysisMetrics],
) -> AggregateAnalysis:
    """Compute aggregate analysis from a list of per-trade analyses."""

    if not trades:
        return AggregateAnalysis(feedback=["No trades to analyse."])

    total = len(trades)
    fills = [t for t in trades if not t.was_rejected]
    rejections = [t for t in trades if t.was_rejected]
    partials = [t for t in fills if t.is_partial]
    makers = [t for t in fills if t.fee_type == "maker"]
    takers = [t for t in fills if t.fee_type == "taker"]

    avg_slippage = sum(t.slippage_bps for t in fills) / len(fills) if fills else 0.0
    total_slippage_cost = sum(t.slippage_cost_usd for t in fills)
    total_spread_cost = sum(t.spread_cost_usd for t in fills)
    total_fee_cost = sum(t.fee_cost_usd for t in fills)
    total_exec_cost = sum(t.total_execution_cost_usd for t in fills)
    avg_fill_rate = sum(t.fill_rate for t in fills) / len(fills) if fills else 0.0
    avg_latency = sum(t.simulated_latency_ms for t in fills) / len(fills) if fills else 0.0
    ideal_pnl = sum(t.ideal_pnl for t in fills)
    realistic_pnl = sum(t.realistic_pnl for t in fills)

    if abs(ideal_pnl) > 0.001:
        drag = (ideal_pnl - realistic_pnl) / abs(ideal_pnl) * 100
    else:
        drag = 0.0

    # Execution quality score (0-100)
    score = _compute_quality_score(
        avg_slippage_bps=avg_slippage,
        fill_rate=avg_fill_rate,
        rejection_rate=len(rejections) / total if total > 0 else 0.0,
        partial_rate=len(partials) / len(fills) if fills else 0.0,
        avg_latency_ms=avg_latency,
    )

    agg = AggregateAnalysis(
        total_trades=total,
        total_fills=len(fills),
        total_rejections=len(rejections),
        partial_fill_count=len(partials),
        avg_slippage_bps=round(avg_slippage, 2),
        total_slippage_cost=round(total_slippage_cost, 2),
        total_spread_cost=round(total_spread_cost, 2),
        total_fee_cost=round(total_fee_cost, 2),
        total_execution_cost=round(total_exec_cost, 2),
        maker_fill_pct=round(len(makers) / len(fills) * 100, 1) if fills else 0.0,
        taker_fill_pct=round(len(takers) / len(fills) * 100, 1) if fills else 0.0,
        avg_fill_rate=round(avg_fill_rate, 4),
        avg_latency_ms=round(avg_latency, 1),
        ideal_total_pnl=round(ideal_pnl, 2),
        realistic_total_pnl=round(realistic_pnl, 2),
        realism_drag_pct=round(drag, 2),
        execution_quality_score=round(score, 1),
    )

    agg.feedback = generate_feedback(agg)
    return agg


def _compute_quality_score(
    avg_slippage_bps: float,
    fill_rate: float,
    rejection_rate: float,
    partial_rate: float,
    avg_latency_ms: float,
) -> float:
    """Compute a 0-100 execution quality score."""

    score = 100.0

    # Slippage penalty: -2 points per bps above 5
    if avg_slippage_bps > 5:
        score -= (avg_slippage_bps - 5) * 2

    # Fill rate reward: penalise low fill rates
    score -= (1.0 - fill_rate) * 30

    # Rejection penalty: -3 points per 1% rejection rate
    score -= rejection_rate * 300

    # Partial fill penalty: -1 point per 1% partial rate
    score -= partial_rate * 100

    # Latency penalty: -1 point per 100ms above 300ms
    if avg_latency_ms > 300:
        score -= (avg_latency_ms - 300) / 100

    return max(0.0, min(100.0, score))


def generate_feedback(agg: AggregateAnalysis) -> list[str]:
    """Generate human-readable feedback from aggregate analysis."""

    feedback: list[str] = []

    # Slippage
    if agg.avg_slippage_bps > 15:
        feedback.append(
            f"High average slippage of {agg.avg_slippage_bps:.1f}bps is significantly impacting returns. "
            f"Consider using limit orders or reducing order sizes to minimize market impact."
        )
    elif agg.avg_slippage_bps > 8:
        feedback.append(
            f"Average slippage of {agg.avg_slippage_bps:.1f}bps is moderate. "
            f"Switching more orders to maker (limit) could reduce costs."
        )

    # Fill rate
    if agg.avg_fill_rate < 0.80:
        feedback.append(
            f"Only {agg.avg_fill_rate * 100:.0f}% of requested volume is being filled on average. "
            f"Consider targeting more liquid markets or reducing position sizes."
        )

    # Partial fills
    if agg.total_fills > 0:
        partial_pct = agg.partial_fill_count / agg.total_fills * 100
        if partial_pct > 20:
            feedback.append(
                f"{partial_pct:.0f}% of orders resulted in partial fills. "
                f"This indicates order sizes may be too large relative to available liquidity."
            )

    # Rejections
    if agg.total_trades > 0:
        rejection_pct = agg.total_rejections / agg.total_trades * 100
        if rejection_pct > 10:
            feedback.append(
                f"{rejection_pct:.0f}% of orders were rejected due to poor market conditions. "
                f"Consider adding liquidity checks before order submission."
            )

    # Fees
    if agg.taker_fill_pct > 80:
        feedback.append(
            f"{agg.taker_fill_pct:.0f}% of fills are taker orders (market orders). "
            f"Using more limit orders would reduce fee costs by up to 75%."
        )

    # Realism drag
    if agg.realism_drag_pct > 5:
        feedback.append(
            f"Execution costs are dragging returns by {agg.realism_drag_pct:.1f}%. "
            f"Total cost breakdown: slippage ${agg.total_slippage_cost:.2f}, "
            f"spread ${agg.total_spread_cost:.2f}, fees ${agg.total_fee_cost:.2f}."
        )
    elif agg.realism_drag_pct > 2:
        feedback.append(
            f"Realism drag of {agg.realism_drag_pct:.1f}% is within acceptable range. "
            f"Live returns should be within {agg.realism_drag_pct * 1.5:.1f}% of paper results."
        )

    # Overall quality
    if agg.execution_quality_score >= 85:
        feedback.append(
            f"Execution quality score: {agg.execution_quality_score:.0f}/100 — Excellent. "
            f"Strategy is well-suited for live trading conditions."
        )
    elif agg.execution_quality_score >= 65:
        feedback.append(
            f"Execution quality score: {agg.execution_quality_score:.0f}/100 — Good. "
            f"Some optimisation recommended before going live."
        )
    elif agg.execution_quality_score >= 40:
        feedback.append(
            f"Execution quality score: {agg.execution_quality_score:.0f}/100 — Fair. "
            f"Significant execution cost issues should be addressed before live trading."
        )
    else:
        feedback.append(
            f"Execution quality score: {agg.execution_quality_score:.0f}/100 — Poor. "
            f"Strategy execution needs fundamental changes before considering live trading."
        )

    # P&L comparison
    if agg.ideal_total_pnl > 0 and agg.realistic_total_pnl > 0:
        feedback.append(
            f"P&L comparison — Ideal: ${agg.ideal_total_pnl:.2f} vs "
            f"Realistic: ${agg.realistic_total_pnl:.2f} "
            f"(execution costs consumed ${agg.total_execution_cost:.2f})."
        )
    elif agg.ideal_total_pnl > 0 > agg.realistic_total_pnl:
        feedback.append(
            f"WARNING: Strategy is profitable before costs (${agg.ideal_total_pnl:.2f}) "
            f"but unprofitable after execution costs (${agg.realistic_total_pnl:.2f}). "
            f"This strategy would lose money in live trading."
        )

    if not feedback:
        feedback.append("Insufficient data for detailed feedback. Continue trading to build analysis.")

    return feedback

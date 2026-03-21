// =============================================================================
// MarketPilot AI — Analytics Utilities
// =============================================================================

import type { PnlDataPoint } from "@marketpilot/types";

export function calculateSharpeRatio(returns: number[], riskFreeRate = 0): number {
  if (returns.length === 0) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const std = Math.sqrt(
    returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length
  );
  if (std === 0) return 0;
  return (mean - riskFreeRate) / std;
}

export function calculateMaxDrawdown(pnlSeries: number[]): number {
  let peak = -Infinity;
  let maxDrawdown = 0;
  for (const value of pnlSeries) {
    peak = Math.max(peak, value);
    const drawdown = ((peak - value) / Math.max(peak, 1)) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }
  return maxDrawdown;
}

export function calculateWinRate(trades: { pnl: number }[]): number {
  if (trades.length === 0) return 0;
  const wins = trades.filter((t) => t.pnl > 0).length;
  return (wins / trades.length) * 100;
}

export function calculateProfitFactor(trades: { pnl: number }[]): number {
  const grossProfit = trades.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(
    trades.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0)
  );
  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / grossLoss;
}

export function generatePnlTimeSeries(
  dailyPnl: number[],
  startDate: Date
): PnlDataPoint[] {
  let cumulative = 0;
  return dailyPnl.map((pnl, i) => {
    cumulative += pnl;
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split("T")[0],
      pnl,
      cumulative,
    };
  });
}

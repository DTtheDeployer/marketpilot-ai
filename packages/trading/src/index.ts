// =============================================================================
// MarketPilot AI — Trading Utilities
// =============================================================================

export { PolymarketClient, PolymarketApiError } from "./polymarket/client";
export { PolymarketWebSocket } from "./polymarket/websocket";
export type * from "./polymarket/types";

import type { RiskLimits, RiskPreset } from "@marketpilot/types";

export const RISK_PRESETS: Record<RiskPreset, RiskLimits> = {
  CONSERVATIVE: {
    maxDailyLoss: 50,
    maxWeeklyLoss: 150,
    maxDrawdown: 10,
    maxCapitalAllocated: 500,
    maxPositionSize: 100,
    maxExposurePerCategory: 200,
    maxOrdersPerMinute: 5,
    cooldownAfterLossStreak: 60,
    minLiquidityThreshold: 1000,
    maxSpreadThreshold: 5,
    maxSlippageThreshold: 2,
  },
  BALANCED: {
    maxDailyLoss: 200,
    maxWeeklyLoss: 500,
    maxDrawdown: 20,
    maxCapitalAllocated: 2000,
    maxPositionSize: 500,
    maxExposurePerCategory: 1000,
    maxOrdersPerMinute: 15,
    cooldownAfterLossStreak: 30,
    minLiquidityThreshold: 500,
    maxSpreadThreshold: 8,
    maxSlippageThreshold: 3,
  },
  ADVANCED: {
    maxDailyLoss: 1000,
    maxWeeklyLoss: 2500,
    maxDrawdown: 35,
    maxCapitalAllocated: 10000,
    maxPositionSize: 2000,
    maxExposurePerCategory: 5000,
    maxOrdersPerMinute: 30,
    cooldownAfterLossStreak: 15,
    minLiquidityThreshold: 200,
    maxSpreadThreshold: 12,
    maxSlippageThreshold: 5,
  },
};

export function validateRiskLimits(limits: Partial<RiskLimits>): string[] {
  const errors: string[] = [];
  if (limits.maxDailyLoss !== undefined && limits.maxDailyLoss <= 0)
    errors.push("Max daily loss must be positive");
  if (limits.maxDrawdown !== undefined && (limits.maxDrawdown <= 0 || limits.maxDrawdown > 100))
    errors.push("Max drawdown must be between 0 and 100");
  if (limits.maxPositionSize !== undefined && limits.maxPositionSize <= 0)
    errors.push("Max position size must be positive");
  if (limits.maxOrdersPerMinute !== undefined && limits.maxOrdersPerMinute <= 0)
    errors.push("Max orders per minute must be positive");
  if (limits.maxSpreadThreshold !== undefined && limits.maxSpreadThreshold <= 0)
    errors.push("Max spread threshold must be positive");
  return errors;
}

export function formatPnl(value: number): string {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}$${Math.abs(value).toFixed(2)}`;
}

export function formatPercent(value: number): string {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

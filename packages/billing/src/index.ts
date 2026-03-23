// =============================================================================
// MarketPilot AI — Billing Utilities
// =============================================================================

import type { PlanTier } from "@marketpilot/types";

export const PLANS = {
  FREE: {
    tier: "FREE" as PlanTier,
    name: "Explorer",
    description: "Get started with paper trading and strategy research",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "Paper trading mode",
      "1 active strategy",
      "Basic dashboard",
      "5 backtests per month",
      "Community support",
    ],
    limits: {
      maxBots: 1,
      maxStrategies: 1,
      maxBacktests: 5,
      liveTrading: false,
      advancedAnalytics: false,
      priorityAlerts: false,
    },
  },
  PRO: {
    tier: "PRO" as PlanTier,
    name: "Strategist",
    description: "Full paper trading suite with advanced analytics",
    priceMonthly: 49,
    priceYearly: 468, // $39/mo billed annually
    features: [
      "All paper strategies",
      "5 active bots",
      "Advanced analytics",
      "50 backtests per month",
      "Real-time alerts",
      "Performance reporting",
      "Email support",
    ],
    limits: {
      maxBots: 5,
      maxStrategies: 6,
      maxBacktests: 50,
      liveTrading: false,
      advancedAnalytics: true,
      priorityAlerts: false,
    },
  },
  ELITE: {
    tier: "ELITE" as PlanTier,
    name: "Operator",
    description:
      "Live execution with institutional-grade risk controls",
    priceMonthly: 149,
    priceYearly: 1428, // $119/mo billed annually
    features: [
      "Everything in Strategist",
      "Live trading eligibility",
      "10 active bots",
      "Unlimited backtests",
      "Priority alerts",
      "Advanced risk controls",
      "Wallet integration",
      "API access",
      "Priority support",
    ],
    limits: {
      maxBots: 10,
      maxStrategies: 6,
      maxBacktests: -1, // unlimited
      liveTrading: true,
      advancedAnalytics: true,
      priorityAlerts: true,
    },
  },
} as const;

export type PlanConfig = (typeof PLANS)[keyof typeof PLANS];

export function canAccessFeature(
  tier: PlanTier,
  feature: keyof PlanConfig["limits"]
): boolean {
  const plan = PLANS[tier];
  if (!plan) return false;
  const value = plan.limits[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return (value as number) !== 0;
  return false;
}

export function getFeatureLimit(
  tier: PlanTier,
  feature: keyof PlanConfig["limits"]
): number | boolean {
  const plan = PLANS[tier];
  if (!plan) return false;
  return plan.limits[feature];
}

export function isUpgradeRequired(
  currentTier: PlanTier,
  requiredTier: PlanTier
): boolean {
  const order: PlanTier[] = ["FREE", "PRO", "ELITE"];
  return order.indexOf(currentTier) < order.indexOf(requiredTier);
}

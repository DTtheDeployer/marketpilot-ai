// =============================================================================
// MarketPilot AI — Shared Types
// =============================================================================

// ── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID";
export type PlanTier = "FREE" | "PRO" | "ELITE";
export type TradingMode = "PAPER" | "LIVE";
export type BotStatus = "IDLE" | "RUNNING" | "PAUSED" | "STOPPED" | "ERROR" | "COOLDOWN";
export type OrderSide = "BUY" | "SELL";
export type OrderType = "LIMIT" | "MARKET";
export type OrderStatus = "PENDING" | "OPEN" | "FILLED" | "PARTIALLY_FILLED" | "CANCELED" | "REJECTED";
export type JurisdictionStatus = "UNCHECKED" | "ELIGIBLE" | "RESTRICTED" | "PENDING_REVIEW";
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";
export type AlertType = "RISK_LIMIT" | "BOT_ERROR" | "EXECUTION" | "SYSTEM" | "BILLING" | "COMPLIANCE";
export type StrategyCategory = "SPREAD" | "MEAN_REVERSION" | "MOMENTUM" | "ORDERBOOK" | "TIME_DECAY" | "CROSS_MARKET" | "META";
export type RiskPreset = "CONSERVATIVE" | "BALANCED" | "ADVANCED";
export type BacktestStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
export type MarketStatus = "ACTIVE" | "CLOSED" | "RESOLVED";

// ── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

// ── Strategy Types ───────────────────────────────────────────────────────────

export interface StrategyMeta {
  id: string;
  name: string;
  slug: string;
  category: StrategyCategory;
  description: string;
  thesis: string;
  riskLevel: 1 | 2 | 3 | 4 | 5;
  minTier: PlanTier;
  tags: string[];
}

export interface StrategyConfig {
  strategyId: string;
  parameters: Record<string, number | string | boolean>;
  riskOverrides?: Partial<RiskLimits>;
}

export interface RiskLimits {
  maxDailyLoss: number;
  maxWeeklyLoss: number;
  maxDrawdown: number;
  maxCapitalAllocated: number;
  maxPositionSize: number;
  maxExposurePerCategory: number;
  maxOrdersPerMinute: number;
  cooldownAfterLossStreak: number;
  minLiquidityThreshold: number;
  maxSpreadThreshold: number;
  maxSlippageThreshold: number;
}

export interface RiskPresetConfig {
  preset: RiskPreset;
  limits: RiskLimits;
}

// ── Bot Types ────────────────────────────────────────────────────────────────

export interface BotSummary {
  id: string;
  name: string;
  strategyName: string;
  status: BotStatus;
  mode: TradingMode;
  pnl: number;
  pnlPercent: number;
  tradesCount: number;
  uptime: string;
  lastActivity: string;
}

// ── Market Types ─────────────────────────────────────────────────────────────

export interface MarketInfo {
  id: string;
  conditionId: string;
  title: string;
  description: string;
  category: string;
  endDate: string;
  status: MarketStatus;
  outcomes: { name: string; price: number }[];
  volume24h: number;
  liquidity: number;
}

// ── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalPnl: number;
  totalPnlPercent: number;
  activeBots: number;
  totalTrades: number;
  winRate: number;
  capitalDeployed: number;
  mode: TradingMode;
}

export interface PnlDataPoint {
  date: string;
  pnl: number;
  cumulative: number;
}

// ── Billing Types ────────────────────────────────────────────────────────────

export interface PlanInfo {
  tier: PlanTier;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits: {
    maxBots: number;
    maxStrategies: number;
    maxBacktests: number;
    liveTrading: boolean;
    advancedAnalytics: boolean;
    priorityAlerts: boolean;
  };
}

// ── Notification Types ───────────────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ── Onboarding Types ─────────────────────────────────────────────────────────

export interface OnboardingState {
  step: number;
  totalSteps: number;
  completed: boolean;
  jurisdictionChecked: boolean;
  riskAcknowledged: boolean;
  firstStrategySelected: boolean;
  firstBotLaunched: boolean;
}

// ── Admin Types ──────────────────────────────────────────────────────────────

export interface SystemHealth {
  database: "healthy" | "degraded" | "down";
  redis: "healthy" | "degraded" | "down";
  strategyEngine: "healthy" | "degraded" | "down";
  apiLatency: number;
  activeUsers: number;
  activeBots: number;
  errorRate: number;
  uptime: string;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plan: PlanTier;
  status: SubscriptionStatus;
  mode: TradingMode;
  jurisdiction: JurisdictionStatus;
  botsCount: number;
  createdAt: string;
}

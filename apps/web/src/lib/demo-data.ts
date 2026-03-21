// =============================================================================
// MarketPilot AI — Client-Side Demo Data
// =============================================================================
// Used for rendering the UI before backend integration is complete.

import type {
  DashboardStats,
  PnlDataPoint,
  BotSummary,
  StrategyMeta,
  MarketInfo,
  NotificationItem,
  PlanInfo,
  SystemHealth,
  AdminUserSummary,
} from "@marketpilot/types";

// ── Dashboard ────────────────────────────────────────────────────────────────

export const demoDashboardStats: DashboardStats = {
  totalPnl: 1247.83,
  totalPnlPercent: 12.48,
  activeBots: 3,
  totalTrades: 847,
  winRate: 62.3,
  capitalDeployed: 5000,
  mode: "PAPER",
};

export const demoPnlData: PnlDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 29 + i);
  const dailyPnl = (Math.random() - 0.4) * 120;
  return {
    date: date.toISOString().split("T")[0],
    pnl: Math.round(dailyPnl * 100) / 100,
    cumulative: 0,
  };
});
let cum = 0;
demoPnlData.forEach((d) => {
  cum += d.pnl;
  d.cumulative = Math.round(cum * 100) / 100;
});

// ── Bots ─────────────────────────────────────────────────────────────────────

export const demoBots: BotSummary[] = [
  {
    id: "bot-1",
    name: "Alpha Spreader",
    strategyName: "Spread Capture",
    status: "RUNNING",
    mode: "PAPER",
    pnl: 523.41,
    pnlPercent: 10.47,
    tradesCount: 312,
    uptime: "14d 6h",
    lastActivity: "2 min ago",
  },
  {
    id: "bot-2",
    name: "Mean Rev Scanner",
    strategyName: "Mean Reversion",
    status: "RUNNING",
    mode: "PAPER",
    pnl: 891.22,
    pnlPercent: 17.82,
    tradesCount: 428,
    uptime: "21d 12h",
    lastActivity: "45 sec ago",
  },
  {
    id: "bot-3",
    name: "Momentum Tracker",
    strategyName: "Momentum",
    status: "PAUSED",
    mode: "PAPER",
    pnl: -166.80,
    pnlPercent: -3.34,
    tradesCount: 107,
    uptime: "5d 3h",
    lastActivity: "3h ago",
  },
];

// ── Strategies ───────────────────────────────────────────────────────────────

export const demoStrategies: StrategyMeta[] = [
  {
    id: "strat-1",
    name: "Spread Capture",
    slug: "spread-capture",
    category: "SPREAD",
    description:
      "Captures the bid-ask spread by placing passive limit orders on both sides of the market. Profits from the natural spread while maintaining delta-neutral exposure.",
    thesis:
      "Prediction markets often have wide spreads due to lower liquidity compared to traditional markets. By providing liquidity on both sides, this strategy captures the spread as profit while managing inventory risk through position limits.",
    riskLevel: 2,
    minTier: "FREE",
    tags: ["market-making", "passive", "low-risk", "spread"],
  },
  {
    id: "strat-2",
    name: "Mean Reversion",
    slug: "mean-reversion",
    category: "MEAN_REVERSION",
    description:
      "Identifies when market prices deviate significantly from their moving average and trades the expected reversion to the mean.",
    thesis:
      "Short-term price movements in prediction markets tend to overreact to news. Prices that move sharply away from their recent average often revert, creating systematic trading opportunities.",
    riskLevel: 3,
    minTier: "FREE",
    tags: ["statistical", "mean-reversion", "moderate-risk"],
  },
  {
    id: "strat-3",
    name: "Orderbook Imbalance",
    slug: "orderbook-imbalance",
    category: "ORDERBOOK",
    description:
      "Monitors orderbook depth asymmetry to predict short-term price direction and front-runs expected moves.",
    thesis:
      "Significant imbalances between bid and ask depth signal imminent price movement. Heavy bid-side depth relative to asks suggests upward pressure, and vice versa.",
    riskLevel: 3,
    minTier: "PRO",
    tags: ["microstructure", "orderbook", "short-term"],
  },
  {
    id: "strat-4",
    name: "Momentum Surge",
    slug: "momentum-unusual-activity",
    category: "MOMENTUM",
    description:
      "Detects unusual trading volume and price momentum to ride directional moves in fast-moving markets.",
    thesis:
      "When prediction markets experience sudden volume spikes, it often precedes significant price moves as new information is being priced in. Early detection of these surges allows profitable trend-following.",
    riskLevel: 4,
    minTier: "PRO",
    tags: ["momentum", "volume", "trend-following"],
  },
  {
    id: "strat-5",
    name: "Time Decay Repricing",
    slug: "time-decay-repricing",
    category: "TIME_DECAY",
    description:
      "Exploits the tendency for prediction market prices to converge toward resolution values as expiry approaches.",
    thesis:
      "As events approach their resolution date, uncertainty decreases and prices should converge. Markets trading far from expected resolution values near expiry present asymmetric opportunities.",
    riskLevel: 3,
    minTier: "PRO",
    tags: ["time-decay", "expiry", "convergence"],
  },
  {
    id: "strat-6",
    name: "Cross-Market Divergence",
    slug: "cross-market-divergence",
    category: "CROSS_MARKET",
    description:
      "Identifies price discrepancies between correlated markets and trades the expected convergence.",
    thesis:
      "Related prediction markets sometimes price correlated events inconsistently. When two markets that should move together diverge, there is an opportunity to capture the spread as they reconverge.",
    riskLevel: 4,
    minTier: "ELITE",
    tags: ["arbitrage", "correlation", "cross-market"],
  },
];

// ── Markets ──────────────────────────────────────────────────────────────────

export const demoMarkets: MarketInfo[] = [
  {
    id: "mkt-1",
    conditionId: "0x1234",
    title: "Will the Federal Reserve cut rates before July 2026?",
    description: "Resolves YES if the Federal Reserve announces a rate cut before July 1, 2026.",
    category: "Economics",
    endDate: "2026-07-01",
    status: "ACTIVE",
    outcomes: [
      { name: "Yes", price: 0.62 },
      { name: "No", price: 0.38 },
    ],
    volume24h: 245000,
    liquidity: 890000,
  },
  {
    id: "mkt-2",
    conditionId: "0x2345",
    title: "Bitcoin above $150K by end of 2026?",
    description: "Resolves YES if Bitcoin trades above $150,000 on any major exchange before Dec 31, 2026.",
    category: "Crypto",
    endDate: "2026-12-31",
    status: "ACTIVE",
    outcomes: [
      { name: "Yes", price: 0.34 },
      { name: "No", price: 0.66 },
    ],
    volume24h: 523000,
    liquidity: 1200000,
  },
  {
    id: "mkt-3",
    conditionId: "0x3456",
    title: "AI model passes bar exam with top 1% score in 2026?",
    description: "Resolves YES if any AI model achieves a top 1% score on the Uniform Bar Exam.",
    category: "Technology",
    endDate: "2026-12-31",
    status: "ACTIVE",
    outcomes: [
      { name: "Yes", price: 0.71 },
      { name: "No", price: 0.29 },
    ],
    volume24h: 178000,
    liquidity: 450000,
  },
  {
    id: "mkt-4",
    conditionId: "0x4567",
    title: "Champions League winner 2026",
    description: "Which team will win the 2025-2026 UEFA Champions League?",
    category: "Sports",
    endDate: "2026-06-01",
    status: "ACTIVE",
    outcomes: [
      { name: "Real Madrid", price: 0.22 },
      { name: "Man City", price: 0.18 },
    ],
    volume24h: 892000,
    liquidity: 2100000,
  },
  {
    id: "mkt-5",
    conditionId: "0x5678",
    title: "US GDP growth above 3% in Q2 2026?",
    description: "Resolves YES if the BEA reports Q2 2026 real GDP growth above 3% annualized.",
    category: "Economics",
    endDate: "2026-09-30",
    status: "ACTIVE",
    outcomes: [
      { name: "Yes", price: 0.28 },
      { name: "No", price: 0.72 },
    ],
    volume24h: 156000,
    liquidity: 380000,
  },
];

// ── Notifications ────────────────────────────────────────────────────────────

export const demoNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    type: "EXECUTION",
    severity: "INFO",
    title: "Order Filled",
    message: 'Buy order for "Fed Rate Cut" filled at $0.62 — 50 shares',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "notif-2",
    type: "RISK_LIMIT",
    severity: "WARNING",
    title: "Daily Loss Approaching Limit",
    message: "Bot 'Momentum Tracker' has reached 80% of daily loss limit ($160 / $200)",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "notif-3",
    type: "BOT_ERROR",
    severity: "CRITICAL",
    title: "Bot Paused — Consecutive Losses",
    message: "Bot 'Momentum Tracker' auto-paused after 5 consecutive losses. Review and restart manually.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "notif-4",
    type: "SYSTEM",
    severity: "INFO",
    title: "New Strategy Available",
    message: "Cross-Market Divergence strategy is now available for Elite subscribers.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

// ── Admin ────────────────────────────────────────────────────────────────────

export const demoSystemHealth: SystemHealth = {
  database: "healthy",
  redis: "healthy",
  strategyEngine: "healthy",
  apiLatency: 45,
  activeUsers: 1247,
  activeBots: 3891,
  errorRate: 0.02,
  uptime: "99.97%",
};

export const demoAdminUsers: AdminUserSummary[] = [
  {
    id: "user-1",
    email: "demo@marketpilot.ai",
    name: "Demo User",
    role: "USER",
    plan: "PRO",
    status: "ACTIVE",
    mode: "PAPER",
    jurisdiction: "ELIGIBLE",
    botsCount: 3,
    createdAt: "2026-01-15",
  },
  {
    id: "user-2",
    email: "alice@example.com",
    name: "Alice Chen",
    role: "USER",
    plan: "ELITE",
    status: "ACTIVE",
    mode: "LIVE",
    jurisdiction: "ELIGIBLE",
    botsCount: 7,
    createdAt: "2026-02-01",
  },
  {
    id: "user-3",
    email: "bob@example.com",
    name: "Bob Martinez",
    role: "USER",
    plan: "FREE",
    status: "TRIALING",
    mode: "PAPER",
    jurisdiction: "UNCHECKED",
    botsCount: 1,
    createdAt: "2026-03-10",
  },
  {
    id: "user-4",
    email: "carol@example.com",
    name: "Carol Williams",
    role: "USER",
    plan: "PRO",
    status: "PAST_DUE",
    mode: "PAPER",
    jurisdiction: "RESTRICTED",
    botsCount: 0,
    createdAt: "2026-02-20",
  },
];

// ── Plans ────────────────────────────────────────────────────────────────────

export const demoPlans: PlanInfo[] = [
  {
    tier: "FREE",
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
  {
    tier: "PRO",
    name: "Strategist",
    description: "Full paper trading suite with advanced analytics",
    priceMonthly: 49,
    priceYearly: 468,
    features: [
      "All paper strategies",
      "5 active bots",
      "Advanced analytics",
      "50 backtests / month",
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
  {
    tier: "ELITE",
    name: "Operator",
    description: "Live execution with institutional-grade risk controls",
    priceMonthly: 149,
    priceYearly: 1428,
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
      maxBacktests: -1,
      liveTrading: true,
      advancedAnalytics: true,
      priorityAlerts: true,
    },
  },
];

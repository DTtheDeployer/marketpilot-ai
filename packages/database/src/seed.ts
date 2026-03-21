// =============================================================================
// MarketPilot AI — Database Seed Script
// =============================================================================
// Usage: npx ts-node packages/database/src/seed.ts
//   or via prisma: npx prisma db seed
// =============================================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a date N days ago from now. */
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/** Returns a date N days from now. */
function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

/** Deterministic but realistic-looking CUID placeholder. */
function seedId(prefix: string): string {
  return `seed_${prefix}`;
}

// bcrypt hash placeholder — "$2b$10$..." format, represents "password123"
const BCRYPT_PLACEHOLDER =
  "$2a$12$Y1RItDUzMnQHNvQm2g06eedQmpoX5A//C5z4yCPFPn9dZN7b8t8km";

// ---------------------------------------------------------------------------
// 1. Plans
// ---------------------------------------------------------------------------

async function seedPlans() {
  const plans = [
    {
      id: seedId("plan_free"),
      tier: "FREE" as const,
      name: "Free",
      description:
        "Get started with paper trading and basic strategies. Perfect for learning the ropes.",
      priceMonthly: 0,
      priceYearly: 0,
      stripePriceMonthly: null,
      stripePriceYearly: null,
      features: {
        paper_trading: true,
        live_trading: false,
        max_bots: 1,
        max_strategies: 2,
        backtesting: false,
        api_access: false,
        priority_support: false,
        advanced_analytics: false,
      },
      limits: {
        max_bots: 1,
        max_active_orders: 5,
        max_capital_per_bot: 100,
        max_daily_trades: 20,
        data_retention_days: 7,
      },
      active: true,
    },
    {
      id: seedId("plan_pro"),
      tier: "PRO" as const,
      name: "Pro",
      description:
        "Unlock live trading, more bots, and advanced strategies. For serious traders.",
      priceMonthly: 4900,
      priceYearly: 46800,
      stripePriceMonthly: "price_pro_monthly_placeholder",
      stripePriceYearly: "price_pro_yearly_placeholder",
      features: {
        paper_trading: true,
        live_trading: true,
        max_bots: 5,
        max_strategies: 6,
        backtesting: true,
        api_access: true,
        priority_support: false,
        advanced_analytics: true,
      },
      limits: {
        max_bots: 5,
        max_active_orders: 50,
        max_capital_per_bot: 5000,
        max_daily_trades: 200,
        data_retention_days: 90,
      },
      active: true,
    },
    {
      id: seedId("plan_elite"),
      tier: "ELITE" as const,
      name: "Elite",
      description:
        "Full platform access with unlimited bots, cross-market strategies, and white-glove support.",
      priceMonthly: 14900,
      priceYearly: 142800,
      stripePriceMonthly: "price_elite_monthly_placeholder",
      stripePriceYearly: "price_elite_yearly_placeholder",
      features: {
        paper_trading: true,
        live_trading: true,
        max_bots: -1,
        max_strategies: -1,
        backtesting: true,
        api_access: true,
        priority_support: true,
        advanced_analytics: true,
        cross_market: true,
        meta_strategies: true,
      },
      limits: {
        max_bots: -1,
        max_active_orders: 500,
        max_capital_per_bot: 50000,
        max_daily_trades: -1,
        data_retention_days: 365,
      },
      active: true,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { tier: plan.tier },
      update: {
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        stripePriceMonthly: plan.stripePriceMonthly,
        stripePriceYearly: plan.stripePriceYearly,
        features: plan.features,
        limits: plan.limits,
        active: plan.active,
      },
      create: plan,
    });
  }

  console.log("  Plans seeded");
  return plans;
}

// ---------------------------------------------------------------------------
// 2. Feature Entitlements
// ---------------------------------------------------------------------------

async function seedEntitlements() {
  const entitlements = [
    // FREE
    { planId: seedId("plan_free"), feature: "paper_trading", limit: null, enabled: true },
    { planId: seedId("plan_free"), feature: "live_trading", limit: null, enabled: false },
    { planId: seedId("plan_free"), feature: "max_bots", limit: 1, enabled: true },
    { planId: seedId("plan_free"), feature: "max_strategies", limit: 2, enabled: true },
    { planId: seedId("plan_free"), feature: "backtesting", limit: null, enabled: false },
    { planId: seedId("plan_free"), feature: "api_access", limit: null, enabled: false },
    { planId: seedId("plan_free"), feature: "max_daily_trades", limit: 20, enabled: true },
    // PRO
    { planId: seedId("plan_pro"), feature: "paper_trading", limit: null, enabled: true },
    { planId: seedId("plan_pro"), feature: "live_trading", limit: null, enabled: true },
    { planId: seedId("plan_pro"), feature: "max_bots", limit: 5, enabled: true },
    { planId: seedId("plan_pro"), feature: "max_strategies", limit: 6, enabled: true },
    { planId: seedId("plan_pro"), feature: "backtesting", limit: 50, enabled: true },
    { planId: seedId("plan_pro"), feature: "api_access", limit: null, enabled: true },
    { planId: seedId("plan_pro"), feature: "max_daily_trades", limit: 200, enabled: true },
    { planId: seedId("plan_pro"), feature: "advanced_analytics", limit: null, enabled: true },
    // ELITE
    { planId: seedId("plan_elite"), feature: "paper_trading", limit: null, enabled: true },
    { planId: seedId("plan_elite"), feature: "live_trading", limit: null, enabled: true },
    { planId: seedId("plan_elite"), feature: "max_bots", limit: null, enabled: true },
    { planId: seedId("plan_elite"), feature: "max_strategies", limit: null, enabled: true },
    { planId: seedId("plan_elite"), feature: "backtesting", limit: null, enabled: true },
    { planId: seedId("plan_elite"), feature: "api_access", limit: null, enabled: true },
    { planId: seedId("plan_elite"), feature: "max_daily_trades", limit: null, enabled: true },
    { planId: seedId("plan_elite"), feature: "advanced_analytics", limit: null, enabled: true },
    { planId: seedId("plan_elite"), feature: "cross_market", limit: null, enabled: true },
    { planId: seedId("plan_elite"), feature: "meta_strategies", limit: null, enabled: true },
    { planId: seedId("plan_elite"), feature: "priority_support", limit: null, enabled: true },
  ];

  for (const e of entitlements) {
    await prisma.featureEntitlement.upsert({
      where: {
        planId_feature: { planId: e.planId, feature: e.feature },
      },
      update: { limit: e.limit, enabled: e.enabled },
      create: e,
    });
  }

  console.log("  Feature entitlements seeded");
}

// ---------------------------------------------------------------------------
// 3. Strategies
// ---------------------------------------------------------------------------

async function seedStrategies() {
  const strategies = [
    {
      id: seedId("strat_spread"),
      slug: "spread-capture",
      name: "Spread Capture",
      category: "SPREAD" as const,
      description:
        "Captures the bid-ask spread on prediction markets by simultaneously posting limit orders on both sides of the book. Profits from the natural spread when both orders fill.",
      thesis:
        "Prediction markets often have wide spreads, especially in lower-liquidity events. By acting as a market maker and posting on both sides, we can consistently capture 2-5 cents of spread per round trip.",
      riskLevel: 2,
      minTier: "FREE" as const,
      tags: ["market-making", "low-risk", "high-frequency"],
      configSchema: {
        type: "object",
        properties: {
          spreadThreshold: { type: "number", minimum: 0.01, maximum: 0.2 },
          orderSize: { type: "number", minimum: 1, maximum: 1000 },
          maxPositionSize: { type: "number", minimum: 1, maximum: 5000 },
          refreshInterval: { type: "number", minimum: 5, maximum: 300 },
        },
      },
      riskSchema: {
        type: "object",
        properties: {
          maxLossPerTrade: { type: "number" },
          maxDailyLoss: { type: "number" },
          maxOpenOrders: { type: "number" },
        },
      },
      defaults: {
        spreadThreshold: 0.04,
        orderSize: 25,
        maxPositionSize: 200,
        refreshInterval: 30,
      },
      active: true,
    },
    {
      id: seedId("strat_mean_rev"),
      slug: "mean-reversion",
      name: "Mean Reversion",
      category: "MEAN_REVERSION" as const,
      description:
        "Identifies short-term price dislocations and trades the reversion to a rolling mean. Buys when price dips significantly below the mean and sells when it recovers.",
      thesis:
        "Prediction market prices tend to overreact to news in the short term. By measuring deviation from a 24-hour rolling average, we buy oversold conditions and sell overbought ones.",
      riskLevel: 3,
      minTier: "FREE" as const,
      tags: ["statistical", "medium-risk", "swing-trading"],
      configSchema: {
        type: "object",
        properties: {
          lookbackPeriod: { type: "number", minimum: 12, maximum: 168 },
          entryThreshold: { type: "number", minimum: 0.02, maximum: 0.15 },
          exitThreshold: { type: "number", minimum: 0.005, maximum: 0.05 },
          orderSize: { type: "number", minimum: 1, maximum: 1000 },
        },
      },
      riskSchema: {
        type: "object",
        properties: {
          maxLossPerTrade: { type: "number" },
          stopLoss: { type: "number" },
          maxDailyLoss: { type: "number" },
        },
      },
      defaults: {
        lookbackPeriod: 24,
        entryThreshold: 0.06,
        exitThreshold: 0.02,
        orderSize: 50,
      },
      active: true,
    },
    {
      id: seedId("strat_orderbook"),
      slug: "orderbook-imbalance",
      name: "Orderbook Imbalance",
      category: "ORDERBOOK" as const,
      description:
        "Analyzes real-time orderbook depth to detect buy/sell pressure imbalances. Trades in the direction of dominant pressure before price adjusts.",
      thesis:
        "When there is significantly more size on the bid side than the ask side (or vice versa), price tends to move toward the heavier side. We front-run this adjustment.",
      riskLevel: 4,
      minTier: "PRO" as const,
      tags: ["orderbook", "medium-risk", "short-term"],
      configSchema: {
        type: "object",
        properties: {
          imbalanceRatio: { type: "number", minimum: 1.5, maximum: 5.0 },
          depthLevels: { type: "number", minimum: 3, maximum: 20 },
          orderSize: { type: "number", minimum: 1, maximum: 500 },
          holdPeriod: { type: "number", minimum: 10, maximum: 600 },
        },
      },
      riskSchema: {
        type: "object",
        properties: {
          maxLossPerTrade: { type: "number" },
          maxDailyLoss: { type: "number" },
        },
      },
      defaults: {
        imbalanceRatio: 2.5,
        depthLevels: 5,
        orderSize: 30,
        holdPeriod: 120,
      },
      active: true,
    },
    {
      id: seedId("strat_momentum"),
      slug: "momentum-unusual-activity",
      name: "Momentum & Unusual Activity",
      category: "MOMENTUM" as const,
      description:
        "Detects unusual volume spikes and price momentum to identify trending markets. Enters positions in the direction of the trend and rides the momentum.",
      thesis:
        "Sudden spikes in volume and directional price movement often signal new information entering the market. By detecting these early, we can ride the momentum before the market fully prices in the news.",
      riskLevel: 4,
      minTier: "PRO" as const,
      tags: ["momentum", "volume-analysis", "trend-following"],
      configSchema: {
        type: "object",
        properties: {
          volumeMultiplier: { type: "number", minimum: 1.5, maximum: 10.0 },
          momentumWindow: { type: "number", minimum: 5, maximum: 60 },
          orderSize: { type: "number", minimum: 1, maximum: 500 },
          trailingStopPct: { type: "number", minimum: 0.01, maximum: 0.15 },
        },
      },
      riskSchema: {
        type: "object",
        properties: {
          maxLossPerTrade: { type: "number" },
          maxDailyLoss: { type: "number" },
          maxPositionSize: { type: "number" },
        },
      },
      defaults: {
        volumeMultiplier: 3.0,
        momentumWindow: 15,
        orderSize: 40,
        trailingStopPct: 0.05,
      },
      active: true,
    },
    {
      id: seedId("strat_time_decay"),
      slug: "time-decay-repricing",
      name: "Time Decay Repricing",
      category: "TIME_DECAY" as const,
      description:
        "Exploits the time-value decay in prediction markets as events approach resolution. As uncertainty decreases, prices should converge toward 0 or 1 — this strategy trades the convergence.",
      thesis:
        "Markets trading near 50 cents with approaching deadlines should see accelerating price movement. We model expected time decay and position for the convergence, buying strong favorites cheaply.",
      riskLevel: 3,
      minTier: "PRO" as const,
      tags: ["time-decay", "theta", "event-driven"],
      configSchema: {
        type: "object",
        properties: {
          daysToExpiry: { type: "number", minimum: 1, maximum: 90 },
          confidenceThreshold: { type: "number", minimum: 0.6, maximum: 0.95 },
          orderSize: { type: "number", minimum: 1, maximum: 500 },
          minEdge: { type: "number", minimum: 0.02, maximum: 0.15 },
        },
      },
      riskSchema: {
        type: "object",
        properties: {
          maxLossPerTrade: { type: "number" },
          maxExposure: { type: "number" },
        },
      },
      defaults: {
        daysToExpiry: 14,
        confidenceThreshold: 0.75,
        orderSize: 50,
        minEdge: 0.05,
      },
      active: true,
    },
    {
      id: seedId("strat_cross_mkt"),
      slug: "cross-market-divergence",
      name: "Cross-Market Divergence",
      category: "CROSS_MARKET" as const,
      description:
        "Identifies correlated prediction markets that have temporarily diverged in pricing. Takes opposing positions in the correlated pair, profiting when prices reconverge.",
      thesis:
        "Closely related markets (e.g., 'Party X wins presidency' vs 'Party X wins popular vote') should maintain a stable price relationship. When they diverge, we arbitrage the gap.",
      riskLevel: 5,
      minTier: "ELITE" as const,
      tags: ["arbitrage", "pairs-trading", "correlation"],
      configSchema: {
        type: "object",
        properties: {
          correlationThreshold: { type: "number", minimum: 0.7, maximum: 0.99 },
          divergenceEntry: { type: "number", minimum: 0.03, maximum: 0.2 },
          divergenceExit: { type: "number", minimum: 0.005, maximum: 0.05 },
          orderSize: { type: "number", minimum: 1, maximum: 500 },
        },
      },
      riskSchema: {
        type: "object",
        properties: {
          maxLossPerPair: { type: "number" },
          maxDailyLoss: { type: "number" },
          maxOpenPairs: { type: "number" },
        },
      },
      defaults: {
        correlationThreshold: 0.85,
        divergenceEntry: 0.08,
        divergenceExit: 0.02,
        orderSize: 40,
      },
      active: true,
    },
  ];

  for (const s of strategies) {
    await prisma.strategy.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        category: s.category,
        description: s.description,
        thesis: s.thesis,
        riskLevel: s.riskLevel,
        minTier: s.minTier,
        tags: s.tags,
        configSchema: s.configSchema,
        riskSchema: s.riskSchema,
        defaults: s.defaults,
        active: s.active,
      },
      create: s,
    });
  }

  console.log("  Strategies seeded");
  return strategies;
}

// ---------------------------------------------------------------------------
// 4. Markets
// ---------------------------------------------------------------------------

async function seedMarkets() {
  const markets = [
    {
      id: seedId("mkt_1"),
      conditionId: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef01",
      title: "Will the US Federal Reserve cut interest rates before July 2026?",
      description: "Resolves YES if the Federal Open Market Committee announces a federal funds rate cut at any scheduled meeting before July 1, 2026.",
      category: "economics",
      endDate: new Date("2026-07-01"),
      status: "ACTIVE" as const,
      outcomes: { yes: "Rate Cut", no: "No Rate Cut" },
      source: "polymarket",
    },
    {
      id: seedId("mkt_2"),
      conditionId: "0x2b3c4d5e6f7890abcdef1234567890abcdef0102",
      title: "Will Bitcoin exceed $150,000 by end of 2026?",
      description: "Resolves YES if BTC/USD reaches or exceeds $150,000 on any major exchange before December 31, 2026.",
      category: "crypto",
      endDate: new Date("2026-12-31"),
      status: "ACTIVE" as const,
      outcomes: { yes: "Above $150K", no: "Below $150K" },
      source: "polymarket",
    },
    {
      id: seedId("mkt_3"),
      conditionId: "0x3c4d5e6f7890abcdef1234567890abcdef010203",
      title: "Will the next FIFA World Cup final have over 3.5 goals?",
      description: "Resolves YES if the FIFA World Cup 2026 final match ends with a combined score of 4 or more goals (excluding penalty shootout).",
      category: "sports",
      endDate: new Date("2026-07-19"),
      status: "ACTIVE" as const,
      outcomes: { yes: "Over 3.5", no: "Under 3.5" },
      source: "polymarket",
    },
    {
      id: seedId("mkt_4"),
      conditionId: "0x4d5e6f7890abcdef1234567890abcdef01020304",
      title: "Will Apple release a foldable iPhone in 2026?",
      description: "Resolves YES if Apple officially announces and begins shipping a foldable iPhone model before December 31, 2026.",
      category: "tech",
      endDate: new Date("2026-12-31"),
      status: "ACTIVE" as const,
      outcomes: { yes: "Released", no: "Not Released" },
      source: "polymarket",
    },
    {
      id: seedId("mkt_5"),
      conditionId: "0x5e6f7890abcdef1234567890abcdef0102030405",
      title: "Will Ethereum transition to full danksharding by Q4 2026?",
      description: "Resolves YES if the Ethereum mainnet implements full danksharding (not just proto-danksharding) before October 1, 2026.",
      category: "crypto",
      endDate: new Date("2026-10-01"),
      status: "ACTIVE" as const,
      outcomes: { yes: "Implemented", no: "Not Implemented" },
      source: "polymarket",
    },
    {
      id: seedId("mkt_6"),
      conditionId: "0x6f7890abcdef1234567890abcdef010203040506",
      title: "Will a Democrat win the 2026 Texas gubernatorial race?",
      description: "Resolves YES if the Democratic Party candidate wins the 2026 Texas Governor election.",
      category: "politics",
      endDate: new Date("2026-11-03"),
      status: "ACTIVE" as const,
      outcomes: { yes: "Democrat Wins", no: "Republican Wins" },
      source: "polymarket",
    },
    {
      id: seedId("mkt_7"),
      conditionId: "0x7890abcdef1234567890abcdef01020304050607",
      title: "Will OpenAI release GPT-5 before June 2026?",
      description: "Resolves YES if OpenAI publicly releases (API or consumer product) a model officially branded as GPT-5 before June 1, 2026.",
      category: "tech",
      endDate: new Date("2026-06-01"),
      status: "ACTIVE" as const,
      outcomes: { yes: "Released", no: "Not Released" },
      source: "polymarket",
    },
    {
      id: seedId("mkt_8"),
      conditionId: "0x890abcdef1234567890abcdef0102030405060708",
      title: "Will the S&P 500 close above 6,500 by end of Q2 2026?",
      description: "Resolves YES if the S&P 500 index closes at or above 6,500 on any trading day before June 30, 2026.",
      category: "economics",
      endDate: new Date("2026-06-30"),
      status: "ACTIVE" as const,
      outcomes: { yes: "Above 6500", no: "Below 6500" },
      source: "polymarket",
    },
    {
      id: seedId("mkt_9"),
      conditionId: "0x90abcdef1234567890abcdef010203040506070809",
      title: "Will the UEFA Champions League 2026 winner be from the Premier League?",
      description: "Resolves YES if a Premier League club wins the 2025-26 UEFA Champions League.",
      category: "sports",
      endDate: new Date("2026-05-30"),
      status: "ACTIVE" as const,
      outcomes: { yes: "Premier League Club", no: "Other League Club" },
      source: "polymarket",
    },
    {
      id: seedId("mkt_10"),
      conditionId: "0xabcdef1234567890abcdef01020304050607080910",
      title: "Will US inflation (CPI) drop below 2% in any month of 2026?",
      description: "Resolves YES if the US Bureau of Labor Statistics reports year-over-year CPI below 2.0% for any month in 2026.",
      category: "economics",
      endDate: new Date("2026-12-31"),
      status: "ACTIVE" as const,
      outcomes: { yes: "Below 2%", no: "At or Above 2%" },
      source: "polymarket",
    },
  ];

  for (const m of markets) {
    await prisma.market.upsert({
      where: { conditionId: m.conditionId },
      update: {
        title: m.title,
        description: m.description,
        category: m.category,
        endDate: m.endDate,
        status: m.status,
        outcomes: m.outcomes,
        source: m.source,
      },
      create: m,
    });
  }

  console.log("  Markets seeded");
  return markets;
}

// ---------------------------------------------------------------------------
// 5. Market Snapshots
// ---------------------------------------------------------------------------

async function seedMarketSnapshots() {
  const marketIds = [seedId("mkt_1"), seedId("mkt_2"), seedId("mkt_3")];
  const basePrices = [0.62, 0.35, 0.28];

  for (let i = 0; i < marketIds.length; i++) {
    for (let day = 0; day < 7; day++) {
      const jitter = (Math.sin(day * 1.5 + i) * 0.05);
      const yesPrice = Math.round((basePrices[i] + jitter) * 100) / 100;
      const noPrice = Math.round((1 - yesPrice) * 100) / 100;

      await prisma.marketSnapshot.create({
        data: {
          marketId: marketIds[i],
          prices: { yes: yesPrice, no: noPrice },
          volume24h: 15000 + Math.floor(Math.sin(day) * 5000 + 5000),
          liquidity: 80000 + Math.floor(Math.cos(day) * 20000),
          createdAt: daysAgo(7 - day),
        },
      });
    }
  }

  console.log("  Market snapshots seeded");
}

// ---------------------------------------------------------------------------
// 6. Feature Flags
// ---------------------------------------------------------------------------

async function seedFeatureFlags() {
  const flags = [
    {
      key: "maintenance_mode",
      name: "Maintenance Mode",
      description: "When enabled, shows a maintenance banner and disables trading.",
      enabled: false,
      metadata: { estimatedDowntime: "2 hours", message: "Scheduled maintenance in progress." },
    },
    {
      key: "live_trading_enabled",
      name: "Live Trading",
      description: "Master switch for live trading across the platform.",
      enabled: true,
      metadata: { enabledSince: "2025-11-01" },
    },
    {
      key: "new_user_onboarding_v2",
      name: "New User Onboarding V2",
      description: "Enables the redesigned onboarding flow with interactive tutorials.",
      enabled: true,
      metadata: { rolloutPercentage: 100, variant: "interactive" },
    },
    {
      key: "advanced_analytics_dashboard",
      name: "Advanced Analytics Dashboard",
      description: "Enables the new advanced analytics dashboard for Pro and Elite users.",
      enabled: true,
      metadata: { minTier: "PRO" },
    },
    {
      key: "cross_market_strategies",
      name: "Cross-Market Strategies",
      description: "Enables cross-market divergence strategy for Elite users.",
      enabled: true,
      metadata: { minTier: "ELITE" },
    },
    {
      key: "websocket_orderbook_feed",
      name: "WebSocket Orderbook Feed",
      description: "Real-time orderbook data via WebSocket connections.",
      enabled: true,
      metadata: { maxConnectionsPerUser: 5 },
    },
    {
      key: "email_digest",
      name: "Daily Email Digest",
      description: "Sends a daily summary email of bot performance and market activity.",
      enabled: true,
      metadata: { sendTime: "08:00 UTC" },
    },
    {
      key: "beta_backtesting_v2",
      name: "Backtesting V2 (Beta)",
      description: "New backtesting engine with Monte Carlo simulation support.",
      enabled: false,
      metadata: { betaUsers: ["admin@marketpilot.ai"], expectedGA: "2026-Q2" },
    },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {
        name: flag.name,
        description: flag.description,
        enabled: flag.enabled,
        metadata: flag.metadata,
      },
      create: flag,
    });
  }

  console.log("  Feature flags seeded");
}

// ---------------------------------------------------------------------------
// 7. Users
// ---------------------------------------------------------------------------

async function seedUsers() {
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@marketpilot.ai" },
    update: {
      name: "Admin User",
      role: "ADMIN",
      passwordHash: BCRYPT_PLACEHOLDER,
      emailVerified: new Date("2025-01-15"),
    },
    create: {
      id: seedId("user_admin"),
      email: "admin@marketpilot.ai",
      name: "Admin User",
      role: "ADMIN",
      passwordHash: BCRYPT_PLACEHOLDER,
      emailVerified: new Date("2025-01-15"),
      createdAt: new Date("2025-01-15"),
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@marketpilot.ai" },
    update: {
      name: "Demo Trader",
      role: "USER",
      passwordHash: BCRYPT_PLACEHOLDER,
      emailVerified: new Date("2025-06-01"),
    },
    create: {
      id: seedId("user_demo"),
      email: "demo@marketpilot.ai",
      name: "Demo Trader",
      role: "USER",
      passwordHash: BCRYPT_PLACEHOLDER,
      emailVerified: new Date("2025-06-01"),
      createdAt: new Date("2025-06-01"),
    },
  });

  console.log("  Users seeded");
  return { adminUser, demoUser };
}

// ---------------------------------------------------------------------------
// 8. User Profiles
// ---------------------------------------------------------------------------

async function seedProfiles(adminId: string, demoId: string) {
  await prisma.userProfile.upsert({
    where: { userId: adminId },
    update: {
      displayName: "MarketPilot Admin",
      timezone: "America/New_York",
      tradingMode: "LIVE",
      jurisdictionStatus: "ELIGIBLE",
      country: "US",
      region: "NY",
      onboardingStep: 5,
      onboardingComplete: true,
      riskPreset: "ADVANCED",
    },
    create: {
      userId: adminId,
      displayName: "MarketPilot Admin",
      timezone: "America/New_York",
      tradingMode: "LIVE",
      jurisdictionStatus: "ELIGIBLE",
      country: "US",
      region: "NY",
      onboardingStep: 5,
      onboardingComplete: true,
      riskPreset: "ADVANCED",
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: demoId },
    update: {
      displayName: "Demo Trader",
      timezone: "America/Chicago",
      tradingMode: "PAPER",
      jurisdictionStatus: "ELIGIBLE",
      country: "US",
      region: "IL",
      onboardingStep: 5,
      onboardingComplete: true,
      riskPreset: "BALANCED",
    },
    create: {
      userId: demoId,
      displayName: "Demo Trader",
      timezone: "America/Chicago",
      tradingMode: "PAPER",
      jurisdictionStatus: "ELIGIBLE",
      country: "US",
      region: "IL",
      onboardingStep: 5,
      onboardingComplete: true,
      riskPreset: "BALANCED",
    },
  });

  console.log("  User profiles seeded");
}

// ---------------------------------------------------------------------------
// 9. Subscriptions
// ---------------------------------------------------------------------------

async function seedSubscriptions(adminId: string, demoId: string) {
  // Admin gets ELITE
  await prisma.subscription.upsert({
    where: { userId: adminId },
    update: {
      planId: seedId("plan_elite"),
      status: "ACTIVE",
      currentPeriodStart: daysAgo(15),
      currentPeriodEnd: daysFromNow(15),
    },
    create: {
      userId: adminId,
      planId: seedId("plan_elite"),
      status: "ACTIVE",
      stripeSubscriptionId: "sub_admin_elite_placeholder",
      currentPeriodStart: daysAgo(15),
      currentPeriodEnd: daysFromNow(15),
    },
  });

  // Demo gets PRO
  await prisma.subscription.upsert({
    where: { userId: demoId },
    update: {
      planId: seedId("plan_pro"),
      status: "ACTIVE",
      currentPeriodStart: daysAgo(10),
      currentPeriodEnd: daysFromNow(20),
    },
    create: {
      userId: demoId,
      planId: seedId("plan_pro"),
      status: "ACTIVE",
      stripeSubscriptionId: "sub_demo_pro_placeholder",
      currentPeriodStart: daysAgo(10),
      currentPeriodEnd: daysFromNow(20),
    },
  });

  console.log("  Subscriptions seeded");
}

// ---------------------------------------------------------------------------
// 10. Bots (3 for demo user)
// ---------------------------------------------------------------------------

async function seedBots(demoId: string) {
  const bots = [
    {
      id: seedId("bot_1"),
      userId: demoId,
      strategyId: seedId("strat_spread"),
      name: "Fed Rate Spread Bot",
      status: "RUNNING" as const,
      mode: "PAPER" as const,
      config: {
        spreadThreshold: 0.04,
        orderSize: 25,
        maxPositionSize: 200,
        refreshInterval: 30,
        targetMarkets: [seedId("mkt_1")],
      },
      riskLimits: {
        maxLossPerTrade: 5,
        maxDailyLoss: 25,
        maxOpenOrders: 4,
      },
      riskPreset: "BALANCED" as const,
      capitalAllocated: 500,
      lastHeartbeat: daysAgo(0),
      startedAt: daysAgo(14),
      stoppedAt: null,
    },
    {
      id: seedId("bot_2"),
      userId: demoId,
      strategyId: seedId("strat_mean_rev"),
      name: "BTC Mean Reversion",
      status: "PAUSED" as const,
      mode: "PAPER" as const,
      config: {
        lookbackPeriod: 24,
        entryThreshold: 0.06,
        exitThreshold: 0.02,
        orderSize: 50,
        targetMarkets: [seedId("mkt_2")],
      },
      riskLimits: {
        maxLossPerTrade: 10,
        stopLoss: 0.08,
        maxDailyLoss: 50,
      },
      riskPreset: "BALANCED" as const,
      capitalAllocated: 1000,
      lastHeartbeat: daysAgo(2),
      startedAt: daysAgo(21),
      stoppedAt: null,
    },
    {
      id: seedId("bot_3"),
      userId: demoId,
      strategyId: seedId("strat_momentum"),
      name: "Tech Momentum Scanner",
      status: "STOPPED" as const,
      mode: "PAPER" as const,
      config: {
        volumeMultiplier: 3.0,
        momentumWindow: 15,
        orderSize: 40,
        trailingStopPct: 0.05,
        targetMarkets: [seedId("mkt_4"), seedId("mkt_7")],
      },
      riskLimits: {
        maxLossPerTrade: 8,
        maxDailyLoss: 40,
        maxPositionSize: 300,
      },
      riskPreset: "CONSERVATIVE" as const,
      capitalAllocated: 750,
      lastHeartbeat: daysAgo(5),
      startedAt: daysAgo(30),
      stoppedAt: daysAgo(5),
    },
  ];

  for (const bot of bots) {
    await prisma.bot.upsert({
      where: { id: bot.id },
      update: {
        name: bot.name,
        status: bot.status,
        config: bot.config,
        riskLimits: bot.riskLimits,
        capitalAllocated: bot.capitalAllocated,
        lastHeartbeat: bot.lastHeartbeat,
        startedAt: bot.startedAt,
        stoppedAt: bot.stoppedAt,
      },
      create: bot,
    });
  }

  console.log("  Bots seeded");
  return bots;
}

// ---------------------------------------------------------------------------
// 11. Bot Events
// ---------------------------------------------------------------------------

async function seedBotEvents() {
  // Delete existing seed bot events to keep idempotent
  await prisma.botEvent.deleteMany({
    where: { botId: { in: [seedId("bot_1"), seedId("bot_2"), seedId("bot_3")] } },
  });

  const events = [
    // Bot 1 (running) — recent activity
    { botId: seedId("bot_1"), type: "started", severity: "INFO" as const, message: "Bot started in PAPER mode with spread-capture strategy.", createdAt: daysAgo(14) },
    { botId: seedId("bot_1"), type: "trade_executed", severity: "INFO" as const, message: "Spread captured on Fed Rate market: bought YES at 0.60, sold YES at 0.64. PnL: +$1.00", metadata: { pnl: 1.0, market: seedId("mkt_1") }, createdAt: daysAgo(10) },
    { botId: seedId("bot_1"), type: "trade_executed", severity: "INFO" as const, message: "Spread captured: bought NO at 0.36, sold NO at 0.39. PnL: +$0.75", metadata: { pnl: 0.75, market: seedId("mkt_1") }, createdAt: daysAgo(7) },
    { botId: seedId("bot_1"), type: "risk_check", severity: "INFO" as const, message: "Daily risk check passed. Current daily PnL: +$3.25. Daily limit: $25.00.", createdAt: daysAgo(3) },
    { botId: seedId("bot_1"), type: "heartbeat", severity: "INFO" as const, message: "Bot heartbeat OK. Uptime: 14d 3h 22m.", createdAt: daysAgo(0) },

    // Bot 2 (paused) — paused due to volatility
    { botId: seedId("bot_2"), type: "started", severity: "INFO" as const, message: "Bot started in PAPER mode with mean-reversion strategy.", createdAt: daysAgo(21) },
    { botId: seedId("bot_2"), type: "trade_executed", severity: "INFO" as const, message: "Mean reversion entry: bought YES at 0.32, target exit at 0.37.", metadata: { pnl: 0, market: seedId("mkt_2") }, createdAt: daysAgo(15) },
    { botId: seedId("bot_2"), type: "risk_warning", severity: "WARNING" as const, message: "High volatility detected on BTC $150K market. Deviation 2.3x above threshold.", createdAt: daysAgo(3) },
    { botId: seedId("bot_2"), type: "paused", severity: "WARNING" as const, message: "Bot auto-paused due to elevated market volatility exceeding risk parameters.", createdAt: daysAgo(2) },

    // Bot 3 (stopped) — stopped after completing run
    { botId: seedId("bot_3"), type: "started", severity: "INFO" as const, message: "Bot started in PAPER mode targeting tech prediction markets.", createdAt: daysAgo(30) },
    { botId: seedId("bot_3"), type: "trade_executed", severity: "INFO" as const, message: "Momentum signal detected on Apple foldable market. Bought YES at 0.12.", metadata: { pnl: 0, market: seedId("mkt_4") }, createdAt: daysAgo(25) },
    { botId: seedId("bot_3"), type: "trade_executed", severity: "INFO" as const, message: "Position closed on Apple foldable market. Sold YES at 0.15. PnL: +$1.20", metadata: { pnl: 1.2, market: seedId("mkt_4") }, createdAt: daysAgo(20) },
    { botId: seedId("bot_3"), type: "error", severity: "CRITICAL" as const, message: "API rate limit exceeded when fetching GPT-5 market data. Retries exhausted.", metadata: { errorCode: "RATE_LIMIT", retries: 3 }, createdAt: daysAgo(8) },
    { botId: seedId("bot_3"), type: "stopped", severity: "INFO" as const, message: "Bot manually stopped by user after API issues.", createdAt: daysAgo(5) },
  ];

  for (const event of events) {
    await prisma.botEvent.create({ data: event });
  }

  console.log("  Bot events seeded");
}

// ---------------------------------------------------------------------------
// 12. Orders and Fills
// ---------------------------------------------------------------------------

async function seedOrdersAndFills(demoId: string) {
  // Clean existing seed orders
  await prisma.fill.deleteMany({
    where: { order: { userId: demoId, botId: { in: [seedId("bot_1"), seedId("bot_2"), seedId("bot_3")] } } },
  });
  await prisma.executionLog.deleteMany({
    where: { order: { userId: demoId, botId: { in: [seedId("bot_1"), seedId("bot_2"), seedId("bot_3")] } } },
  });
  await prisma.order.deleteMany({
    where: { userId: demoId, botId: { in: [seedId("bot_1"), seedId("bot_2"), seedId("bot_3")] } },
  });

  const orders = [
    // Bot 1 orders (spread capture on Fed Rate market)
    {
      userId: demoId,
      botId: seedId("bot_1"),
      marketId: seedId("mkt_1"),
      side: "BUY" as const,
      type: "LIMIT" as const,
      status: "FILLED" as const,
      mode: "PAPER" as const,
      price: 0.60,
      size: 25,
      filledSize: 25,
      avgFillPrice: 0.60,
      createdAt: daysAgo(10),
      fills: [{ price: 0.60, size: 25, fee: 0.25, timestamp: daysAgo(10) }],
    },
    {
      userId: demoId,
      botId: seedId("bot_1"),
      marketId: seedId("mkt_1"),
      side: "SELL" as const,
      type: "LIMIT" as const,
      status: "FILLED" as const,
      mode: "PAPER" as const,
      price: 0.64,
      size: 25,
      filledSize: 25,
      avgFillPrice: 0.64,
      createdAt: daysAgo(10),
      fills: [{ price: 0.64, size: 25, fee: 0.25, timestamp: daysAgo(10) }],
    },
    {
      userId: demoId,
      botId: seedId("bot_1"),
      marketId: seedId("mkt_1"),
      side: "BUY" as const,
      type: "LIMIT" as const,
      status: "FILLED" as const,
      mode: "PAPER" as const,
      price: 0.61,
      size: 25,
      filledSize: 25,
      avgFillPrice: 0.61,
      createdAt: daysAgo(7),
      fills: [{ price: 0.61, size: 25, fee: 0.25, timestamp: daysAgo(7) }],
    },
    {
      userId: demoId,
      botId: seedId("bot_1"),
      marketId: seedId("mkt_1"),
      side: "SELL" as const,
      type: "LIMIT" as const,
      status: "OPEN" as const,
      mode: "PAPER" as const,
      price: 0.65,
      size: 25,
      filledSize: 0,
      avgFillPrice: null,
      createdAt: daysAgo(1),
      fills: [],
    },
    // Bot 2 orders (mean reversion on BTC market)
    {
      userId: demoId,
      botId: seedId("bot_2"),
      marketId: seedId("mkt_2"),
      side: "BUY" as const,
      type: "LIMIT" as const,
      status: "FILLED" as const,
      mode: "PAPER" as const,
      price: 0.32,
      size: 50,
      filledSize: 50,
      avgFillPrice: 0.32,
      createdAt: daysAgo(15),
      fills: [
        { price: 0.32, size: 30, fee: 0.30, timestamp: daysAgo(15) },
        { price: 0.32, size: 20, fee: 0.20, timestamp: daysAgo(15) },
      ],
    },
    {
      userId: demoId,
      botId: seedId("bot_2"),
      marketId: seedId("mkt_2"),
      side: "SELL" as const,
      type: "LIMIT" as const,
      status: "CANCELED" as const,
      mode: "PAPER" as const,
      price: 0.37,
      size: 50,
      filledSize: 0,
      avgFillPrice: null,
      createdAt: daysAgo(12),
      fills: [],
    },
    // Bot 3 orders (momentum on Apple market)
    {
      userId: demoId,
      botId: seedId("bot_3"),
      marketId: seedId("mkt_4"),
      side: "BUY" as const,
      type: "MARKET" as const,
      status: "FILLED" as const,
      mode: "PAPER" as const,
      price: 0.12,
      size: 40,
      filledSize: 40,
      avgFillPrice: 0.12,
      createdAt: daysAgo(25),
      fills: [{ price: 0.12, size: 40, fee: 0.40, timestamp: daysAgo(25) }],
    },
    {
      userId: demoId,
      botId: seedId("bot_3"),
      marketId: seedId("mkt_4"),
      side: "SELL" as const,
      type: "LIMIT" as const,
      status: "FILLED" as const,
      mode: "PAPER" as const,
      price: 0.15,
      size: 40,
      filledSize: 40,
      avgFillPrice: 0.15,
      createdAt: daysAgo(20),
      fills: [{ price: 0.15, size: 40, fee: 0.40, timestamp: daysAgo(20) }],
    },
    // A rejected order for realism
    {
      userId: demoId,
      botId: seedId("bot_3"),
      marketId: seedId("mkt_7"),
      side: "BUY" as const,
      type: "LIMIT" as const,
      status: "REJECTED" as const,
      mode: "PAPER" as const,
      price: 0.55,
      size: 40,
      filledSize: 0,
      avgFillPrice: null,
      createdAt: daysAgo(8),
      fills: [],
    },
  ];

  for (const { fills, ...orderData } of orders) {
    const order = await prisma.order.create({ data: orderData });

    for (const fill of fills) {
      await prisma.fill.create({
        data: { orderId: order.id, ...fill },
      });
    }
  }

  console.log("  Orders and fills seeded");
}

// ---------------------------------------------------------------------------
// 13. Positions
// ---------------------------------------------------------------------------

async function seedPositions(demoId: string) {
  await prisma.position.deleteMany({
    where: { userId: demoId, botId: { in: [seedId("bot_1"), seedId("bot_2"), seedId("bot_3")] } },
  });

  const positions = [
    // Bot 1: open position from spread capture
    {
      userId: demoId,
      botId: seedId("bot_1"),
      marketId: seedId("mkt_1"),
      mode: "PAPER" as const,
      side: "BUY" as const,
      size: 25,
      avgEntry: 0.61,
      currentPrice: 0.63,
      unrealizedPnl: 0.50,
      realizedPnl: 1.0,
      isOpen: true,
      openedAt: daysAgo(7),
    },
    // Bot 2: open position from mean reversion (underwater)
    {
      userId: demoId,
      botId: seedId("bot_2"),
      marketId: seedId("mkt_2"),
      mode: "PAPER" as const,
      side: "BUY" as const,
      size: 50,
      avgEntry: 0.32,
      currentPrice: 0.30,
      unrealizedPnl: -1.0,
      realizedPnl: 0,
      isOpen: true,
      openedAt: daysAgo(15),
    },
    // Bot 3: closed position from momentum trade
    {
      userId: demoId,
      botId: seedId("bot_3"),
      marketId: seedId("mkt_4"),
      mode: "PAPER" as const,
      side: "BUY" as const,
      size: 40,
      avgEntry: 0.12,
      currentPrice: 0.15,
      unrealizedPnl: 0,
      realizedPnl: 1.20,
      isOpen: false,
      openedAt: daysAgo(25),
      closedAt: daysAgo(20),
    },
  ];

  for (const pos of positions) {
    await prisma.position.create({ data: pos });
  }

  console.log("  Positions seeded");
}

// ---------------------------------------------------------------------------
// 14. PnL Snapshots (30 days)
// ---------------------------------------------------------------------------

async function seedPnlSnapshots() {
  await prisma.pnlSnapshot.deleteMany({
    where: { botId: { in: [seedId("bot_1"), seedId("bot_2"), seedId("bot_3")] } },
  });

  // Bot 1: steady small gains (spread capture)
  let cumPnl1 = 0;
  let peak1 = 0;
  for (let day = 29; day >= 0; day--) {
    // Only active for last 14 days
    if (day > 14) continue;
    const dailyPnl = Math.round((0.15 + Math.sin(day * 0.8) * 0.4 + Math.random() * 0.3) * 100) / 100;
    cumPnl1 = Math.round((cumPnl1 + dailyPnl) * 100) / 100;
    peak1 = Math.max(peak1, cumPnl1);
    const drawdown = peak1 > 0 ? Math.round(((peak1 - cumPnl1) / peak1) * 100) / 100 : 0;

    await prisma.pnlSnapshot.create({
      data: {
        botId: seedId("bot_1"),
        pnl: dailyPnl,
        cumPnl: cumPnl1,
        drawdown,
        timestamp: daysAgo(day),
      },
    });
  }

  // Bot 2: volatile with drawdown (mean reversion)
  let cumPnl2 = 0;
  let peak2 = 0;
  for (let day = 29; day >= 0; day--) {
    if (day > 21) continue;
    const dailyPnl = Math.round((Math.sin(day * 1.2) * 1.5 + (Math.random() - 0.4) * 0.8) * 100) / 100;
    cumPnl2 = Math.round((cumPnl2 + dailyPnl) * 100) / 100;
    peak2 = Math.max(peak2, cumPnl2);
    const drawdown = peak2 > 0 ? Math.round(((peak2 - cumPnl2) / peak2) * 100) / 100 : 0;

    await prisma.pnlSnapshot.create({
      data: {
        botId: seedId("bot_2"),
        pnl: dailyPnl,
        cumPnl: cumPnl2,
        drawdown,
        timestamp: daysAgo(day),
      },
    });
  }

  // Bot 3: small gains then flat after stop
  let cumPnl3 = 0;
  let peak3 = 0;
  for (let day = 29; day >= 0; day--) {
    if (day > 29 || day < 5) continue; // active from day 30 to day 5
    const dailyPnl = day >= 20
      ? Math.round((0.05 + Math.random() * 0.15) * 100) / 100
      : Math.round((0.1 + Math.sin(day) * 0.3) * 100) / 100;
    cumPnl3 = Math.round((cumPnl3 + dailyPnl) * 100) / 100;
    peak3 = Math.max(peak3, cumPnl3);
    const drawdown = peak3 > 0 ? Math.round(((peak3 - cumPnl3) / peak3) * 100) / 100 : 0;

    await prisma.pnlSnapshot.create({
      data: {
        botId: seedId("bot_3"),
        pnl: dailyPnl,
        cumPnl: cumPnl3,
        drawdown,
        timestamp: daysAgo(day),
      },
    });
  }

  console.log("  PnL snapshots seeded (30 days)");
}

// ---------------------------------------------------------------------------
// 15. Alerts
// ---------------------------------------------------------------------------

async function seedAlerts(adminId: string, demoId: string) {
  await prisma.alert.deleteMany({
    where: { userId: { in: [adminId, demoId] } },
  });

  const alerts = [
    {
      userId: demoId,
      type: "RISK_LIMIT" as const,
      severity: "WARNING" as const,
      title: "Daily Loss Approaching Limit",
      message: "Bot 'BTC Mean Reversion' has reached 80% of its daily loss limit ($40 of $50). Consider reviewing position sizing or pausing the bot.",
      metadata: { botId: seedId("bot_2"), currentLoss: 40, limit: 50 },
      read: false,
      createdAt: daysAgo(3),
    },
    {
      userId: demoId,
      type: "BOT_ERROR" as const,
      severity: "CRITICAL" as const,
      title: "Bot Stopped Due to API Error",
      message: "Bot 'Tech Momentum Scanner' encountered repeated API rate limit errors and has been automatically stopped. Please check your API configuration.",
      metadata: { botId: seedId("bot_3"), errorCode: "RATE_LIMIT" },
      read: true,
      createdAt: daysAgo(8),
    },
    {
      userId: demoId,
      type: "EXECUTION" as const,
      severity: "INFO" as const,
      title: "Order Filled",
      message: "Buy order for 25 shares of 'Fed Rate Cut' filled at $0.61. Your spread-capture bot is performing within expected parameters.",
      metadata: { botId: seedId("bot_1"), market: seedId("mkt_1"), price: 0.61 },
      read: true,
      createdAt: daysAgo(7),
    },
    {
      userId: demoId,
      type: "SYSTEM" as const,
      severity: "INFO" as const,
      title: "New Strategy Available",
      message: "The 'Cross-Market Divergence' strategy is now available for Elite plan subscribers. Upgrade your plan to access pairs trading across correlated prediction markets.",
      read: false,
      createdAt: daysAgo(5),
    },
    {
      userId: demoId,
      type: "BILLING" as const,
      severity: "INFO" as const,
      title: "Subscription Renewed",
      message: "Your Pro plan subscription has been renewed successfully. Next billing date: " + daysFromNow(20).toISOString().slice(0, 10) + ".",
      metadata: { planTier: "PRO", amount: 4900 },
      read: true,
      createdAt: daysAgo(10),
    },
    // Admin alerts
    {
      userId: adminId,
      type: "SYSTEM" as const,
      severity: "INFO" as const,
      title: "System Health Check Passed",
      message: "All system components are operational. Database latency: 3ms, API response time: 45ms, WebSocket connections: 127 active.",
      metadata: { dbLatency: 3, apiLatency: 45, wsConnections: 127 },
      read: false,
      createdAt: daysAgo(0),
    },
    {
      userId: adminId,
      type: "COMPLIANCE" as const,
      severity: "WARNING" as const,
      title: "Jurisdiction Review Required",
      message: "3 new users from restricted jurisdictions require manual review. Countries flagged: [REDACTED]. Please review in the admin compliance panel.",
      metadata: { pendingReviews: 3 },
      read: false,
      createdAt: daysAgo(1),
    },
  ];

  for (const alert of alerts) {
    await prisma.alert.create({ data: alert });
  }

  console.log("  Alerts seeded");
}

// ---------------------------------------------------------------------------
// 16. System Events
// ---------------------------------------------------------------------------

async function seedSystemEvents() {
  // Clear old seed system events (by type prefix)
  await prisma.systemEvent.deleteMany({
    where: {
      createdAt: { gte: daysAgo(31) },
    },
  });

  const events = [
    {
      type: "deployment",
      severity: "INFO" as const,
      message: "Application deployed successfully. Version: 2.4.1. Deployment ID: deploy_abc123.",
      metadata: { version: "2.4.1", deploymentId: "deploy_abc123", duration: "42s" },
      createdAt: daysAgo(0),
    },
    {
      type: "deployment",
      severity: "INFO" as const,
      message: "Application deployed successfully. Version: 2.4.0. Deployment ID: deploy_xyz789.",
      metadata: { version: "2.4.0", deploymentId: "deploy_xyz789", duration: "38s" },
      createdAt: daysAgo(7),
    },
    {
      type: "market_sync",
      severity: "INFO" as const,
      message: "Market data sync completed. 847 markets updated, 12 new markets discovered, 3 markets resolved.",
      metadata: { updated: 847, new: 12, resolved: 3, duration: "12.4s" },
      createdAt: daysAgo(0),
    },
    {
      type: "market_sync",
      severity: "WARNING" as const,
      message: "Market data sync partially failed. Polymarket API returned 503 for 2 requests. 845 of 847 markets updated.",
      metadata: { updated: 845, failed: 2, errorCode: 503 },
      createdAt: daysAgo(3),
    },
    {
      type: "database_migration",
      severity: "INFO" as const,
      message: "Database migration completed successfully. Migration: 20260315_add_pnl_drawdown_column.",
      metadata: { migration: "20260315_add_pnl_drawdown_column", duration: "1.2s" },
      createdAt: daysAgo(6),
    },
    {
      type: "rate_limit",
      severity: "WARNING" as const,
      message: "Rate limiting activated for IP 192.168.1.xxx. 150 requests in 60 seconds exceeded threshold of 100.",
      metadata: { ip: "192.168.1.xxx", requests: 150, threshold: 100, windowSeconds: 60 },
      createdAt: daysAgo(8),
    },
    {
      type: "cron_job",
      severity: "INFO" as const,
      message: "Daily digest emails sent successfully. 234 users received their daily performance summary.",
      metadata: { recipientCount: 234, duration: "8.3s" },
      createdAt: daysAgo(1),
    },
    {
      type: "security",
      severity: "CRITICAL" as const,
      message: "Multiple failed login attempts detected for admin@marketpilot.ai from IP 10.0.0.xxx. Account temporarily locked.",
      metadata: { email: "admin@marketpilot.ai", attempts: 8, ip: "10.0.0.xxx", lockDuration: "15m" },
      createdAt: daysAgo(12),
    },
    {
      type: "backup",
      severity: "INFO" as const,
      message: "Database backup completed successfully. Backup size: 2.4 GB. Stored in S3 bucket marketpilot-backups.",
      metadata: { sizeGb: 2.4, bucket: "marketpilot-backups", key: "backup_20260321.sql.gz" },
      createdAt: daysAgo(0),
    },
    {
      type: "scaling",
      severity: "INFO" as const,
      message: "Auto-scaling triggered: bot-worker pool scaled from 3 to 5 instances due to increased bot activity.",
      metadata: { service: "bot-worker", previousCount: 3, newCount: 5, trigger: "cpu_utilization_85%" },
      createdAt: daysAgo(2),
    },
  ];

  for (const event of events) {
    await prisma.systemEvent.create({ data: event });
  }

  console.log("  System events seeded");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Seeding MarketPilot AI database...\n");

  // 1. Plans
  await seedPlans();

  // 2. Feature entitlements
  await seedEntitlements();

  // 3. Strategies
  await seedStrategies();

  // 4. Markets
  await seedMarkets();

  // 5. Market snapshots
  await seedMarketSnapshots();

  // 6. Feature flags
  await seedFeatureFlags();

  // 7. Users
  const { adminUser, demoUser } = await seedUsers();

  // 8. User profiles
  await seedProfiles(adminUser.id, demoUser.id);

  // 9. Subscriptions
  await seedSubscriptions(adminUser.id, demoUser.id);

  // 10. Bots
  await seedBots(demoUser.id);

  // 11. Bot events
  await seedBotEvents();

  // 12. Orders and fills
  await seedOrdersAndFills(demoUser.id);

  // 13. Positions
  await seedPositions(demoUser.id);

  // 14. PnL snapshots
  await seedPnlSnapshots();

  // 15. Alerts
  await seedAlerts(adminUser.id, demoUser.id);

  // 16. System events
  await seedSystemEvents();

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

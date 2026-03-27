import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from "@marketpilot/ui";
import {
  Trophy,
  Search,
  SlidersHorizontal,
  FlaskConical,
  Rocket,
  ArrowRight,
  CheckCircle2,
  CloudSun,
  Zap,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Target,
  Clock,
} from "lucide-react";

/* ── Sports Arb walkthrough ──────────────────────────────────────────────── */

const sportsArbSteps = [
  {
    label: "SCAN",
    title: "Fetch Sharp Bookmaker Odds",
    detail:
      "The bot polls The Odds API every 5 minutes across NBA, MMA/UFC, EPL, Champions League, and NFL. It pulls moneyline probabilities from the sharpest books — DraftKings, FanDuel, BetMGM, and more.",
    example: {
      event: "Lakers vs Celtics",
      book: "DraftKings",
      line: "Lakers ML: 58%",
    },
  },
  {
    label: "DETECT",
    title: "Compare to Polymarket Prices",
    detail:
      "Each bookmaker probability is compared to the equivalent Polymarket contract. When a book prices a team at 58% but Polymarket trades at 42\u00A2 (implied 42%), that's a 16-point edge the bot flags instantly.",
    example: {
      polymarket: "Lakers to win — trading at 42\u00A2",
      edge: "+16% edge detected",
    },
  },
  {
    label: "TRADE",
    title: "Execute with Kelly Sizing",
    detail:
      "Signals above the minimum edge threshold (default 5%) are sized using quarter-Kelly criterion — mathematically optimal bet sizing that maximises long-run growth while limiting drawdown. Trades execute automatically on Polymarket.",
    example: {
      action: "BUY Lakers YES",
      size: "$1.80 (quarter-Kelly)",
      ev: "EV: +$0.29 per share",
    },
  },
  {
    label: "PROFIT",
    title: "Collect at Resolution",
    detail:
      "When the game ends, the contract resolves. If the Lakers win, each share pays $1.00. You bought at 42\u00A2, netting 58\u00A2 profit per share. The position manager tracks every trade, P&L, and portfolio metric in real time.",
    example: {
      result: "Lakers WIN",
      payout: "$1.80 \u2192 $4.29",
      profit: "+$2.49 profit (138% ROI)",
    },
  },
];

/* ── Workflow steps ──────────────────────────────────────────────────────── */

const workflowSteps = [
  {
    icon: Search,
    step: "01",
    title: "Pick a Strategy",
    subtitle: "Sports Arb is live — more strategies shipping soon",
    description:
      "Browse our strategy library. Each strategy has a transparent thesis explaining the market inefficiency it targets, a clear risk rating, and fully configurable parameters. Start with Sports Arb today.",
    details: [
      "Sports Arbitrage — live now, exploiting bookmaker vs Polymarket mispricing",
      "Weather Arbitrage — coming soon, NOAA forecasts vs weather markets",
      "Additional strategies: Mean Reversion, Momentum Surge, Spread Capture, and more",
      "Every strategy clearly states its edge, risk level, and how it works",
    ],
  },
  {
    icon: SlidersHorizontal,
    step: "02",
    title: "Configure Risk Controls",
    subtitle: "Define your parameters before a single trade fires",
    description:
      "Set position sizes, daily loss limits, and edge thresholds. Risk controls are not optional — they are enforced on every trade, paper or live.",
    details: [
      "Minimum edge threshold (default 5%) — only trade when the maths works",
      "Quarter-Kelly position sizing caps each bet for long-run growth",
      "Daily loss limit with automatic circuit breaker",
      "Max 5 concurrent positions to limit exposure",
    ],
  },
  {
    icon: FlaskConical,
    step: "03",
    title: "Paper Trade First",
    subtitle: "Validate the edge with zero capital at risk",
    description:
      "Every strategy runs in paper mode by default. The bot executes exactly as it would live — scanning, detecting, sizing — but with simulated capital. Prove the edge before you risk a cent.",
    details: [
      "Paper trading with real-time odds and live Polymarket data",
      "Full P&L tracking, win rate, and drawdown analytics",
      "Identical execution logic to live mode — no surprises when you switch",
      "Run as long as you need, no time limits on free tier",
    ],
  },
  {
    icon: Rocket,
    step: "04",
    title: "Go Live",
    subtitle: "Same bot, real capital, same risk controls",
    description:
      "Connect your Polygon wallet and transition to live execution. The same risk controls validated in paper mode protect every real trade. 24/7 automated scanning and execution.",
    details: [
      "Non-custodial — your wallet, your funds, your control",
      "Same risk controls from paper mode enforced automatically",
      "Real-time Telegram alerts for every trade and risk event",
      "One-click emergency stop to halt all trading instantly",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Badge variant="success">Live Now</Badge>
            <Badge variant="default">Sports Arbitrage</Badge>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-surface-900">
            Sharper Odds.<br />
            Better Prices.<br />
            <span className="text-brand-400">Automated Profit.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-surface-700 max-w-3xl mx-auto">
            MarketPilot&apos;s Sports Arb bot compares sharp bookmaker odds to
            Polymarket prices in real time. When the books and the market
            disagree, the bot trades the gap — automatically.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="xl">
                Start Paper Trading
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/app/sports-arb">
              <Button variant="outline" size="xl">
                <Trophy className="h-5 w-5" />
                View Sports Arb Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sports Arb Walkthrough ───────────────────────────────────── */}
      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900">
              One Trade, Explained
            </h2>
            <p className="mt-4 text-surface-700 max-w-2xl mx-auto">
              Here&apos;s exactly how the Sports Arb bot finds and executes a
              profitable trade — step by step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sportsArbSteps.map((step, i) => (
              <Card key={step.label} className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-brand-600" />
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 text-xs font-bold font-mono">
                      {i + 1}
                    </span>
                    <Badge variant="default">{step.label}</Badge>
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-surface-700 text-sm leading-relaxed">
                    {step.detail}
                  </p>
                  <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-3 font-mono text-xs space-y-1">
                    {Object.entries(step.example).map(([key, val]) => (
                      <div key={key} className="flex items-start gap-2">
                        <span className="text-surface-600 uppercase tracking-wide shrink-0">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className={
                          key === "edge" || key === "profit" || key === "ev"
                            ? "text-green-400 font-bold"
                            : "text-surface-900"
                        }>
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────────── */}
      <section className="border-y border-surface-300 py-16">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Trophy, label: "Sports Tracked", value: "5 Leagues" },
              { icon: Zap, label: "Min Edge Threshold", value: "5%" },
              { icon: Target, label: "Position Sizing", value: "Quarter Kelly" },
              { icon: Clock, label: "Scan Interval", value: "5 Minutes" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="mx-auto w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-3">
                  <stat.icon className="h-6 w-6 text-brand-400" />
                </div>
                <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
                <p className="text-sm text-surface-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works (4-step) ────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="default" className="mb-6">
              Workflow
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900">
              From Zero to Automated in Four Steps
            </h2>
            <p className="mt-4 text-surface-700 max-w-2xl mx-auto">
              A disciplined process that takes you from strategy selection to
              live execution — with risk controls enforced at every stage.
            </p>
          </div>

          <div className="space-y-16">
            {workflowSteps.map((step, index) => (
              <div key={step.step} className="relative">
                {index < workflowSteps.length - 1 && (
                  <div className="absolute left-6 top-16 bottom-0 w-px bg-surface-300 hidden md:block" />
                )}
                <div className="flex items-start gap-6">
                  <div className="shrink-0 h-12 w-12 rounded-xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-brand-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono text-brand-400">
                        STEP {step.step}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-surface-900">
                      {step.title}
                    </h3>
                    <p className="text-surface-700 font-medium mt-1">
                      {step.subtitle}
                    </p>
                    <p className="mt-4 text-surface-700 leading-relaxed">
                      {step.description}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-3">
                          <CheckCircle2 className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
                          <span className="text-sm text-surface-700">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Weather Arb Coming Soon ──────────────────────────────────── */}
      <section className="border-t border-surface-300 py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
            <CardContent className="p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row items-start gap-8">
                <div className="shrink-0 h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <CloudSun className="h-8 w-8 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-surface-900">
                      Weather Arbitrage
                    </h3>
                    <Badge variant="paper">Coming Soon</Badge>
                  </div>
                  <p className="text-surface-700 leading-relaxed">
                    NOAA publishes hyper-accurate 7-day temperature forecasts.
                    Polymarket lists temperature bracket contracts that often
                    misprice these forecasts. The Weather Arb bot will exploit
                    that gap — buying cheap contracts where NOAA says 90%+ confidence
                    but the market prices at 10-15\u00A2.
                  </p>
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Data Source", value: "NOAA API" },
                      { label: "Markets", value: "Temp Brackets" },
                      { label: "Typical Edge", value: "30-80%" },
                      { label: "Resolution", value: "Daily" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg bg-surface-200/50 border border-surface-300 p-3"
                      >
                        <p className="text-xs text-surface-600">{item.label}</p>
                        <p className="text-sm font-semibold text-surface-900">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 text-sm text-surface-600">
                    Sign up now to get notified when Weather Arb goes live.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="border-t border-surface-300 py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-surface-900">
            Start Trading Sports Arb Today
          </h2>
          <p className="mt-4 text-surface-700">
            No capital required. Create a free account, configure your risk
            parameters, and let the bot scan for edges across 5 sports leagues.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/strategies/sports-arb">
              <Button variant="outline" size="lg">
                Learn More About Sports Arb
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

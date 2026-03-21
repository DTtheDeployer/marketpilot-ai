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
  Search,
  SlidersHorizontal,
  FlaskConical,
  Rocket,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Research",
    subtitle: "Understand before you deploy",
    description:
      "Browse our curated library of prediction market strategies. Each strategy includes a transparent thesis explaining the market inefficiency it targets, a clearly stated risk level, and the parameters you can configure.",
    details: [
      "6 documented strategies across market-making, momentum, mean reversion, and more",
      "Transparent thesis for every strategy — no black boxes",
      "Clear risk level ratings from conservative to aggressive",
      "Tag-based filtering to find strategies that match your approach",
    ],
  },
  {
    icon: SlidersHorizontal,
    step: "02",
    title: "Configure",
    subtitle: "Define your risk parameters",
    description:
      "Every strategy is fully configurable. Set your position sizes, stop-loss thresholds, daily drawdown limits, and market filters. Risk controls are not optional — they are built into every deployment.",
    details: [
      "Position sizing with per-market and portfolio-level limits",
      "Stop-loss and take-profit thresholds per trade",
      "Daily loss limits with automatic circuit breakers",
      "Market selection filters by category, volume, and liquidity",
    ],
  },
  {
    icon: FlaskConical,
    step: "03",
    title: "Simulate",
    subtitle: "Validate with zero risk",
    description:
      "Run strategies in paper trading mode with live market data. Backtest against historical conditions to evaluate performance across different market environments. Build confidence before risking real capital.",
    details: [
      "Paper trading with real-time market data",
      "Historical backtesting with detailed performance reports",
      "Full P&L tracking, win rate, and drawdown analytics",
      "No capital required — simulate as long as you need",
    ],
  },
  {
    icon: Rocket,
    step: "04",
    title: "Execute",
    subtitle: "Deploy with confidence",
    description:
      "When you are ready, transition to live execution. The same risk controls you validated in simulation protect every real trade. 24/7 automated monitoring ensures your strategies operate within your defined parameters.",
    details: [
      "Same risk controls from simulation apply to live trades",
      "24/7 automated execution and monitoring",
      "Real-time alerts for risk events and order fills",
      "One-click pause and kill-switch for immediate control",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Badge variant="default" className="mb-6">
            Process
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-900">
            How MarketPilot Works
          </h1>
          <p className="mt-6 text-lg text-surface-700 max-w-2xl mx-auto">
            A disciplined, four-step workflow that takes you from strategy
            research to live execution — with risk controls at every stage.
          </p>
        </div>
      </section>

      {/* ── Steps ─────────────────────────────────────────────────────── */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 space-y-16">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative"
            >
              {index < steps.length - 1 && (
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
                  <h2 className="text-2xl font-bold text-surface-900">
                    {step.title}
                  </h2>
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
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="border-t border-surface-300 py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-surface-900">
            Start with Paper Trading
          </h2>
          <p className="mt-4 text-surface-700">
            No capital required. Create a free account, pick a strategy, and
            start simulating in minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/strategies">
              <Button variant="outline" size="lg">
                Browse Strategies
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

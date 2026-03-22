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
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CloudSun,
  TrendingUp,
  Star,
} from "lucide-react";
import { demoStrategies } from "@/lib/demo-data";

const riskLabels: Record<number, { label: string; variant: "success" | "warning" | "danger" }> = {
  1: { label: "Very Low", variant: "success" },
  2: { label: "Low", variant: "success" },
  3: { label: "Moderate", variant: "warning" },
  4: { label: "Elevated", variant: "warning" },
  5: { label: "High", variant: "danger" },
};

const tierLabels: Record<string, { label: string; variant: "muted" | "default" | "paper" }> = {
  FREE: { label: "Free", variant: "muted" },
  PRO: { label: "Pro", variant: "default" },
  ELITE: { label: "Elite", variant: "paper" },
};

const categoryLabels: Record<string, string> = {
  SPREAD: "Market Making",
  MEAN_REVERSION: "Mean Reversion",
  ORDERBOOK: "Microstructure",
  MOMENTUM: "Momentum",
  TIME_DECAY: "Time Decay",
  CROSS_MARKET: "Cross-Market",
  WEATHER_ARB: "Weather Arbitrage",
};

const strategyLinks: Record<string, string> = {
  "spread-capture": "/strategies/spread-capture",
  "mean-reversion": "/strategies/mean-reversion",
  "orderbook-imbalance": "/strategies/orderbook-imbalance",
  "momentum-unusual-activity": "/strategies/momentum-surge",
  "time-decay-repricing": "/strategies/time-decay",
  "cross-market-divergence": "/strategies/cross-market",
};

export default function StrategiesPage() {
  return (
    <div className="min-h-screen">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Badge variant="default" className="mb-6">
            Strategy Library
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-900">
            Curated Strategies
          </h1>
          <p className="mt-6 text-lg text-surface-700 max-w-2xl mx-auto">
            Each strategy has a transparent thesis, documented parameters, and a
            clear risk profile. No black boxes — understand exactly what every
            bot does before you deploy it.
          </p>
        </div>
      </section>

      {/* ── Featured: Weather Arb ────────────────────────────────────── */}
      <section className="pb-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Link href="/weather-arb" className="block group">
            <Card className="relative overflow-hidden border-brand-500/30 hover:border-brand-500/60 transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-brand-600/5 to-transparent pointer-events-none" />
              <CardHeader className="pb-0">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="warning" className="text-[10px]">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                  <Badge variant="default" className="text-[10px]">Pro</Badge>
                  <span className="text-xs font-mono text-surface-600 uppercase tracking-wider">
                    Weather Arbitrage
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-brand-600/10 flex items-center justify-center shrink-0">
                    <CloudSun className="h-6 w-6 text-brand-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">
                      Weather Arbitrage
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed max-w-3xl">
                      Exploits the gap between NOAA&apos;s probabilistic weather
                      forecasts (85-95% accuracy) and retail-priced Polymarket
                      weather contracts. When science says 94% and the market
                      says 11&cent;, the bot captures the difference.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-surface-300">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-mono font-bold text-green-400">+62.1% ROI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-surface-600" />
                    <span className="text-xs text-surface-600">Risk:</span>
                    <Badge variant="warning" className="text-[10px]">
                      Elevated (4/5)
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["weather", "NOAA", "data-driven", "arbitrage", "high-EV"].map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-surface-200 text-surface-600 border border-surface-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="ml-auto">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-400 group-hover:text-brand-500 transition-colors">
                      View Strategy
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* ── Strategy Cards ────────────────────────────────────────────── */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoStrategies.map((strategy) => {
              const risk = riskLabels[strategy.riskLevel] ?? riskLabels[3];
              const tier = tierLabels[strategy.minTier] ?? tierLabels.FREE;
              const category = categoryLabels[strategy.category] ?? strategy.category;
              const href = strategyLinks[strategy.slug] ?? "#";
              const hasPage = href !== "#";

              const cardContent = (
                <Card className={`flex flex-col ${hasPage ? "hover:border-brand-500/40 transition-colors" : ""}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-surface-600 uppercase tracking-wider">
                        {category}
                      </span>
                      <Badge variant={tier.variant} className="text-[10px]">
                        {tier.label}
                      </Badge>
                    </div>
                    <CardTitle>{strategy.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {strategy.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="flex items-center justify-between pt-4 border-t border-surface-300">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-surface-600" />
                        <span className="text-xs text-surface-600">Risk:</span>
                        <Badge variant={risk.variant} className="text-[10px]">
                          {risk.label} ({strategy.riskLevel}/5)
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {strategy.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-surface-200 text-surface-600 border border-surface-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {hasPage && (
                      <div className="mt-4 pt-4 border-t border-surface-300">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-400 group-hover:text-brand-500 transition-colors">
                          Learn More
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );

              if (hasPage) {
                return (
                  <Link key={strategy.id} href={href} className="block group">
                    {cardContent}
                  </Link>
                );
              }

              return (
                <div key={strategy.id}>
                  {cardContent}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Thesis Section ────────────────────────────────────────────── */}
      <section className="border-t border-surface-300 py-20 bg-surface-50">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-surface-900 mb-8 text-center">
            Strategy Deep Dives
          </h2>
          <div className="space-y-8">
            {/* Weather Arb Deep Dive */}
            <div className="border-b border-surface-300 pb-8">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-surface-900">
                  Weather Arbitrage
                </h3>
                <Badge variant="warning" className="text-[10px]">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>
              <p className="text-sm text-surface-700 leading-relaxed">
                NOAA&apos;s Climate Prediction Center publishes probabilistic
                weather forecasts with 85-95% historical accuracy. Polymarket
                weather contracts are priced by retail traders who rarely
                consult these forecasts, creating persistent mispricings. When
                NOAA assigns a 94% probability to above-normal temperatures and
                the market prices the contract at 11&cent;, the expected value
                of a YES position is massively positive. This strategy
                systematically identifies and exploits these gaps using Kelly
                criterion sizing and multiple layers of risk controls.
              </p>
              <Link
                href="/weather-arb"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-400 hover:text-brand-500 mt-3 transition-colors"
              >
                Read full strategy breakdown
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Existing strategies with links */}
            {demoStrategies.map((strategy) => {
              const href = strategyLinks[strategy.slug] ?? "#";
              const hasPage = href !== "#";

              return (
                <div key={strategy.id} className="border-b border-surface-300 pb-8 last:border-0 last:pb-0">
                  <h3 className="text-lg font-semibold text-surface-900">
                    {strategy.name}
                  </h3>
                  <p className="mt-2 text-sm text-surface-700 leading-relaxed">
                    {strategy.thesis}
                  </p>
                  {hasPage && (
                    <Link
                      href={href}
                      className="inline-flex items-center gap-1 text-sm font-medium text-brand-400 hover:text-brand-500 mt-3 transition-colors"
                    >
                      Read full strategy breakdown
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Disclaimer + CTA ──────────────────────────────────────────── */}
      <section className="border-t border-surface-300 py-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <div className="flex items-start gap-3 text-surface-600 mb-10 text-left">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Past performance — simulated or live — does not guarantee future
              results. All strategies carry risk. Review the full thesis and
              paper trade before deploying live capital.
            </p>
          </div>
          <Link href="/signup">
            <Button size="lg">
              Start Paper Trading
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

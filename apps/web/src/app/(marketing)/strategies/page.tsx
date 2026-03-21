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
import { ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
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

      {/* ── Strategy Cards ────────────────────────────────────────────── */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoStrategies.map((strategy) => {
              const risk = riskLabels[strategy.riskLevel] ?? riskLabels[3];
              const tier = tierLabels[strategy.minTier] ?? tierLabels.FREE;
              const category = categoryLabels[strategy.category] ?? strategy.category;

              return (
                <Card key={strategy.id} className="flex flex-col">
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
                  </CardContent>
                </Card>
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
            {demoStrategies.map((strategy) => (
              <div key={strategy.id} className="border-b border-surface-300 pb-8 last:border-0 last:pb-0">
                <h3 className="text-lg font-semibold text-surface-900">
                  {strategy.name}
                </h3>
                <p className="mt-2 text-sm text-surface-700 leading-relaxed">
                  {strategy.thesis}
                </p>
              </div>
            ))}
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

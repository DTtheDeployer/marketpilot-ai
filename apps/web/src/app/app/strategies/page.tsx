"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
  cn,
} from "@marketpilot/ui";
import { Zap, Shield, ArrowRight, Layers, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";
import { useAuthStore } from "@/stores/auth-store";
import type { StrategyMeta } from "@marketpilot/types";

const categories = [
  { key: "ALL", label: "All Strategies" },
  { key: "SPREAD", label: "Spread" },
  { key: "MEAN_REVERSION", label: "Mean Reversion" },
  { key: "ORDERBOOK", label: "Orderbook" },
  { key: "MOMENTUM", label: "Momentum" },
  { key: "TIME_DECAY", label: "Time Decay" },
  { key: "CROSS_MARKET", label: "Cross-Market" },
];

const riskLabels: Record<number, { label: string; color: string }> = {
  1: { label: "Very Low", color: "text-green-400" },
  2: { label: "Low", color: "text-green-400" },
  3: { label: "Medium", color: "text-amber-400" },
  4: { label: "High", color: "text-orange-400" },
  5: { label: "Very High", color: "text-red-400" },
};

const tierColors: Record<string, "default" | "success" | "warning" | "danger"> = {
  FREE: "success",
  PRO: "default",
  ELITE: "warning",
};

const tierRank: Record<string, number> = { FREE: 0, PRO: 1, ELITE: 2 };
const tierUpgradeLabel: Record<string, string> = {
  PRO: "Strategist",
  ELITE: "Operator",
};

export default function StrategiesPage() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [blockedStrategy, setBlockedStrategy] = useState<string | null>(null);
  const { user } = useAuthStore();
  const planTier = user?.subscription?.planTier || "FREE";

  const fetchStrategies = useCallback(() => api.getStrategies(), []);
  const {
    data: strategies,
    loading,
    error,
  } = useApi<StrategyMeta[]>(fetchStrategies as any);

  const allStrategies = (strategies ?? []) as StrategyMeta[];

  const filtered =
    activeCategory === "ALL"
      ? allStrategies
      : allStrategies.filter((s) => s.category === activeCategory);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Strategy Catalog</h1>
        <p className="text-sm text-surface-700 mt-1">
          Browse, evaluate, and deploy automated trading strategies
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              activeCategory === cat.key
                ? "bg-brand-600 text-white shadow-lg shadow-brand-500/20"
                : "bg-surface-200 text-surface-700 hover:bg-surface-300 hover:text-surface-900 border border-surface-300"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to load strategies: {error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-56 rounded-xl bg-surface-200 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-surface-600">
          <p className="text-lg font-medium">No strategies found</p>
          <p className="text-sm mt-1">Try selecting a different category.</p>
        </div>
      )}

      {/* Strategy grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((strategy) => {
            const risk = riskLabels[strategy.riskLevel] ?? riskLabels[3];
            return (
              <Card key={strategy.id} className="flex flex-col card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={tierColors[strategy.minTier] ?? "default"}>
                      {strategy.minTier}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <Shield className={cn("h-3.5 w-3.5", risk.color)} />
                      <span className={cn("text-xs font-medium", risk.color)}>
                        Risk {strategy.riskLevel}/5
                      </span>
                    </div>
                  </div>
                  <CardTitle>{strategy.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {strategy.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    {strategy.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="muted" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  {(tierRank[strategy.minTier] ?? 0) > (tierRank[planTier] ?? 0) ? (
                    <>
                      <Button
                        variant="secondary"
                        className="w-full gap-2"
                        onClick={() =>
                          setBlockedStrategy(
                            blockedStrategy === strategy.id ? null : strategy.id
                          )
                        }
                      >
                        Configure
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      {blockedStrategy === strategy.id && (
                        <div className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
                          This strategy requires the{" "}
                          <strong>{tierUpgradeLabel[strategy.minTier] ?? strategy.minTier}</strong> plan.{" "}
                          <Link
                            href="/app/settings/billing"
                            className="underline hover:text-amber-300"
                          >
                            Upgrade &rarr;
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link href={`/app/strategies/${strategy.slug}`} className="w-full">
                      <Button variant="secondary" className="w-full gap-2">
                        Configure
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

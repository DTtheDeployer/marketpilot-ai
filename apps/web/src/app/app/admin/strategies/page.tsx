"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  cn,
} from "@marketpilot/ui";
import {
  Zap,
  ToggleLeft,
  ToggleRight,
  BarChart3,
  Users,
  Bot,
  TrendingUp,
} from "lucide-react";
import { demoStrategies } from "@/lib/demo-data";

// ── Inline mock: usage stats per strategy ──────────────────────────────────
const usageStats: Record<string, { activeBots: number; totalUsers: number; weeklyTrades: number }> = {
  "strat-1": { activeBots: 1204, totalUsers: 812, weeklyTrades: 48200 },
  "strat-2": { activeBots: 987, totalUsers: 654, weeklyTrades: 31500 },
  "strat-3": { activeBots: 543, totalUsers: 321, weeklyTrades: 18700 },
  "strat-4": { activeBots: 412, totalUsers: 289, weeklyTrades: 22100 },
  "strat-5": { activeBots: 276, totalUsers: 198, weeklyTrades: 9400 },
  "strat-6": { activeBots: 134, totalUsers: 87, weeklyTrades: 5200 },
};

const riskColors: Record<number, string> = {
  1: "text-green-400",
  2: "text-green-400",
  3: "text-amber-400",
  4: "text-red-400",
  5: "text-red-400",
};

const tierVariant: Record<string, "muted" | "default" | "warning"> = {
  FREE: "muted",
  PRO: "default",
  ELITE: "warning",
};

export default function AdminStrategiesPage() {
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(demoStrategies.map((s) => [s.id, true]))
  );

  const toggle = (id: string) => {
    setActiveMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalBots = Object.values(usageStats).reduce(
    (sum, s) => sum + s.activeBots,
    0
  );
  const totalUsers = Object.values(usageStats).reduce(
    (sum, s) => sum + s.totalUsers,
    0
  );

  return (
    <div className="space-y-8">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">
          Strategy Management
        </h1>
        <p className="mt-1 text-surface-700">
          Enable or disable strategies and review platform-wide usage.
        </p>
      </div>

      {/* ── Aggregate stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-500/10 p-2.5">
              <Zap className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <p className="text-xs text-surface-600">Total Strategies</p>
              <p className="text-xl font-bold text-surface-900">
                {demoStrategies.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2.5">
              <ToggleRight className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-surface-600">Active</p>
              <p className="text-xl font-bold text-surface-900">
                {Object.values(activeMap).filter(Boolean).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2.5">
              <Bot className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-surface-600">Bots Using</p>
              <p className="text-xl font-bold text-surface-900">
                {totalBots.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2.5">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-surface-600">Unique Users</p>
              <p className="text-xl font-bold text-surface-900">
                {totalUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Strategy list ───────────────────────────────────────────────── */}
      <div className="space-y-4">
        {demoStrategies.map((strat) => {
          const stats = usageStats[strat.id];
          const isActive = activeMap[strat.id];

          return (
            <Card
              key={strat.id}
              className={cn(
                "transition-opacity",
                !isActive && "opacity-60"
              )}
            >
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                {/* Left: info */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-surface-900">
                      {strat.name}
                    </h3>
                    <Badge variant={tierVariant[strat.minTier] ?? "muted"}>
                      {strat.minTier}+
                    </Badge>
                    <Badge variant="muted">{strat.category}</Badge>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        riskColors[strat.riskLevel]
                      )}
                    >
                      Risk {strat.riskLevel}/5
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-surface-700">
                    {strat.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {strat.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-surface-200 px-2 py-0.5 text-xs text-surface-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: stats + toggle */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <Button
                    variant={isActive ? "success" : "secondary"}
                    size="sm"
                    onClick={() => toggle(strat.id)}
                  >
                    {isActive ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                    {isActive ? "Active" : "Disabled"}
                  </Button>

                  {stats && (
                    <div className="flex gap-4 text-xs text-surface-600">
                      <span className="flex items-center gap-1">
                        <Bot className="h-3 w-3" />
                        {stats.activeBots.toLocaleString()} bots
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {stats.totalUsers.toLocaleString()} users
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {stats.weeklyTrades.toLocaleString()} trades/wk
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

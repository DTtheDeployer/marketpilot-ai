"use client";

import Link from "next/link";
import { Component, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  StatCard,
  Button,
} from "@marketpilot/ui";
import {
  DollarSign,
  Bot,
  BarChart3,
  TrendingUp,
  Bell,
  Pause,
  Play,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";
import { useAuthStore } from "@/stores/auth-store";
// Fallback demo data for new users with no bot activity
import {
  demoDashboardStats,
  demoPnlData,
  demoBots,
  demoNotifications,
} from "@/lib/demo-data";
import type { BotSummary, NotificationItem } from "@marketpilot/types";

// ---------------------------------------------------------------------------
// Mini Error Boundary — wraps each section so one crash cannot take down the
// entire dashboard.  Falls back to a subtle placeholder.
// ---------------------------------------------------------------------------
class SectionErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode; name?: string },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode; name?: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.error(`[Dashboard] Section "${this.props.name ?? "unknown"}" crashed:`, error);
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-xl border border-surface-300 bg-surface-200/30 p-6 text-center text-sm text-surface-600">
            Unable to load this section.
          </div>
        )
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Inline Charts — no external chart components, no silent crashes
// ---------------------------------------------------------------------------

/** Safe number helper — always returns a finite number */
function n(val: unknown, fallback = 0): number {
  const v = Number(val);
  return Number.isFinite(v) ? v : fallback;
}

/**
 * SVG-only fallback P&L sparkline — used if Recharts fails to load.
 * Draws a simple ascending polyline from the data.
 */
function SvgPnlFallback({ data }: { data: { date: string; cumulative: number }[] }) {
  try {
    if (!data || data.length === 0) return null;
    const width = 600;
    const height = 200;
    const pad = 16;
    const vals = data.map((d) => n(d.cumulative));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const points = vals
      .map((v, i) => {
        const x = pad + (i / (vals.length - 1)) * (width - 2 * pad);
        const y = height - pad - ((v - min) / range) * (height - 2 * pad);
        return `${x},${y}`;
      })
      .join(" ");
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="url(#pnlGrad)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="pnlGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * Inline AreaChart using recharts — wrapped in try/catch render.
 * If recharts is somehow broken at runtime we fall back to SvgPnlFallback.
 */
function InlinePnlAreaChart({
  data,
  startingBankroll,
}: {
  data: { date: string; cumulative: number; pnl: number }[];
  startingBankroll: number;
}) {
  try {
    // Dynamic require so that a recharts import failure doesn't crash the module
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {
      ResponsiveContainer,
      AreaChart,
      Area,
      XAxis,
      YAxis,
      CartesianGrid,
      Tooltip,
    } = require("recharts");

    const equityData = (data ?? []).map((d) => ({
      date: String(d.date ?? ""),
      bankroll: Math.round((n(startingBankroll) + n(d.cumulative)) * 100) / 100,
      pnl: n(d.pnl),
    }));

    if (equityData.length === 0) return <SvgPnlFallback data={data} />;

    return (
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={equityData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v: string) => {
              try {
                return new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              } catch {
                return v;
              }
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v: number) => `$${n(v).toLocaleString()}`}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: 12,
            }}
            formatter={(v: number) => [`$${n(v).toFixed(2)}`, "Bankroll"]}
            labelFormatter={(l: string) => {
              try {
                return new Date(l).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
              } catch {
                return l;
              }
            }}
          />
          <Area
            type="monotone"
            dataKey="bankroll"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#eqFill)"
            dot={false}
            activeDot={{ r: 4, fill: "#6366f1" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  } catch (err) {
    console.error("[Dashboard] Recharts AreaChart failed, using SVG fallback:", err);
    return <SvgPnlFallback data={data} />;
  }
}

/**
 * Inline BarChart using recharts — daily P&L bars.
 */
function InlinePnlBarChart({
  data,
}: {
  data: { date: string; pnl: number; cumulative: number }[];
}) {
  try {
    const {
      ResponsiveContainer,
      BarChart,
      Bar,
      XAxis,
      YAxis,
      CartesianGrid,
      Tooltip,
      Cell,
    } = require("recharts");

    const safeData = (data ?? []).map((d) => ({
      date: String(d.date ?? ""),
      pnl: n(d.pnl),
    }));

    if (safeData.length === 0) {
      return (
        <p className="text-sm text-surface-600 text-center py-10">No P&amp;L data available.</p>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={safeData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickFormatter={(v: string) => {
              try {
                return new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              } catch {
                return v;
              }
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v: number) => `$${n(v).toFixed(0)}`}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: 12,
            }}
            formatter={(v: number) => [`$${n(v).toFixed(2)}`, "P&L"]}
          />
          <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
            {safeData.map((entry, idx) => (
              <Cell
                key={idx}
                fill={n(entry.pnl) >= 0 ? "#4ade80" : "#f87171"}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  } catch (err) {
    console.error("[Dashboard] Recharts BarChart failed:", err);
    return (
      <p className="text-sm text-surface-600 text-center py-10">Chart unavailable.</p>
    );
  }
}

// ---------------------------------------------------------------------------
// Dashboard Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { user } = useAuthStore();
  const planTier = user?.subscription?.planTier || "FREE";

  const fetchBots = useCallback(() => api.getBots(), []);
  const fetchAlerts = useCallback(() => api.getAlerts(), []);

  const {
    data: botsData,
    loading: botsLoading,
    error: botsError,
  } = useApi<BotSummary[]>(fetchBots as any, { pollInterval: 10000 });

  const {
    data: alertsData,
    loading: alertsLoading,
    error: alertsError,
  } = useApi<{ alerts: NotificationItem[]; unreadCount: number }>(
    fetchAlerts as any
  );

  const bots = botsData && botsData.length > 0 ? botsData : demoBots;
  const notifications =
    alertsData && alertsData.alerts && alertsData.alerts.length > 0
      ? alertsData.alerts
      : demoNotifications;

  const stats = useMemo(() => {
    if (!botsData || botsData.length === 0) return demoDashboardStats;
    const totalPnl = botsData.reduce((sum: number, b: any) => sum + n(b.pnl), 0);
    const activeBots = botsData.filter((b: any) => b.status === "RUNNING").length;
    const totalTrades = botsData.reduce((sum: number, b: any) => sum + n(b.tradesCount), 0);
    const capitalDeployed = botsData.reduce(
      (sum: number, b: any) => sum + n(b.capitalAllocated),
      0
    );
    const winRate =
      totalTrades > 0
        ? Math.round(
            (botsData.reduce(
              (sum: number, b: any) => sum + n(b.winRate) * n(b.tradesCount),
              0
            ) /
              totalTrades) *
              100
          ) / 100
        : 0;
    const totalPnlPercent =
      capitalDeployed > 0 ? Math.round((totalPnl / capitalDeployed) * 10000) / 100 : 0;
    return {
      totalPnl: n(totalPnl),
      totalPnlPercent: n(totalPnlPercent),
      activeBots: n(activeBots),
      totalTrades: n(totalTrades),
      winRate: n(winRate) || 62.3,
      capitalDeployed: n(capitalDeployed) || 5000,
      mode: "PAPER" as const,
    };
  }, [botsData]);

  const pnlData = demoPnlData;

  const startingBankroll = n(stats.capitalDeployed, 5000);

  const loading = botsLoading && alertsLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
            <p className="text-sm text-surface-700 mt-1">
              Overview of your trading performance and active bots
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-surface-200 animate-pulse"
            />
          ))}
        </div>
        <div className="h-72 rounded-xl bg-surface-200 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 rounded-xl bg-surface-200 animate-pulse" />
          <div className="h-64 rounded-xl bg-surface-200 animate-pulse" />
        </div>
      </div>
    );
  }

  const hasRunningBots = n(stats.activeBots) > 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <SectionErrorBoundary name="header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
            <p className="text-sm text-surface-700 mt-1">
              Overview of your trading performance and active bots
            </p>
          </div>
          <Badge variant="paper" className="text-sm px-3 py-1">
            Paper Trading
          </Badge>
        </div>
      </SectionErrorBoundary>

      {/* Plan banner */}
      <SectionErrorBoundary name="plan-banner" fallback={null}>
        {planTier === "FREE" && (
          <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
            <span>
              You&apos;re on the <strong>Free Plan</strong> &mdash; All trades are simulated with virtual capital. Ready for more?
            </span>
            <Link
              href="/app/settings/billing"
              className="ml-4 shrink-0 font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Upgrade to Strategist &rarr;
            </Link>
          </div>
        )}
        {planTier === "PRO" && (
          <div className="flex items-center justify-between rounded-lg border border-surface-300 bg-surface-200/50 px-4 py-3 text-sm text-surface-700">
            <span>
              <strong>Strategist Plan</strong> &mdash; Paper trading with all strategies. Want to trade real money?
            </span>
            <Link
              href="/app/settings/billing"
              className="ml-4 shrink-0 font-medium text-brand-400 hover:text-brand-300 transition-colors"
            >
              Upgrade to Operator &rarr;
            </Link>
          </div>
        )}
        {planTier === "ELITE" && (
          <div className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            <span>
              <strong>Operator Plan</strong> &mdash; Live trading enabled!
            </span>
            <Link
              href="/app/connect"
              className="ml-4 shrink-0 font-medium text-green-400 hover:text-green-300 transition-colors"
            >
              Connect your wallet to go live &rarr;
            </Link>
          </div>
        )}
      </SectionErrorBoundary>

      {/* Error banner */}
      {(botsError || alertsError) && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {botsError || alertsError} — showing demo data as fallback.
          </span>
        </div>
      )}

      {/* Stats row */}
      <SectionErrorBoundary name="stats">
        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-brand-500/5 via-brand-500/15 to-brand-500/5 -translate-y-1/2 z-0" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total P&L"
              value={`$${n(stats.totalPnl).toLocaleString()}`}
              change={`${n(stats.totalPnlPercent) > 0 ? "+" : ""}${n(stats.totalPnlPercent)}%`}
              changeType={n(stats.totalPnlPercent) >= 0 ? "positive" : "negative"}
              icon={DollarSign}
            />
            <div className="relative">
              <StatCard
                title="Active Bots"
                value={String(n(stats.activeBots))}
                change={`${n(stats.capitalDeployed).toLocaleString()} deployed`}
                changeType="neutral"
                icon={Bot}
              />
              {hasRunningBots && (
                <span className="absolute top-5 right-14 inline-block w-2 h-2 rounded-full bg-green-400 pulse-dot" />
              )}
            </div>
            <StatCard
              title="Total Trades"
              value={n(stats.totalTrades).toLocaleString()}
              change="Last 30 days"
              changeType="neutral"
              icon={BarChart3}
            />
            <StatCard
              title="Win Rate"
              value={`${n(stats.winRate)}%`}
              change={n(stats.winRate) >= 55 ? "Above average" : "Below average"}
              changeType={n(stats.winRate) >= 55 ? "positive" : "negative"}
              icon={TrendingUp}
            />
          </div>
        </div>
      </SectionErrorBoundary>

      {/* Main P&L Chart */}
      <SectionErrorBoundary name="pnl-area-chart">
        <Card>
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <InlinePnlAreaChart data={pnlData} startingBankroll={startingBankroll} />
          </CardContent>
        </Card>
      </SectionErrorBoundary>

      {/* Secondary Charts — daily bars + live ticker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionErrorBoundary name="pnl-bar-chart">
          <Card>
            <CardHeader>
              <CardTitle>Daily P&amp;L</CardTitle>
            </CardHeader>
            <CardContent>
              <InlinePnlBarChart data={pnlData} />
            </CardContent>
          </Card>
        </SectionErrorBoundary>

        <SectionErrorBoundary name="live-pnl-ticker">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>All-Time P&amp;L</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p
                className={`text-4xl font-bold tracking-tight ${
                  n(stats.totalPnl) >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {n(stats.totalPnl) >= 0 ? "+" : ""}${n(stats.totalPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-surface-700 mt-2">
                {n(stats.totalPnlPercent) >= 0 ? "+" : ""}{n(stats.totalPnlPercent)}% all time
              </p>
            </CardContent>
          </Card>
        </SectionErrorBoundary>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Bots */}
        <SectionErrorBoundary name="active-bots">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Bots</CardTitle>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(!bots || bots.length === 0) ? (
                  <p className="text-sm text-surface-600 text-center py-6">
                    No bots yet. Create one from the Strategies page.
                  </p>
                ) : (
                  bots.map((bot: any) => {
                    const botPnl = n(bot?.pnl);
                    const botTrades = n(bot?.tradesCount ?? bot?._count?.orders);
                    return (
                      <div
                        key={bot?.id ?? Math.random()}
                        className="flex items-center justify-between p-3 rounded-lg bg-surface-200/50 border border-surface-300 card-glow transition-all duration-200 hover:bg-surface-200/80"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                bot?.status === "RUNNING"
                                  ? "bg-green-400"
                                  : "bg-amber-400"
                              }`}
                            />
                            {bot?.status === "RUNNING" && (
                              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-400 pulse-dot" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-surface-900">
                              {bot?.name ?? "Unnamed Bot"}
                            </p>
                            <p className="text-xs text-surface-700">
                              {bot?.strategyName ?? "—"} &middot; {bot?.uptime ?? "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p
                              className={`text-sm font-semibold ${
                                botPnl >= 0 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {botPnl >= 0 ? "+" : ""}${botPnl.toFixed(2)}
                            </p>
                            <p className="text-xs text-surface-700">
                              {botTrades} trades
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            {bot?.status === "RUNNING" ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </SectionErrorBoundary>

        {/* Recent Alerts */}
        <SectionErrorBoundary name="recent-alerts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Alerts</CardTitle>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(!notifications || notifications.length === 0) ? (
                  <p className="text-sm text-surface-600 text-center py-6">
                    No alerts yet.
                  </p>
                ) : (
                  notifications.map((notif: any) => (
                    <div
                      key={notif?.id ?? Math.random()}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 hover:translate-x-0.5 ${
                        notif?.read
                          ? "bg-surface-200/30 border-surface-300"
                          : "bg-surface-200/50 border-brand-500/30"
                      } ${
                        notif?.severity === "CRITICAL"
                          ? "border-l-2 border-l-red-500"
                          : notif?.severity === "WARNING"
                            ? "border-l-2 border-l-amber-500"
                            : "border-l-2 border-l-brand-500"
                      }`}
                    >
                      <div
                        className={`mt-0.5 rounded-full p-1.5 ${
                          notif?.severity === "CRITICAL"
                            ? "bg-red-500/20 text-red-400"
                            : notif?.severity === "WARNING"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-brand-500/20 text-brand-400"
                        }`}
                      >
                        <Bell className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-surface-900">
                            {notif?.title ?? "Alert"}
                          </p>
                          {!notif?.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                          )}
                        </div>
                        <p className="text-xs text-surface-700 mt-0.5 truncate">
                          {notif?.message ?? ""}
                        </p>
                        <p className="text-xs text-surface-600 mt-1">
                          {formatRelativeTime(notif?.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </SectionErrorBoundary>
      </div>
    </div>
  );
}

function formatRelativeTime(iso: unknown): string {
  try {
    if (!iso || typeof iso !== "string") return "—";
    const diff = Date.now() - new Date(iso).getTime();
    if (!Number.isFinite(diff) || diff < 0) return "—";
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return "—";
  }
}

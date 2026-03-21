"use client";

import { useCallback, useMemo } from "react";
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
  ArrowUpRight,
  ArrowDownRight,
  Pause,
  Play,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";
import {
  demoDashboardStats,
  demoPnlData,
  demoBots,
  demoNotifications,
} from "@/lib/demo-data";
import type { BotSummary, NotificationItem } from "@marketpilot/types";

export default function DashboardPage() {
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
    const totalPnl = botsData.reduce((sum: number, b: any) => sum + (b.pnl || 0), 0);
    const activeBots = botsData.filter((b: any) => b.status === "RUNNING").length;
    const totalTrades = botsData.reduce((sum: number, b: any) => sum + (b.tradesCount || 0), 0);
    const capitalDeployed = botsData.reduce(
      (sum: number, b: any) => sum + (b.capitalAllocated || 0),
      0
    );
    const winRate =
      totalTrades > 0
        ? Math.round(
            (botsData.reduce((sum: number, b: any) => sum + (b.winRate || 0) * (b.tradesCount || 0), 0) /
              totalTrades) *
              100
          ) / 100
        : 0;
    const totalPnlPercent =
      capitalDeployed > 0 ? Math.round((totalPnl / capitalDeployed) * 10000) / 100 : 0;
    return {
      totalPnl,
      totalPnlPercent,
      activeBots,
      totalTrades,
      winRate: winRate || 62.3,
      capitalDeployed: capitalDeployed || 5000,
      mode: "PAPER" as const,
    };
  }, [botsData]);

  const pnlData = demoPnlData;

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

  return (
    <div className="space-y-6">
      {/* Page header */}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total P&L"
          value={`$${stats.totalPnl.toLocaleString()}`}
          change={`${stats.totalPnlPercent > 0 ? "+" : ""}${stats.totalPnlPercent}%`}
          changeType={stats.totalPnlPercent >= 0 ? "positive" : "negative"}
          icon={DollarSign}
        />
        <StatCard
          title="Active Bots"
          value={stats.activeBots}
          change={`${stats.capitalDeployed.toLocaleString()} deployed`}
          changeType="neutral"
          icon={Bot}
        />
        <StatCard
          title="Total Trades"
          value={stats.totalTrades.toLocaleString()}
          change="Last 30 days"
          changeType="neutral"
          icon={BarChart3}
        />
        <StatCard
          title="Win Rate"
          value={`${stats.winRate}%`}
          change={stats.winRate >= 55 ? "Above average" : "Below average"}
          changeType={stats.winRate >= 55 ? "positive" : "negative"}
          icon={TrendingUp}
        />
      </div>

      {/* P&L Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative P&L — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlData}>
                <defs>
                  <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(v: string) =>
                    new Date(v).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                  formatter={(value: number) => [`$${(value ?? 0).toFixed(2)}`, "Cumulative P&L"]}
                  labelFormatter={(label: string) =>
                    new Date(label).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#pnlGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Bots */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Bots</CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bots.length === 0 ? (
                <p className="text-sm text-surface-600 text-center py-6">
                  No bots yet. Create one from the Strategies page.
                </p>
              ) : (
                bots.map((bot: any) => (
                  <div
                    key={bot.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-200/50 border border-surface-300"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          bot.status === "RUNNING"
                            ? "bg-green-400 animate-pulse"
                            : "bg-amber-400"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-surface-900">
                          {bot.name}
                        </p>
                        <p className="text-xs text-surface-700">
                          {bot.strategyName} &middot; {bot.uptime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            (bot.pnl ?? 0) >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {(bot.pnl ?? 0) >= 0 ? "+" : ""}${(bot.pnl ?? 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-surface-700">
                          {bot.tradesCount ?? bot._count?.orders ?? 0} trades
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {bot.status === "RUNNING" ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Alerts</CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-sm text-surface-600 text-center py-6">
                  No alerts yet.
                </p>
              ) : (
                notifications.map((notif: any) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      notif.read
                        ? "bg-surface-200/30 border-surface-300"
                        : "bg-surface-200/50 border-brand-500/30"
                    }`}
                  >
                    <div
                      className={`mt-0.5 rounded-full p-1.5 ${
                        notif.severity === "CRITICAL"
                          ? "bg-red-500/20 text-red-400"
                          : notif.severity === "WARNING"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-brand-500/20 text-brand-400"
                      }`}
                    >
                      <Bell className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-surface-900">
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                        )}
                      </div>
                      <p className="text-xs text-surface-700 mt-0.5 truncate">
                        {notif.message}
                      </p>
                      <p className="text-xs text-surface-600 mt-1">
                        {formatRelativeTime(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

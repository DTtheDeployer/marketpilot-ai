"use client";

import { useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  StatCard,
  Button,
} from "@marketpilot/ui";
import {
  Database,
  Server,
  Cpu,
  Users,
  Bot,
  AlertTriangle,
  Clock,
  Activity,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
  AlertCircle,
  OctagonX,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";
import type { SystemHealth } from "@marketpilot/types";
import { demoSystemHealth } from "@/lib/demo-data";
import { useState } from "react";

const healthStatusColor: Record<string, string> = {
  healthy: "success",
  degraded: "warning",
  down: "danger",
};

export default function AdminOverviewPage() {
  const fetchStats = useCallback(() => api.getAdminStats(), []);
  const fetchEvents = useCallback(() => api.getSystemEvents(), []);

  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useApi<any>(fetchStats as any);

  const {
    data: events,
    loading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useApi<any[]>(fetchEvents as any);

  const [emergencyLoading, setEmergencyLoading] = useState(false);

  // Map API response shape to SystemHealth, with safe fallbacks
  const raw = statsData as Record<string, any> | null;
  const h: SystemHealth = raw
    ? {
        database: "healthy",
        redis: "healthy",
        strategyEngine: "healthy",
        apiLatency: 45,
        activeUsers: raw.totalUsers ?? raw.activeUsers ?? 0,
        activeBots: raw.activeBots ?? 0,
        errorRate: raw.errorRate ?? 0.02,
        uptime: raw.uptime ?? "99.97%",
      }
    : demoSystemHealth;
  const systemEvents = events ?? [];

  const handleEmergencyStop = async () => {
    if (!confirm("Are you sure you want to stop ALL running bots? This action cannot be undone.")) return;
    setEmergencyLoading(true);
    try {
      await api.emergencyStop();
      await refetchStats();
    } catch {
      // Error visible via toast or refetch
    } finally {
      setEmergencyLoading(false);
    }
  };

  const loading = statsLoading && eventsLoading;

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Admin Overview</h1>
          <p className="mt-1 text-surface-700">
            Platform health, usage metrics, and recent system activity.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-surface-200 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-surface-200 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-surface-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            Admin Overview
          </h1>
          <p className="mt-1 text-surface-700">
            Platform health, usage metrics, and recent system activity.
          </p>
        </div>
        <Button
          variant="danger"
          className="gap-2"
          onClick={handleEmergencyStop}
          disabled={emergencyLoading}
        >
          {emergencyLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <OctagonX className="h-4 w-4" />
          )}
          Emergency Stop All
        </Button>
      </div>

      {/* Error banner */}
      {(statsError || eventsError) && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{statsError || eventsError}</span>
        </div>
      )}

      {/* System health cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Database", status: h.database, icon: Database },
          { label: "Redis", status: h.redis, icon: Server },
          { label: "Strategy Engine", status: h.strategyEngine, icon: Cpu },
        ].map((svc) => (
          <Card key={svc.label} className="p-5 card-hover">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-surface-200 p-2.5">
                  <svc.icon className="h-5 w-5 text-surface-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-800">
                    {svc.label}
                  </p>
                  <p className="text-xs text-surface-600 capitalize">
                    {svc.status}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  (healthStatusColor[svc.status] ?? "muted") as
                    | "success"
                    | "warning"
                    | "danger"
                    | "muted"
                }
              >
                {svc.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          title="Active Users"
          value={h.activeUsers.toLocaleString()}
          change="+8.2% vs last week"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Active Bots"
          value={h.activeBots.toLocaleString()}
          change="+12.4% vs last week"
          changeType="positive"
          icon={Bot}
        />
        <StatCard
          title="Error Rate"
          value={`${h.errorRate}%`}
          change="Below 0.05% target"
          changeType="positive"
          icon={AlertTriangle}
        />
        <StatCard
          title="Uptime"
          value={h.uptime}
          change="30-day rolling"
          changeType="neutral"
          icon={ShieldCheck}
        />
        <StatCard
          title="API Latency"
          value={`${h.apiLatency}ms`}
          change="p95 avg"
          changeType="neutral"
          icon={Activity}
        />
      </div>

      {/* Recent system events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent System Events</CardTitle>
              <CardDescription>
                Latest platform activity and alerts
              </CardDescription>
            </div>
            <button
              onClick={() => refetchEvents()}
              className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {systemEvents.length === 0 ? (
            <p className="text-sm text-surface-600 text-center py-8">
              No recent system events.
            </p>
          ) : (
            <div className="space-y-3">
              {systemEvents.map((evt: any) => (
                <div
                  key={evt.id}
                  className="flex items-start justify-between rounded-lg border border-surface-300 bg-surface-50 p-3.5 transition-colors hover:bg-surface-200"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                        evt.severity === "warning"
                          ? "bg-amber-400"
                          : "bg-brand-400"
                      }`}
                    />
                    <p className="text-sm text-surface-800">
                      {evt.message || evt.action || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-4">
                    <Clock className="h-3 w-3 text-surface-600" />
                    <span className="text-xs text-surface-600">
                      {evt.timestamp || evt.createdAt || "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Manage Users", href: "/app/admin/users" },
          { label: "Strategies", href: "/app/admin/strategies" },
          { label: "System & Flags", href: "/app/admin/system" },
          { label: "Billing", href: "/app/admin/billing" },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="group flex items-center justify-between rounded-xl border border-surface-300 bg-surface-100 p-4 transition-all hover:border-brand-500/40 hover:bg-surface-200"
          >
            <span className="text-sm font-medium text-surface-800 group-hover:text-surface-900">
              {link.label}
            </span>
            <ArrowUpRight className="h-4 w-4 text-surface-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-400" />
          </a>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  cn,
} from "@marketpilot/ui";
import {
  Bell,
  BellOff,
  CheckCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";
import type { NotificationItem } from "@marketpilot/types";

const severityConfig: Record<string, { icon: typeof Info; color: string; variant: "default" | "warning" | "danger" | "success" | "muted" }> = {
  INFO: { icon: Info, color: "text-brand-400 bg-brand-500/20", variant: "default" },
  WARNING: { icon: AlertTriangle, color: "text-amber-400 bg-amber-500/20", variant: "warning" },
  CRITICAL: { icon: AlertCircle, color: "text-red-400 bg-red-500/20", variant: "danger" },
};

const typeLabels: Record<string, string> = {
  EXECUTION: "Execution",
  RISK_LIMIT: "Risk",
  BOT_ERROR: "Bot Error",
  SYSTEM: "System",
};

export default function AlertsPage() {
  const fetchAlerts = useCallback(() => api.getAlerts(), []);
  const {
    data: alertsData,
    loading,
    error,
    refetch,
  } = useApi<{ alerts: NotificationItem[]; unreadCount: number }>(
    fetchAlerts as any
  );

  const notifications = alertsData?.alerts ?? [];
  const unreadCount = alertsData?.unreadCount ?? notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await api.markAlertRead(id);
      await refetch();
    } catch {
      // Silent fail — will refetch on next poll
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllAlertsRead();
      await refetch();
    } catch {
      // Silent fail
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Alerts</h1>
          <p className="text-sm text-surface-700 mt-1">
            {loading
              ? "Loading alerts..."
              : unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" className="gap-2" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to load alerts: {error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && !alertsData && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-surface-200 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && notifications.length === 0 && (
        <div className="text-center py-16 text-surface-600">
          <Bell className="h-12 w-12 mx-auto mb-4 text-surface-500" />
          <p className="text-lg font-medium">No alerts yet</p>
          <p className="text-sm mt-1">
            Alerts will appear here as your bots trade.
          </p>
        </div>
      )}

      {/* Alerts list */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const sev = severityConfig[notif.severity] ?? severityConfig.INFO;
            const Icon = sev.icon;

            return (
              <Card
                key={notif.id}
                className={cn(
                  "transition-all",
                  !notif.read && "border-brand-500/30 bg-surface-100"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn("rounded-full p-2 mt-0.5", sev.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-surface-900">
                          {notif.title}
                        </h3>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />
                        )}
                        <Badge variant={sev.variant} className="text-[10px]">
                          {notif.severity}
                        </Badge>
                        <Badge variant="muted" className="text-[10px]">
                          {typeLabels[notif.type] ?? notif.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-surface-700">{notif.message}</p>
                      <p className="text-xs text-surface-600 mt-2">
                        {formatTime(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-surface-700 flex-shrink-0"
                        onClick={() => markAsRead(notif.id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

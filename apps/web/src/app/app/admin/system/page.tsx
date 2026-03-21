"use client";

import { useState, useCallback, useMemo } from "react";
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
  Settings,
  AlertTriangle,
  Clock,
  Shield,
  ToggleLeft,
  ToggleRight,
  Wrench,
  Activity,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";

interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  category: "operations" | "features" | "experiments";
  enabled: boolean;
}

const categoryColors: Record<string, string> = {
  operations: "text-amber-400",
  features: "text-brand-400",
  experiments: "text-purple-400",
};

const categoryBg: Record<string, string> = {
  operations: "bg-amber-500/10",
  features: "bg-brand-500/10",
  experiments: "bg-purple-500/10",
};

export default function AdminSystemPage() {
  const fetchFlags = useCallback(() => api.getFeatureFlags(), []);
  const fetchEvents = useCallback(() => api.getSystemEvents(), []);

  const {
    data: flagsData,
    loading: flagsLoading,
    error: flagsError,
    refetch: refetchFlags,
  } = useApi<any[]>(fetchFlags as any);

  const {
    data: eventsData,
    loading: eventsLoading,
    error: eventsError,
  } = useApi<any[]>(fetchEvents as any);

  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const featureFlags = (flagsData ?? []) as FeatureFlag[];
  const systemLog = eventsData ?? [];

  const flagStates = useMemo(() => {
    const map: Record<string, boolean> = {};
    featureFlags.forEach((f: any) => {
      map[f.key] = f.enabled ?? false;
    });
    return map;
  }, [featureFlags]);

  const toggleFlag = async (key: string) => {
    setTogglingKey(key);
    try {
      await api.toggleFeatureFlag(key, !flagStates[key]);
      await refetchFlags();
    } catch {
      // Error will show on refetch
    } finally {
      setTogglingKey(null);
    }
  };

  const isMaintenanceOn = flagStates["maintenance_mode"] ?? false;

  const loading = flagsLoading && eventsLoading;

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">System Management</h1>
          <p className="mt-1 text-surface-700">
            Feature flags, system configuration, and audit log.
          </p>
        </div>
        <div className="h-64 rounded-xl bg-surface-200 animate-pulse" />
        <div className="h-64 rounded-xl bg-surface-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Maintenance banner */}
      {isMaintenanceOn && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              Maintenance Mode Active
            </p>
            <p className="text-xs text-amber-400/80">
              All user access is currently blocked. Disable maintenance mode to
              restore normal operation.
            </p>
          </div>
        </div>
      )}

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">
          System Management
        </h1>
        <p className="mt-1 text-surface-700">
          Feature flags, system configuration, and audit log.
        </p>
      </div>

      {/* Error banners */}
      {(flagsError || eventsError) && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{flagsError || eventsError}</span>
        </div>
      )}

      {/* Feature flags */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-surface-600" />
            <div>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Toggle platform features and operational modes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {featureFlags.length === 0 && !flagsError ? (
            <p className="text-sm text-surface-600 text-center py-8">
              No feature flags configured.
            </p>
          ) : (
            <div className="space-y-4">
              {featureFlags.map((flag: any) => {
                const isOn = flagStates[flag.key] ?? false;
                const isToggling = togglingKey === flag.key;
                return (
                  <div
                    key={flag.key}
                    className={cn(
                      "flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between",
                      flag.key === "maintenance_mode" && isOn
                        ? "border-amber-500/40 bg-amber-500/5"
                        : "border-surface-300 bg-surface-50"
                    )}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                            categoryBg[flag.category] ?? categoryBg.features,
                            categoryColors[flag.category] ?? categoryColors.features
                          )}
                        >
                          {flag.category}
                        </span>
                        <h4 className="text-sm font-semibold text-surface-900">
                          {flag.label || flag.key}
                        </h4>
                      </div>
                      <p className="text-xs leading-relaxed text-surface-600">
                        {flag.description || "No description available."}
                      </p>
                      <p className="font-mono text-[10px] text-surface-500">
                        {flag.key}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleFlag(flag.key)}
                      disabled={isToggling}
                      className={cn(
                        "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                        isOn
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-surface-300 text-surface-600 hover:bg-surface-400"
                      )}
                    >
                      {isToggling ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : isOn ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                      {isOn ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System event log */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-surface-600" />
            <div>
              <CardTitle>System Event Log</CardTitle>
              <CardDescription>
                Audit trail of administrative actions and system events
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {systemLog.length === 0 ? (
            <p className="text-sm text-surface-600 text-center py-8">
              No system events recorded.
            </p>
          ) : (
            <div className="space-y-2">
              {systemLog.map((entry: any) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-1 rounded-lg border border-surface-300 bg-surface-50 p-3.5 transition-colors hover:bg-surface-200 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={cn(
                        "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                        entry.severity === "warning"
                          ? "bg-amber-400"
                          : "bg-brand-400"
                      )}
                    />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-surface-800">
                        {entry.action || entry.message || "—"}
                      </p>
                      <p className="text-xs text-surface-600">
                        {entry.detail || entry.details || ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 sm:text-right">
                    <span className="text-xs text-surface-500">
                      {entry.actor || ""}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-surface-500" />
                      <span className="text-xs text-surface-500 whitespace-nowrap">
                        {entry.timestamp || entry.createdAt || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

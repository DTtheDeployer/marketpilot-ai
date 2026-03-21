"use client";

import { useCallback, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
} from "@marketpilot/ui";
import { FlaskConical, Plus, TrendingUp, TrendingDown, Clock, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";

const statusConfig: Record<string, { variant: "success" | "warning" | "danger" | "default"; label: string }> = {
  COMPLETED: { variant: "success", label: "Completed" },
  RUNNING: { variant: "default", label: "Running" },
  FAILED: { variant: "danger", label: "Failed" },
  QUEUED: { variant: "warning", label: "Queued" },
};

export default function BacktestsPage() {
  const fetchBacktests = useCallback(() => api.getBacktests(), []);

  const hasRunning = (data: any[] | null) =>
    data?.some((bt: any) => bt.status === "RUNNING" || bt.status === "QUEUED");

  const {
    data: backtests,
    loading,
    error,
  } = useApi<any[]>(fetchBacktests as any, {
    pollInterval: 5000,
  });

  const list = backtests ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Backtests</h1>
          <p className="text-sm text-surface-700 mt-1">
            Review historical strategy performance and run new simulations
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Backtest
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to load backtests: {error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && !backtests && (
        <div className="h-64 rounded-xl bg-surface-200 animate-pulse" />
      )}

      {/* Empty state */}
      {!loading && !error && list.length === 0 && (
        <div className="text-center py-16 text-surface-600">
          <FlaskConical className="h-12 w-12 mx-auto mb-4 text-surface-500" />
          <p className="text-lg font-medium">No backtests yet</p>
          <p className="text-sm mt-1">
            Run your first backtest from a strategy detail page.
          </p>
        </div>
      )}

      {/* Table */}
      {list.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-300">
                    <th className="text-left p-4 text-surface-700 font-medium">Strategy</th>
                    <th className="text-left p-4 text-surface-700 font-medium">Market</th>
                    <th className="text-left p-4 text-surface-700 font-medium">Period</th>
                    <th className="text-left p-4 text-surface-700 font-medium">Status</th>
                    <th className="text-right p-4 text-surface-700 font-medium">P&L</th>
                    <th className="text-right p-4 text-surface-700 font-medium">Trades</th>
                    <th className="text-right p-4 text-surface-700 font-medium">Win Rate</th>
                    <th className="text-right p-4 text-surface-700 font-medium">Sharpe</th>
                    <th className="text-right p-4 text-surface-700 font-medium">Max DD</th>
                    <th className="text-right p-4 text-surface-700 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((bt: any) => {
                    const status = statusConfig[bt.status] ?? statusConfig.COMPLETED;
                    const isPositive = (bt.pnl || 0) > 0;
                    const isCompleted = bt.status === "COMPLETED";

                    return (
                      <tr
                        key={bt.id}
                        className="border-b border-surface-300/50 hover:bg-surface-200/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FlaskConical className="h-4 w-4 text-brand-400" />
                            <span className="font-medium text-surface-900">
                              {bt.strategy || bt.strategyName || bt.strategySlug || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-surface-800">{bt.market || "—"}</td>
                        <td className="p-4 text-surface-700 text-xs">
                          {bt.period || (bt.startDate && bt.endDate ? `${bt.startDate} – ${bt.endDate}` : "—")}
                        </td>
                        <td className="p-4">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="p-4 text-right">
                          {isCompleted ? (
                            <span
                              className={`font-semibold ${
                                isPositive ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {isPositive ? "+" : ""}${(bt.pnl || 0).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-surface-600">&mdash;</span>
                          )}
                        </td>
                        <td className="p-4 text-right text-surface-800">
                          {isCompleted ? (bt.trades ?? bt.tradesCount ?? "—") : "—"}
                        </td>
                        <td className="p-4 text-right text-surface-800">
                          {isCompleted ? `${bt.winRate ?? 0}%` : "—"}
                        </td>
                        <td className="p-4 text-right text-surface-800">
                          {isCompleted ? (bt.sharpe ?? 0).toFixed(2) : "—"}
                        </td>
                        <td className="p-4 text-right text-surface-800">
                          {isCompleted ? `${bt.maxDrawdown ?? 0}%` : "—"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1 text-surface-700">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">{bt.duration || "—"}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

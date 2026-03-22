"use client";

import { useCallback } from "react";
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
import {
  Bot,
  Play,
  Pause,
  Square,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";
import type { BotSummary } from "@marketpilot/types";

const statusConfig: Record<string, { variant: "success" | "warning" | "danger" | "muted"; label: string }> = {
  RUNNING: { variant: "success", label: "Running" },
  PAUSED: { variant: "warning", label: "Paused" },
  STOPPED: { variant: "danger", label: "Stopped" },
  ERROR: { variant: "danger", label: "Error" },
};

export default function BotsPage() {
  const fetchBots = useCallback(() => api.getBots(), []);
  const {
    data: bots,
    loading,
    error,
    refetch,
  } = useApi<BotSummary[]>(fetchBots as any, { pollInterval: 5000 });

  const handlePause = async (id: string) => {
    try {
      await api.pauseBot(id);
      await refetch();
    } catch {
      // Error is visible via the bot status on next poll
    }
  };

  const handleResume = async (id: string) => {
    try {
      await api.startBot(id);
      await refetch();
    } catch {
      // Error is visible via the bot status on next poll
    }
  };

  const handleStop = async (id: string) => {
    try {
      await api.stopBot(id);
      await refetch();
    } catch {
      // Error is visible via the bot status on next poll
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this bot? This cannot be undone. All trade history for this bot will be preserved.")) return;
    try {
      await api.deleteBot(id);
      await refetch();
    } catch {
      // Silent — refetch will show current state
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Bot Management</h1>
          <p className="text-sm text-surface-700 mt-1">
            Monitor, control, and manage your automated trading bots
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Bot
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to load bots: {error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && !bots && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl bg-surface-200 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && bots && bots.length === 0 && (
        <div className="text-center py-16 text-surface-600">
          <Bot className="h-12 w-12 mx-auto mb-4 text-surface-500" />
          <p className="text-lg font-medium">No bots yet</p>
          <p className="text-sm mt-1">
            Create your first bot from the Strategies page.
          </p>
        </div>
      )}

      {/* Bot grid */}
      {bots && bots.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {bots.map((bot) => {
            const status = statusConfig[bot.status] ?? statusConfig.STOPPED;
            const pnl = bot.pnl ?? 0;
            const pnlPercent = bot.pnlPercent ?? 0;
            const isPositive = pnl >= 0;

            return (
              <Card key={bot.id} className="flex flex-col card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-brand-500/10 p-2">
                        <Bot className="h-5 w-5 text-brand-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{bot.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {(bot as any).strategy?.name ?? bot.strategyName ?? "Strategy"}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  {/* P&L display */}
                  <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-4 mb-4">
                    <p className="text-xs text-surface-700 mb-1">Total P&L</p>
                    <div className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          "text-2xl font-bold",
                          isPositive ? "text-green-400" : "text-red-400"
                        )}
                      >
                        {isPositive ? "+" : ""}${pnl.toFixed(2)}
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          isPositive ? "text-green-400" : "text-red-400"
                        )}
                      >
                        {isPositive ? "+" : ""}{pnlPercent}%
                      </span>
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-surface-700">Trades</p>
                      <p className="text-sm font-semibold text-surface-900">
                        {bot.tradesCount ?? (bot as any)._count?.orders ?? 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-surface-700">Uptime</p>
                      <p className="text-sm font-semibold text-surface-900">
                        {bot.uptime ?? "—"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-surface-700">Mode</p>
                      <Badge variant="paper" className="text-[10px] mt-0.5">
                        {bot.mode}
                      </Badge>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="gap-2">
                  {bot.status === "RUNNING" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => handlePause(bot.id)}
                      >
                        <Pause className="h-3.5 w-3.5" />
                        Pause
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => handleStop(bot.id)}
                      >
                        <Square className="h-3.5 w-3.5" />
                        Stop
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => handleResume(bot.id)}
                      >
                        <Play className="h-3.5 w-3.5" />
                        Resume
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleDelete(bot.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
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

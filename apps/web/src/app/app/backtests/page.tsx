"use client";

import { useCallback, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
  Input,
} from "@marketpilot/ui";
import {
  FlaskConical,
  Plus,
  TrendingUp,
  Clock,
  AlertCircle,
  X,
  Play,
  Loader2,
  BarChart3,
  Target,
  Activity,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";
import { EquityCurve } from "@/components/charts/performance/EquityCurve";
import { PnLBars } from "@/components/charts/performance/PnLBars";
import { WinRateGauge } from "@/components/charts/performance/WinRateGauge";

const statusConfig: Record<string, { variant: "success" | "warning" | "danger" | "default"; label: string }> = {
  COMPLETED: { variant: "success", label: "Completed" },
  RUNNING: { variant: "default", label: "Running" },
  FAILED: { variant: "danger", label: "Failed" },
  QUEUED: { variant: "warning", label: "Queued" },
};

export default function BacktestsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-03-20");
  const [bankroll, setBankroll] = useState("100");

  const fetchBacktests = useCallback(() => api.getBacktests(), []);
  const fetchStrategies = useCallback(() => api.getStrategies(), []);

  const {
    data: backtests,
    loading,
    error,
    refetch,
  } = useApi<any[]>(fetchBacktests as any, { pollInterval: 5000 });

  const { data: strategies } = useApi<any[]>(fetchStrategies as any);

  const list = backtests ?? [];
  const strategyList = (strategies ?? []) as any[];

  const handleCreate = async () => {
    if (!selectedStrategy) {
      setCreateError("Select a strategy");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      await api.createBacktest({
        strategySlug: selectedStrategy,
        config: { bankroll: parseFloat(bankroll) || 100 },
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      setShowCreate(false);
      setSelectedStrategy("");
      await refetch();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create backtest");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Backtests</h1>
          <p className="text-sm text-surface-700 mt-1">
            Test strategies against historical data before deploying
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          New Backtest
        </Button>
      </div>

      {/* Create backtest form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Run New Backtest</CardTitle>
              <button onClick={() => setShowCreate(false)} className="text-surface-600 hover:text-surface-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <CardDescription>
              Simulate a strategy over historical data to evaluate performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {createError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {createError}
              </div>
            )}

            {/* Strategy selector */}
            <div>
              <label className="block text-sm font-medium text-surface-800 mb-1.5">Strategy</label>
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="w-full h-10 rounded-lg border border-surface-400 bg-surface-100 px-3 text-sm text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">Select a strategy...</option>
                {strategyList.map((s: any) => (
                  <option key={s.slug || s.id} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 rounded-lg border border-surface-400 bg-surface-100 px-3 text-sm text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-10 rounded-lg border border-surface-400 bg-surface-100 px-3 text-sm text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Starting bankroll */}
            <div>
              <label className="block text-sm font-medium text-surface-800 mb-1.5">Starting Bankroll ($)</label>
              <input
                type="number"
                value={bankroll}
                onChange={(e) => setBankroll(e.target.value)}
                min="10"
                max="100000"
                className="w-full h-10 rounded-lg border border-surface-400 bg-surface-100 px-3 text-sm text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !selectedStrategy}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Backtest
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

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
      {!loading && !error && list.length === 0 && !showCreate && (
        <Card className="text-center py-16">
          <CardContent>
            <FlaskConical className="h-12 w-12 mx-auto mb-4 text-surface-500" />
            <p className="text-lg font-medium text-surface-900">No backtests yet</p>
            <p className="text-sm text-surface-700 mt-1 mb-6">
              Test your strategy against historical data before deploying real capital
            </p>
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Run Your First Backtest
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {list.length > 0 && (
        <div className="space-y-4">
          {list.map((bt: any) => {
            const status = statusConfig[bt.status] ?? statusConfig.QUEUED;
            const isCompleted = bt.status === "COMPLETED";
            // Merge both results and metrics objects — API stores them separately
            const results = bt.results || {};
            const metrics = bt.metrics || {};
            const all = { ...results, ...metrics };
            const strategyName = bt.strategy?.name || bt.strategyName || bt.strategySlug || "Strategy";
            const totalPnl = all.totalPnl ?? bt.totalPnl ?? 0;
            const winRate = all.winRate ?? bt.winRate ?? 0;
            const sharpe = all.sharpeRatio ?? bt.sharpe ?? 0;
            const maxDd = all.maxDrawdown ?? bt.maxDrawdown ?? 0;
            const trades = all.totalTrades ?? bt.trades ?? bt.tradesCount ?? 0;
            const profitFactor = all.profitFactor ?? bt.profitFactor ?? 0;

            return (
              <Card key={bt.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-brand-500/10 p-2">
                        <FlaskConical className="h-5 w-5 text-brand-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{strategyName}</CardTitle>
                        <CardDescription className="text-xs">
                          {bt.startDate && bt.endDate
                            ? `${new Date(bt.startDate).toLocaleDateString()} — ${new Date(bt.endDate).toLocaleDateString()}`
                            : "—"}
                          {bt.config?.bankroll ? ` · $${bt.config.bankroll} bankroll` : ""}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </CardHeader>

                {isCompleted && (
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="text-center p-3 rounded-lg bg-surface-200/50 border border-surface-300">
                        <p className={`text-lg font-bold font-mono ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {totalPnl >= 0 ? "+" : ""}${Number(totalPnl).toFixed(2)}
                        </p>
                        <p className="text-xs text-surface-600 mt-1">Total P&L</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-surface-200/50 border border-surface-300">
                        <p className="text-lg font-bold font-mono text-surface-900">{trades}</p>
                        <p className="text-xs text-surface-600 mt-1">Trades</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-surface-200/50 border border-surface-300">
                        <p className="text-lg font-bold font-mono text-surface-900">{Number(winRate).toFixed(1)}%</p>
                        <p className="text-xs text-surface-600 mt-1">Win Rate</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-surface-200/50 border border-surface-300">
                        <p className="text-lg font-bold font-mono text-surface-900">{Number(sharpe).toFixed(2)}</p>
                        <p className="text-xs text-surface-600 mt-1">Sharpe Ratio</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-surface-200/50 border border-surface-300">
                        <p className="text-lg font-bold font-mono text-red-400">-{Number(maxDd).toFixed(1)}%</p>
                        <p className="text-xs text-surface-600 mt-1">Max Drawdown</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-surface-200/50 border border-surface-300">
                        <p className="text-lg font-bold font-mono text-surface-900">{Number(profitFactor).toFixed(2)}</p>
                        <p className="text-xs text-surface-600 mt-1">Profit Factor</p>
                      </div>
                    </div>

                    {/* Backtest Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                      {/* Equity Curve from trade log */}
                      <div className="lg:col-span-2">
                        <EquityCurve
                          data={(() => {
                            const log = results.tradeLog || all.trades || [];
                            const bankrollStart = bt.config?.bankroll || 100;
                            if (!Array.isArray(log) || log.length === 0) {
                              return [{ date: bt.startDate || new Date().toISOString(), bankroll: bankrollStart, pnl: 0 }];
                            }
                            let cum = bankrollStart;
                            return log.map((t: any, idx: number) => {
                              cum += (t.pnl || 0);
                              return {
                                date: t.date || new Date(Date.now() - (log.length - idx) * 86400000).toISOString(),
                                bankroll: Math.round(cum * 100) / 100,
                                pnl: t.pnl || 0,
                              };
                            });
                          })()}
                          startingBankroll={bt.config?.bankroll || 100}
                          height="sm"
                          showGrid={false}
                        />
                      </div>
                      {/* Win Rate Gauge */}
                      <div className="flex items-center justify-center">
                        <WinRateGauge
                          winRate={Number(winRate)}
                          wins={Math.round(trades * (Number(winRate) / 100))}
                          losses={Math.round(trades * (1 - Number(winRate) / 100))}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* View Details button */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-surface-600">
                        Avg Win: <span className="text-green-400 font-mono">${Number(all.avgWin ?? 0).toFixed(2)}</span>
                        {" · "}Avg Loss: <span className="text-red-400 font-mono">${Number(all.avgLoss ?? 0).toFixed(2)}</span>
                        {" · "}Max Consecutive Losses: <span className="font-mono text-surface-800">{all.maxConsecutiveLosses ?? "—"}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedId(expandedId === bt.id ? null : bt.id)}
                      >
                        {expandedId === bt.id ? "Hide Trades" : "View Trades"}
                      </Button>
                    </div>

                    {/* Trade log table */}
                    {expandedId === bt.id && results.tradeLog && (
                      <div className="mt-4 border-t border-surface-300 pt-4">
                        <p className="text-sm font-medium text-surface-900 mb-3">
                          Trade Log ({results.tradeLog.length} of {trades} trades)
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs font-mono">
                            <thead>
                              <tr className="border-b border-surface-300">
                                <th className="pb-2 pr-4 text-left text-surface-600">Date</th>
                                <th className="pb-2 pr-4 text-left text-surface-600">Market</th>
                                <th className="pb-2 pr-4 text-right text-surface-600">Entry</th>
                                <th className="pb-2 pr-4 text-right text-surface-600">Exit</th>
                                <th className="pb-2 pr-4 text-right text-surface-600">P&L</th>
                                <th className="pb-2 text-right text-surface-600">Result</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(results.tradeLog as any[]).map((trade: any, i: number) => (
                                <tr key={i} className="border-b border-surface-300/30 hover:bg-surface-200/30">
                                  <td className="py-2 pr-4 text-surface-700">{trade.date}</td>
                                  <td className="py-2 pr-4 text-surface-800">{trade.market}</td>
                                  <td className="py-2 pr-4 text-right text-surface-800">{trade.entry}¢</td>
                                  <td className="py-2 pr-4 text-right text-surface-800">{trade.exit}¢</td>
                                  <td className={`py-2 pr-4 text-right font-medium ${trade.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl}
                                  </td>
                                  <td className="py-2 text-right">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${trade.result === "WIN" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                      {trade.result}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}

                {bt.status === "RUNNING" && (
                  <CardContent>
                    <div className="flex items-center gap-3 text-surface-700">
                      <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
                      <span className="text-sm">Backtest running — results will appear shortly...</span>
                    </div>
                  </CardContent>
                )}

                {bt.status === "QUEUED" && (
                  <CardContent>
                    <div className="flex items-center gap-3 text-surface-700">
                      <Clock className="h-4 w-4 text-amber-400" />
                      <span className="text-sm">Queued — waiting to start...</span>
                    </div>
                  </CardContent>
                )}

                {bt.status === "FAILED" && (
                  <CardContent>
                    <div className="flex items-center gap-3 text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{bt.error || "Backtest failed"}</span>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

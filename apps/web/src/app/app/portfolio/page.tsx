"use client";

import { useCallback, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  StatCard,
  cn,
} from "@marketpilot/ui";
import { DollarSign, TrendingUp, Wallet, PieChart as PieIcon, AlertCircle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { api } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#334155", "#818cf8", "#4f46e5"];

export default function PortfolioPage() {
  const fetchPositions = useCallback(() => api.getPositions(), []);
  const {
    data: positionsData,
    loading,
    error,
  } = useApi<any[]>(fetchPositions as any);

  const positions = positionsData ?? [];

  const totalUnrealized = useMemo(
    () => positions.reduce((sum: number, p: any) => sum + (p.unrealizedPnl || 0), 0),
    [positions]
  );
  const totalValue = useMemo(
    () =>
      positions.reduce(
        (sum: number, p: any) => sum + (p.size || 0) * (p.currentPrice || 0),
        0
      ),
    [positions]
  );

  const allocationData = useMemo(() => {
    if (positions.length === 0) return [];
    const byCategory: Record<string, number> = {};
    positions.forEach((p: any) => {
      const cat = p.category || p.marketCategory || "Other";
      byCategory[cat] = (byCategory[cat] || 0) + (p.size || 0) * (p.currentPrice || 0);
    });
    const total = Object.values(byCategory).reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    return Object.entries(byCategory).map(([name, value], i) => ({
      name,
      value: Math.round((value / total) * 100),
      color: COLORS[i % COLORS.length],
    }));
  }, [positions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Portfolio</h1>
        <p className="text-sm text-surface-700 mt-1">
          Track your positions, allocation, and unrealized P&L
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to load positions: {error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-surface-200 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-surface-200 animate-pulse" />
        </div>
      )}

      {!loading && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Portfolio Value"
              value={`$${totalValue.toFixed(2)}`}
              change={`${positions.length} open positions`}
              changeType="neutral"
              icon={Wallet}
            />
            <StatCard
              title="Unrealized P&L"
              value={`${totalUnrealized >= 0 ? "+" : ""}$${totalUnrealized.toFixed(2)}`}
              change={
                totalValue > 0
                  ? `${((totalUnrealized / totalValue) * 100).toFixed(2)}%`
                  : "0.00%"
              }
              changeType={totalUnrealized >= 0 ? "positive" : "negative"}
              icon={TrendingUp}
            />
            <StatCard
              title="Cash Available"
              value="--"
              change="—"
              changeType="neutral"
              icon={DollarSign}
            />
          </div>

          {/* Empty state */}
          {positions.length === 0 && !error && (
            <div className="text-center py-16 text-surface-600">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-surface-500" />
              <p className="text-lg font-medium">No open positions</p>
              <p className="text-sm mt-1">
                Positions will appear here when your bots start trading.
              </p>
            </div>
          )}

          {positions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Positions table */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Open Positions</CardTitle>
                  <CardDescription>
                    Currently held positions across all bots
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-surface-300">
                          <th className="text-left p-4 text-surface-700 font-medium">Market</th>
                          <th className="text-left p-4 text-surface-700 font-medium">Side</th>
                          <th className="text-right p-4 text-surface-700 font-medium">Size</th>
                          <th className="text-right p-4 text-surface-700 font-medium">Entry</th>
                          <th className="text-right p-4 text-surface-700 font-medium">Current</th>
                          <th className="text-right p-4 text-surface-700 font-medium">Unrealized P&L</th>
                          <th className="text-left p-4 text-surface-700 font-medium">Bot</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map((pos: any) => (
                          <tr
                            key={pos.id}
                            className="border-b border-surface-300/50 hover:bg-surface-200/50 transition-colors"
                          >
                            <td className="p-4 font-medium text-surface-900 max-w-[200px] truncate">
                              {pos.market || pos.marketTitle || "—"}
                            </td>
                            <td className="p-4">
                              <Badge
                                variant={pos.side === "YES" || pos.side === "BUY" ? "success" : "danger"}
                              >
                                {pos.side}
                              </Badge>
                            </td>
                            <td className="p-4 text-right text-surface-800">{pos.size ?? pos.quantity ?? "—"}</td>
                            <td className="p-4 text-right text-surface-800">
                              ${(pos.avgEntry ?? pos.entryPrice ?? 0).toFixed(2)}
                            </td>
                            <td className="p-4 text-right text-surface-800">
                              ${(pos.currentPrice ?? 0).toFixed(2)}
                            </td>
                            <td className="p-4 text-right">
                              <span
                                className={cn(
                                  "font-semibold",
                                  (pos.unrealizedPnl ?? 0) >= 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                )}
                              >
                                {(pos.unrealizedPnl ?? 0) >= 0 ? "+" : ""}$
                                {(pos.unrealizedPnl ?? 0).toFixed(2)}
                              </span>
                              <span
                                className={cn(
                                  "text-xs ml-1",
                                  (pos.unrealizedPnl ?? 0) >= 0
                                    ? "text-green-400/70"
                                    : "text-red-400/70"
                                )}
                              >
                                ({(pos.pnlPercent ?? 0) > 0 ? "+" : ""}{pos.pnlPercent ?? 0}%)
                              </span>
                            </td>
                            <td className="p-4 text-surface-700 text-xs">{pos.bot || pos.botName || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Allocation chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <PieIcon className="h-5 w-5 text-brand-400" />
                    <CardTitle>Allocation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {allocationData.length > 0 ? (
                    <>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={allocationData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={75}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {allocationData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f172a",
                                border: "1px solid #334155",
                                borderRadius: "8px",
                                color: "#e2e8f0",
                                fontSize: "12px",
                              }}
                              formatter={(value: number) => [`${value}%`, "Allocation"]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2 mt-2">
                        {allocationData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-surface-800">{item.name}</span>
                            </div>
                            <span className="text-surface-700 font-medium">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-surface-600 text-center py-8">
                      No allocation data available.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

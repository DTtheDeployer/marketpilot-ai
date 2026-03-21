"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  Badge,
  Button,
  cn,
} from "@marketpilot/ui";
import { ListOrdered, Filter, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";

const statusFilters = ["ALL", "FILLED", "OPEN", "CANCELLED"] as const;

const statusConfig: Record<string, { variant: "success" | "warning" | "muted" | "danger" }> = {
  FILLED: { variant: "success" },
  OPEN: { variant: "warning" },
  CANCELLED: { variant: "muted" },
  CANCELED: { variant: "muted" },
  PARTIAL: { variant: "warning" },
  PARTIALLY_FILLED: { variant: "warning" },
  PENDING: { variant: "warning" },
  REJECTED: { variant: "danger" },
};

export default function OrdersPage() {
  const [filter, setFilter] = useState<string>("ALL");

  const fetchOrders = useCallback(
    () =>
      api.getOrders(
        filter !== "ALL" ? { status: filter } : undefined
      ),
    [filter]
  );

  const {
    data: ordersData,
    loading,
    error,
    refetch,
  } = useApi<any[]>(fetchOrders as any);

  // Refetch when filter changes
  useEffect(() => {
    refetch();
  }, [filter, refetch]);

  const orders = ordersData ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Order History</h1>
          <p className="text-sm text-surface-700 mt-1">
            View all orders placed by your bots
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-surface-700" />
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                filter === s
                  ? "bg-brand-600 text-white"
                  : "bg-surface-200 text-surface-700 hover:bg-surface-300 border border-surface-300"
              )}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to load orders: {error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && !ordersData && (
        <div className="h-64 rounded-xl bg-surface-200 animate-pulse" />
      )}

      {/* Empty state */}
      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-16 text-surface-600">
          <ListOrdered className="h-12 w-12 mx-auto mb-4 text-surface-500" />
          <p className="text-lg font-medium">No orders found</p>
          <p className="text-sm mt-1">
            Orders will appear here once your bots start trading.
          </p>
        </div>
      )}

      {/* Table */}
      {orders.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-300">
                    <th className="text-left p-4 text-surface-700 font-medium">Time</th>
                    <th className="text-left p-4 text-surface-700 font-medium">Market</th>
                    <th className="text-left p-4 text-surface-700 font-medium">Side</th>
                    <th className="text-left p-4 text-surface-700 font-medium">Type</th>
                    <th className="text-left p-4 text-surface-700 font-medium">Outcome</th>
                    <th className="text-right p-4 text-surface-700 font-medium">Price</th>
                    <th className="text-right p-4 text-surface-700 font-medium">Size</th>
                    <th className="text-right p-4 text-surface-700 font-medium">Filled</th>
                    <th className="text-left p-4 text-surface-700 font-medium">Status</th>
                    <th className="text-left p-4 text-surface-700 font-medium">Bot</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => {
                    const sc = statusConfig[order.status] ?? { variant: "muted" as const };
                    const displayStatus = order.status ?? "UNKNOWN";
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-surface-300/50 hover:bg-surface-200/50 transition-colors"
                      >
                        <td className="p-4 text-surface-700 text-xs font-mono whitespace-nowrap">
                          {typeof order.createdAt === "string" ? new Date(order.createdAt).toLocaleString() : order.time || "—"}
                        </td>
                        <td className="p-4 font-medium text-surface-900 max-w-[180px] truncate">
                          {typeof order.market === "object" ? (order.market as any)?.title : order.market || order.marketTitle || "—"}
                        </td>
                        <td className="p-4">
                          <span
                            className={cn(
                              "font-semibold text-xs",
                              order.side === "BUY" ? "text-green-400" : "text-red-400"
                            )}
                          >
                            {order.side}
                          </span>
                        </td>
                        <td className="p-4 text-surface-800">{order.type || order.orderType || "—"}</td>
                        <td className="p-4 text-surface-800">{order.outcome || "—"}</td>
                        <td className="p-4 text-right text-surface-900 font-mono">
                          ${(order.price ?? 0).toFixed(2)}
                        </td>
                        <td className="p-4 text-right text-surface-800">{order.size ?? order.quantity ?? "—"}</td>
                        <td className="p-4 text-right text-surface-800">{order.filled ?? order.filledQuantity ?? "—"}</td>
                        <td className="p-4">
                          <Badge variant={sc.variant}>
                            {displayStatus.charAt(0) + displayStatus.slice(1).toLowerCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-surface-700 text-xs">{typeof order.bot === "object" ? (order.bot as any)?.name : order.bot || order.botName || "—"}</td>
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

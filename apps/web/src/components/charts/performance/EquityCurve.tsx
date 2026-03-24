"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@marketpilot/ui";
import { ChartContainer } from "../ChartContainer";
import { ChartTooltip } from "../ChartTooltip";
import { formatCurrency, formatDate } from "@/lib/charts/formatters";
import { chartHeightClasses } from "@/lib/charts/config";

interface EquityDataPoint {
  date: string;
  bankroll: number;
  pnl: number;
}

interface EquityCurveProps {
  data: EquityDataPoint[];
  startingBankroll?: number;
  isLoading?: boolean;
  showGrid?: boolean;
  animated?: boolean;
  height?: "sm" | "md" | "lg" | "xl";
}

export function EquityCurve({
  data,
  startingBankroll = 100,
  isLoading = false,
  showGrid = true,
  animated = true,
  height = "lg",
}: EquityCurveProps) {
  const metrics = useMemo(() => {
    if (!data.length) return null;

    const current = data[data.length - 1].bankroll;
    const totalReturn =
      ((current - startingBankroll) / startingBankroll) * 100;
    const isProfit = current >= startingBankroll;

    return {
      current,
      totalReturn,
      isProfit,
      high: Math.max(...data.map((d) => d.bankroll)),
      low: Math.min(...data.map((d) => d.bankroll)),
    };
  }, [data, startingBankroll]);

  const gradientId = "equityGradient";
  const lineColor = metrics?.isProfit ? "#00d4aa" : "#ef4444";

  return (
    <ChartContainer
      title="Portfolio Value"
      subtitle={
        metrics
          ? `${metrics.totalReturn >= 0 ? "+" : ""}${metrics.totalReturn.toFixed(1)}% all time`
          : undefined
      }
      isLoading={isLoading}
    >
      {metrics && (
        <div className="mb-4">
          <motion.div
            initial={animated ? { opacity: 0, y: -10 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-baseline gap-2"
          >
            <span className="text-3xl md:text-4xl font-mono font-bold text-white">
              {formatCurrency(metrics.current)}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                metrics.isProfit ? "text-emerald-400" : "text-red-400"
              )}
            >
              {metrics.totalReturn >= 0 ? "+" : ""}
              {metrics.totalReturn.toFixed(1)}%
            </span>
          </motion.div>
        </div>
      )}

      <div className={chartHeightClasses[height]}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            {showGrid && (
              <>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickFormatter={(value) => formatDate(value, "short")}
                  tickMargin={8}
                  minTickGap={50}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickFormatter={(value) => `$${value}`}
                  tickMargin={8}
                  width={50}
                  domain={["dataMin - 10", "dataMax + 10"]}
                />
              </>
            )}

            <ReferenceLine
              y={startingBankroll}
              stroke="#374151"
              strokeDasharray="4 4"
              strokeWidth={1}
            />

            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltip
                  active={active}
                  payload={payload as any}
                  label={label}
                  formatter={(value: number) => formatCurrency(value)}
                />
              )}
            />

            <Area
              type="monotone"
              dataKey="bankroll"
              stroke={lineColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              animationDuration={animated ? 1000 : 0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

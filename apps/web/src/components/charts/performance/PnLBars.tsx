"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { cn } from "@marketpilot/ui";
import { ChartContainer } from "../ChartContainer";
import { ChartTooltip } from "../ChartTooltip";
import { formatCurrency, formatDate } from "@/lib/charts/formatters";

interface PnLDataPoint {
  date: string;
  pnl: number;
}

interface PnLBarsProps {
  data: PnLDataPoint[];
  isLoading?: boolean;
  height?: "sm" | "md" | "lg";
}

export function PnLBars({
  data,
  isLoading = false,
  height = "md",
}: PnLBarsProps) {
  const heightClasses = {
    sm: "h-[150px]",
    md: "h-[200px] md:h-[250px]",
    lg: "h-[280px] md:h-[320px]",
  };

  const totalPnL = data.reduce((sum, d) => sum + d.pnl, 0);
  const winDays = data.filter((d) => d.pnl > 0).length;
  const lossDays = data.filter((d) => d.pnl < 0).length;

  return (
    <ChartContainer
      title="Daily P&L"
      subtitle={`${winDays} winning days, ${lossDays} losing days`}
      isLoading={isLoading}
    >
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase">Period Total</p>
          <p
            className={cn(
              "text-xl font-mono font-bold",
              totalPnL >= 0 ? "text-emerald-400" : "text-red-400"
            )}
          >
            {totalPnL >= 0 ? "+" : ""}
            {formatCurrency(totalPnL)}
          </p>
        </div>
      </div>

      <div className={heightClasses[height]}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 10 }}
              tickFormatter={(value) => formatDate(value, "day")}
              tickMargin={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 10 }}
              tickFormatter={(value) => `$${value}`}
              width={45}
            />

            <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />

            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltip
                  active={active}
                  payload={payload as any}
                  label={label}
                  labelFormatter={(label) => formatDate(label, "full")}
                  formatter={(value: number) => formatCurrency(value)}
                />
              )}
            />

            <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? "#00d4aa" : "#ef4444"}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

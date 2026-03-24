"use client";

import { cn } from "@marketpilot/ui";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; [key: string]: unknown }>;
  label?: string;
  labelFormatter?: (label: string) => string;
  formatter?: (value: number) => string;
  className?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  formatter,
  className,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value;
  const formattedLabel = labelFormatter ? labelFormatter(label || "") : label;
  const formattedValue = formatter ? formatter(value) : value;

  return (
    <div
      className={cn(
        "bg-gray-900 border border-white/10 rounded-lg px-3 py-2 shadow-xl",
        className
      )}
    >
      {formattedLabel && (
        <p className="text-xs text-gray-400 mb-1">{formattedLabel}</p>
      )}
      <p className="text-sm font-mono font-bold text-white">
        {formattedValue}
      </p>
    </div>
  );
}

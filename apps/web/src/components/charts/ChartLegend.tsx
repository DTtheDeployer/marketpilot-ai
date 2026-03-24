"use client";

import { cn } from "@marketpilot/ui";

interface LegendItem {
  label: string;
  color: string;
}

interface ChartLegendProps {
  items: LegendItem[];
  className?: string;
}

export function ChartLegend({ items, className }: ChartLegendProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 mt-4 pt-4 border-t border-white/5",
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-gray-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

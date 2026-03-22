import type { ReactNode } from "react";
import { cn } from "./cn";
import { Card } from "./card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-5 card-hover border-l-2 border-l-brand-500/40", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-surface-700">{title}</p>
          <p className="text-2xl font-bold text-surface-900 stat-value">{value}</p>
          {change && (
            <p
              className={cn(
                "text-xs font-medium",
                changeType === "positive" && "text-green-400",
                changeType === "negative" && "text-red-400",
                changeType === "neutral" && "text-surface-700"
              )}
            >
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-brand-500/10 p-2.5">
            <Icon className="h-5 w-5 text-brand-400" />
          </div>
        )}
      </div>
    </Card>
  );
}

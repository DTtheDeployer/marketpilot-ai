"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@marketpilot/ui";
import { Skeleton } from "@/components/shared/loading-skeleton";

interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  action?: ReactNode;
  noPadding?: boolean;
}

export function ChartContainer({
  title,
  subtitle,
  children,
  isLoading,
  error,
  className,
  action,
  noPadding = false,
}: ChartContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-xl border border-white/5 bg-gray-900/50 backdrop-blur-sm",
        !noPadding && "p-4 md:p-6",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-sm font-medium text-white">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}

      {isLoading ? (
        <ChartSkeleton />
      ) : error ? (
        <ChartError message={error} />
      ) : (
        <div className="w-full">{children}</div>
      )}
    </motion.div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[200px] md:h-[280px] lg:h-[350px] w-full" />
    </div>
  );
}

function ChartError({ message }: { message: string }) {
  return (
    <div className="h-[200px] md:h-[280px] lg:h-[350px] flex items-center justify-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

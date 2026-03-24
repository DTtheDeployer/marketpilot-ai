"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/charts/formatters";
import { cn } from "@marketpilot/ui";

interface LivePnLTickerProps {
  currentPnL: number;
  previousPnL?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function LivePnLTicker({
  currentPnL,
  previousPnL,
  label = "Today's P&L",
  size = "md",
}: LivePnLTickerProps) {
  const [displayValue, setDisplayValue] = useState(previousPnL ?? currentPnL);
  const [isAnimating, setIsAnimating] = useState(false);

  const isProfit = currentPnL >= 0;
  const hasChanged =
    previousPnL !== undefined && previousPnL !== currentPnL;
  const direction = hasChanged
    ? currentPnL > (previousPnL ?? 0)
      ? "up"
      : "down"
    : null;

  useEffect(() => {
    if (hasChanged) {
      setIsAnimating(true);

      const duration = 500;
      const steps = 20;
      const startValue = displayValue;
      const increment = (currentPnL - startValue) / steps;

      let step = 0;
      const interval = setInterval(() => {
        step++;
        setDisplayValue(startValue + increment * step);

        if (step >= steps) {
          clearInterval(interval);
          setDisplayValue(currentPnL);
          setTimeout(() => setIsAnimating(false), 300);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPnL]);

  const sizes = {
    sm: { value: "text-xl", label: "text-xs" },
    md: { value: "text-3xl", label: "text-sm" },
    lg: { value: "text-5xl", label: "text-base" },
  };

  return (
    <div className="flex flex-col">
      <span
        className={cn(
          "text-gray-500 uppercase tracking-wide",
          sizes[size].label
        )}
      >
        {label}
      </span>

      <div className="flex items-center gap-2">
        <motion.span
          className={cn(
            "font-mono font-bold",
            sizes[size].value,
            isProfit ? "text-emerald-400" : "text-red-400"
          )}
          animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {isProfit ? "+" : ""}
          {formatCurrency(displayValue)}
        </motion.span>

        <AnimatePresence>
          {direction && (
            <motion.div
              initial={{
                opacity: 0,
                y: direction === "up" ? 10 : -10,
              }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "p-1 rounded-full",
                direction === "up"
                  ? "bg-emerald-500/20"
                  : "bg-red-500/20"
              )}
            >
              {direction === "up" ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

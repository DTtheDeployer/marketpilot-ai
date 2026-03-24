"use client";

import { motion } from "framer-motion";
import { cn } from "@marketpilot/ui";
import { ChartContainer } from "../ChartContainer";

interface WinRateGaugeProps {
  winRate: number;
  wins: number;
  losses: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export function WinRateGauge({
  winRate,
  wins,
  losses,
  size = "md",
  animated = true,
}: WinRateGaugeProps) {
  const sizes = {
    sm: { container: 100, stroke: 8, fontSize: "text-xl" as const },
    md: { container: 140, stroke: 10, fontSize: "text-3xl" as const },
    lg: { container: 180, stroke: 12, fontSize: "text-4xl" as const },
  };

  const { container, stroke, fontSize } = sizes[size];
  const radius = (container - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (winRate / 100) * circumference;

  return (
    <ChartContainer title="Win Rate" className="inline-block">
      <div className="flex flex-col items-center">
        <div
          className="relative"
          style={{ width: container, height: container }}
        >
          <svg className="w-full h-full -rotate-90">
            <circle
              cx={container / 2}
              cy={container / 2}
              r={radius}
              stroke="#1f2937"
              strokeWidth={stroke}
              fill="none"
            />
            <motion.circle
              cx={container / 2}
              cy={container / 2}
              r={radius}
              stroke="#00d4aa"
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={
                animated ? { strokeDashoffset: circumference } : false
              }
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={cn("font-mono font-bold text-white", fontSize)}
              initial={animated ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {winRate.toFixed(0)}%
            </motion.span>
          </div>
        </div>

        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <p className="text-lg font-mono font-bold text-emerald-400">
              {wins}
            </p>
            <p className="text-xs text-gray-500 uppercase">Wins</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-mono font-bold text-red-400">
              {losses}
            </p>
            <p className="text-xs text-gray-500 uppercase">Losses</p>
          </div>
        </div>
      </div>
    </ChartContainer>
  );
}

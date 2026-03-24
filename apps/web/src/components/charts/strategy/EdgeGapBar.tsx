"use client";

import { motion } from "framer-motion";
import { ChartContainer } from "../ChartContainer";

interface EdgeGapBarProps {
  noaaConfidence: number;
  marketPrice: number;
  city?: string;
  bucket?: string;
  animated?: boolean;
}

export function EdgeGapBar({
  noaaConfidence,
  marketPrice,
  city,
  bucket,
  animated = true,
}: EdgeGapBarProps) {
  const evMultiple = marketPrice > 0 ? noaaConfidence / marketPrice : 0;
  const gap = noaaConfidence - marketPrice;

  return (
    <ChartContainer
      title={city && bucket ? `${city} ${bucket}` : "Edge Analysis"}
      subtitle={`${evMultiple.toFixed(1)}x expected value`}
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* NOAA Bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-400">NOAA Confidence</span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {noaaConfidence}%
            </span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              initial={animated ? { width: 0 } : false}
              animate={{ width: `${noaaConfidence}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Market Bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-400">Market Price</span>
            <span className="text-sm font-mono font-bold text-gray-400">
              {marketPrice}¢
            </span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gray-600 rounded-full"
              initial={animated ? { width: 0 } : false}
              animate={{ width: `${marketPrice}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>

        {/* Gap Indicator */}
        <motion.div
          className="flex items-center justify-center py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
          initial={animated ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-sm text-emerald-400">
            The Gap:{" "}
            <span className="font-mono font-bold">{gap}%</span> edge
          </span>
        </motion.div>
      </div>
    </ChartContainer>
  );
}

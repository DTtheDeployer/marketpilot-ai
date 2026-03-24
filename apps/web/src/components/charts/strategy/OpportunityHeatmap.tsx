"use client";

import { motion } from "framer-motion";
import { cn } from "@marketpilot/ui";
import { ChartContainer } from "../ChartContainer";

interface CityOpportunity {
  city: string;
  cityCode: string;
  evMultiple: number;
  noaaConfidence: number;
  marketPrice: number;
  bucket: string;
}

interface OpportunityHeatmapProps {
  opportunities: CityOpportunity[];
  isLoading?: boolean;
}

export function OpportunityHeatmap({
  opportunities,
  isLoading = false,
}: OpportunityHeatmapProps) {
  const sorted = [...opportunities].sort(
    (a, b) => b.evMultiple - a.evMultiple
  );
  const maxEV = Math.max(...opportunities.map((o) => o.evMultiple), 1);
  const getIntensity = (ev: number) => Math.min(ev / maxEV, 1);

  return (
    <ChartContainer
      title="Live Opportunities"
      subtitle="Sorted by expected value"
      isLoading={isLoading}
    >
      <div className="space-y-2">
        {sorted.map((opp, index) => {
          const intensity = getIntensity(opp.evMultiple);

          return (
            <motion.div
              key={opp.cityCode}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-20 shrink-0">
                <span className="text-sm font-medium text-white">
                  {opp.city}
                </span>
              </div>

              <div className="flex-1 h-8 bg-gray-800 rounded-lg overflow-hidden relative">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-lg"
                  style={{
                    background: `linear-gradient(90deg,
                      rgba(0, 212, 170, ${0.2 + intensity * 0.6}) 0%,
                      rgba(0, 255, 200, ${0.3 + intensity * 0.5}) 100%
                    )`,
                  }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(opp.evMultiple * 15, 100)}%`,
                  }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                />

                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <span className="text-xs text-gray-400">{opp.bucket}</span>
                  <span
                    className={cn(
                      "text-sm font-mono font-bold",
                      opp.evMultiple >= 4
                        ? "text-emerald-400"
                        : "text-gray-300"
                    )}
                  >
                    {opp.evMultiple.toFixed(1)}x
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-4 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400/30" />
          <span className="text-xs text-gray-500">Low EV</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="text-xs text-gray-500">High EV</span>
        </div>
      </div>
    </ChartContainer>
  );
}

/**
 * MarketPilot AI — Chart Design System Configuration
 * ===================================================
 * Colors, typography classes, and responsive breakpoints
 * shared across all chart components.
 */

export const chartColors = {
  // Primary
  profit: "#00d4aa",
  loss: "#ef4444",
  neutral: "#6b7280",

  // Gradients
  profitGradient: ["#00d4aa", "#00ffc8"] as const,
  lossGradient: ["#ef4444", "#f87171"] as const,

  // Backgrounds
  chartBg: "#0a0a0a",
  chartGrid: "#1a1a2e",
  chartGridLine: "rgba(255,255,255,0.05)",

  // Accents
  accent1: "#6366f1",
  accent2: "#f59e0b",
  accent3: "#8b5cf6",

  // Text
  chartLabel: "#9ca3af",
  chartValue: "#ffffff",
} as const;

export const chartTypography = {
  metric: "font-mono text-4xl font-bold",
  metricLabel: "text-sm text-gray-400 uppercase tracking-wide",
  axisLabel: "text-xs text-gray-500",
  tooltipTitle: "text-sm font-medium",
  tooltipValue: "text-lg font-mono font-bold",
} as const;

export const chartHeights = {
  sm: 200,
  md: 280,
  lg: 350,
  xl: 400,
} as const;

export const chartHeightClasses = {
  sm: "h-[200px]",
  md: "h-[200px] md:h-[280px]",
  lg: "h-[300px] md:h-[350px]",
  xl: "h-[350px] md:h-[400px]",
} as const;

/** Recharts axis tick style */
export const axisTick = {
  fill: "#6b7280",
  fontSize: 11,
} as const;

/** Recharts axis tick style for small screens */
export const axisTickSmall = {
  fill: "#6b7280",
  fontSize: 10,
} as const;

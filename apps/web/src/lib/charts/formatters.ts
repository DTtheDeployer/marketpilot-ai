/**
 * MarketPilot AI — Chart Formatting Utilities
 * ============================================
 * Number, date, and currency formatters used by chart components.
 */

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function formatDate(
  dateStr: string,
  format: "short" | "day" | "full"
): string {
  const date = new Date(dateStr);

  switch (format) {
    case "short":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    case "day":
      return date.toLocaleDateString("en-US", { weekday: "short" });
    case "full":
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    default:
      return dateStr;
  }
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

export function formatBps(value: number): string {
  return `${value.toFixed(1)}bps`;
}

export function formatMultiple(value: number): string {
  return `${value.toFixed(1)}x`;
}

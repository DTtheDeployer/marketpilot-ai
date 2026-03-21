// =============================================================================
// MarketPilot AI — Notification Helpers
// =============================================================================

import type { AlertType, AlertSeverity } from "@marketpilot/types";

export interface CreateAlertInput {
  userId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export function formatAlertMessage(type: AlertType, data: Record<string, unknown>): string {
  switch (type) {
    case "RISK_LIMIT":
      return `Risk limit triggered: ${data.limit} exceeded threshold of ${data.threshold}`;
    case "BOT_ERROR":
      return `Bot "${data.botName}" encountered an error: ${data.error}`;
    case "EXECUTION":
      return `Order ${data.orderId} ${data.status}: ${data.details}`;
    case "SYSTEM":
      return `System alert: ${data.message}`;
    case "BILLING":
      return `Billing update: ${data.message}`;
    case "COMPLIANCE":
      return `Compliance notice: ${data.message}`;
    default:
      return String(data.message || "Unknown alert");
  }
}

export function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case "INFO": return "text-blue-400";
    case "WARNING": return "text-amber-400";
    case "CRITICAL": return "text-red-400";
  }
}

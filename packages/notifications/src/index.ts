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

// =============================================================================
// Email Delivery via Resend
// =============================================================================

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "MarketPilot AI <noreply@marketpilot.ai>";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — email not sent:", input.subject);
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend email failed:", data);
      return { success: false, error: data?.message || `HTTP ${res.status}` };
    }

    return { success: true, id: data.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Email send error:", msg);
    return { success: false, error: msg };
  }
}

// ── Email Templates ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Welcome to MarketPilot AI",
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #d4d4d8; padding: 40px 24px;">
        <h1 style="color: #fff; font-size: 24px; margin-bottom: 16px;">Welcome to MarketPilot AI</h1>
        <p>Hi ${name || "there"},</p>
        <p>Your account is set up and your first paper trading bot is ready to go.</p>
        <p>Here's what you can do next:</p>
        <ul>
          <li>Monitor your bot on the <a href="https://marketpilot-six.vercel.app/app/dashboard" style="color: #818cf8;">Dashboard</a></li>
          <li>Run a <a href="https://marketpilot-six.vercel.app/app/backtests" style="color: #818cf8;">Backtest</a> to test strategies</li>
          <li>Explore <a href="https://marketpilot-six.vercel.app/app/strategies" style="color: #818cf8;">all strategies</a></li>
        </ul>
        <p style="color: #71717a; font-size: 12px; margin-top: 32px;">Trading prediction markets involves risk. Past performance does not guarantee future results.</p>
      </div>
    `,
  });
}

export async function sendTradeAlert(to: string, trade: { action: string; market: string; price: number; pnl?: number }): Promise<void> {
  const isWin = (trade.pnl ?? 0) > 0;
  await sendEmail({
    to,
    subject: `MarketPilot: ${trade.action} ${trade.market}`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #d4d4d8; padding: 40px 24px;">
        <h2 style="color: #fff;">${trade.action === "BUY" ? "🟢" : "🔴"} ${trade.action} — ${trade.market}</h2>
        <p>Price: ${(trade.price * 100).toFixed(0)}¢</p>
        ${trade.pnl !== undefined ? `<p style="color: ${isWin ? "#22c55e" : "#ef4444"};">P&L: ${isWin ? "+" : ""}$${trade.pnl.toFixed(2)}</p>` : ""}
        <p style="color: #71717a; font-size: 12px; margin-top: 24px;">MarketPilot AI — Automated prediction market strategies</p>
      </div>
    `,
  });
}

export async function sendUpgradeConfirmation(to: string, planName: string): Promise<void> {
  await sendEmail({
    to,
    subject: `MarketPilot: Upgraded to ${planName}`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #d4d4d8; padding: 40px 24px;">
        <h1 style="color: #fff;">You're now on ${planName}</h1>
        <p>Your subscription has been upgraded. New features are available immediately.</p>
        <a href="https://marketpilot-six.vercel.app/app/dashboard" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">Go to Dashboard</a>
        <p style="color: #71717a; font-size: 12px; margin-top: 32px;">MarketPilot AI</p>
      </div>
    `,
  });
}

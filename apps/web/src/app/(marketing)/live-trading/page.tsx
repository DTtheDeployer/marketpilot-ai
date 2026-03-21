import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from "@marketpilot/ui";
import {
  Zap,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Wallet,
  Activity,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const capabilities = [
  {
    icon: Zap,
    title: "Automated Execution",
    description:
      "Strategies execute autonomously 24/7. Orders are placed, managed, and closed based on your configured parameters without manual intervention.",
  },
  {
    icon: ShieldCheck,
    title: "Validated Risk Controls",
    description:
      "Every risk control you tested in paper trading applies identically to live trades. Stop-losses, daily limits, and circuit breakers are enforced at the system level.",
  },
  {
    icon: Activity,
    title: "Real-Time Monitoring",
    description:
      "Live dashboards show every open position, pending order, and P&L update in real time. Receive alerts for risk events, fills, and anomalies.",
  },
  {
    icon: Lock,
    title: "Non-Custodial Architecture",
    description:
      "MarketPilot never holds your funds. You connect your own wallet and approve transactions. You maintain full custody of your capital at all times.",
  },
  {
    icon: Wallet,
    title: "Wallet Integration",
    description:
      "Connect compatible wallets to interact directly with prediction market smart contracts. All on-chain transactions are transparent and auditable.",
  },
  {
    icon: AlertTriangle,
    title: "Emergency Controls",
    description:
      "One-click pause button and automatic kill switch. If a strategy breaches its risk envelope, it is immediately halted and all open orders are cancelled.",
  },
];

const requirements = [
  "Active Operator (Elite) subscription",
  "Passed jurisdictional eligibility check",
  "Completed risk disclosure acknowledgment",
  "Connected compatible wallet",
  "Minimum paper trading history (recommended)",
];

const restrictions = [
  "Available to eligible jurisdictions only",
  "Subject to position and daily loss limits",
  "Not available to residents of restricted regions",
];

export default function LiveTradingPage() {
  return (
    <div className="min-h-screen">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Badge variant="live" className="mb-6">
            Live Trading
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-900">
            Deploy with Real Capital
          </h1>
          <p className="mt-6 text-lg text-surface-700 max-w-2xl mx-auto">
            When you have validated your strategy in simulation and are confident
            in your approach, transition to live execution with the same risk
            controls you tested in paper trading.
          </p>
        </div>
      </section>

      {/* ── Compliance Notice ─────────────────────────────────────────── */}
      <section className="pb-12">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-surface-900">
                  Important Compliance Notice
                </h3>
                <p className="mt-2 text-sm text-surface-700 leading-relaxed">
                  Live trading on prediction markets involves real financial risk
                  and is subject to regulatory requirements. Access to live
                  trading requires an Operator subscription, a passed
                  jurisdictional eligibility check, and acknowledgment of our
                  risk disclosure. MarketPilot does not provide financial advice.
                  You are solely responsible for your trading decisions.
                </p>
                <div className="mt-4">
                  <Link href="/risk-disclosure">
                    <Button variant="outline" size="sm">
                      Read Risk Disclosure
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Capabilities ──────────────────────────────────────────────── */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-surface-900 text-center mb-12">
            Live Trading Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap) => (
              <Card key={cap.title}>
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                    <cap.icon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <CardTitle>{cap.title}</CardTitle>
                  <CardDescription>{cap.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Requirements ──────────────────────────────────────────────── */}
      <section className="border-t border-surface-300 py-20 bg-surface-50">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-lg font-semibold text-surface-900 mb-6">
                Requirements
              </h3>
              <ul className="space-y-3">
                {requirements.map((req) => (
                  <li key={req} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-surface-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-900 mb-6">
                Restrictions
              </h3>
              <ul className="space-y-3">
                {restrictions.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <XCircle className="h-4 w-4 text-surface-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-surface-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="border-t border-surface-300 py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-surface-900">
            Start with Paper Trading First
          </h2>
          <p className="mt-4 text-surface-700">
            We recommend validating every strategy in simulation before
            deploying with real capital. Paper trading is free and uses the same
            infrastructure.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/paper-trading">
              <Button size="lg">
                Learn About Paper Trading
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

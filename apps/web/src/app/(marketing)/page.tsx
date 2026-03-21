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
  Search,
  LineChart,
  History,
  ShieldCheck,
  Zap,
  BarChart3,
  ArrowRight,
  Bot,
  FlaskConical,
  Rocket,
  AlertTriangle,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Strategy Research",
    description:
      "Browse a curated library of prediction market strategies, each with a transparent thesis, risk profile, and historical context.",
  },
  {
    icon: FlaskConical,
    title: "Paper Trading",
    description:
      "Deploy any strategy in a risk-free paper environment. Track simulated P&L, refine parameters, and build confidence before going live.",
  },
  {
    icon: History,
    title: "Backtesting",
    description:
      "Run strategies against historical market data to evaluate performance under real-world conditions before committing capital.",
  },
  {
    icon: ShieldCheck,
    title: "Risk Management",
    description:
      "Configurable stop-losses, daily drawdown limits, position sizing, and automatic circuit breakers to protect your capital.",
  },
  {
    icon: Zap,
    title: "Live Execution",
    description:
      "When you are ready, deploy strategies with live capital. Every order is executed with the same risk controls validated in simulation.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Comprehensive performance dashboards with P&L attribution, win-rate tracking, and strategy comparison tools.",
  },
];

const steps = [
  {
    step: "01",
    title: "Research",
    description:
      "Explore our strategy library. Understand each approach, its underlying thesis, and expected risk-reward profile.",
  },
  {
    step: "02",
    title: "Configure",
    description:
      "Set your parameters: position sizes, stop-losses, daily limits, and market filters. Define risk tolerances that match your goals.",
  },
  {
    step: "03",
    title: "Simulate",
    description:
      "Paper trade with real market data. Backtest against historical conditions. Validate performance before risking any capital.",
  },
  {
    step: "04",
    title: "Execute",
    description:
      "Deploy live with confidence. The same risk controls you validated in simulation protect every real trade, 24/7.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Badge variant="default" className="mb-6">
            Prediction Market Automation
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-surface-900 max-w-4xl mx-auto leading-tight">
            Automate Your Prediction Market Strategy
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-surface-700 max-w-2xl mx-auto leading-relaxed">
            Research strategies, simulate with paper trading, backtest against
            historical data, and deploy with institutional-grade risk controls.
            All in one platform.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="xl">
                Start Paper Trading
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" size="xl">
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────── */}
      <section className="border-y border-surface-300 bg-surface-100/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-surface-900">6 Strategies</p>
              <p className="mt-1 text-sm text-surface-600">
                Curated &amp; transparent
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-surface-900">
                24/7 Automation
              </p>
              <p className="mt-1 text-sm text-surface-600">
                Continuous monitoring &amp; execution
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-surface-900">
                Institutional Risk Controls
              </p>
              <p className="mt-1 text-sm text-surface-600">
                Stop-losses, circuit breakers &amp; limits
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-surface-900">
              Everything You Need to Trade Systematically
            </h2>
            <p className="mt-4 text-lg text-surface-700 max-w-2xl mx-auto">
              From research to execution, MarketPilot gives you professional-grade
              tools for prediction market automation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center mb-3">
                    <feature.icon className="h-5 w-5 text-brand-400" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section className="py-24 bg-surface-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-surface-900">How It Works</h2>
            <p className="mt-4 text-lg text-surface-700 max-w-2xl mx-auto">
              A disciplined workflow from research to live execution.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.step} className="relative">
                <div className="text-5xl font-bold text-brand-600/20 mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-surface-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-surface-700 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <Bot className="h-12 w-12 text-brand-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-surface-900">
            Ready to Automate Your Strategy?
          </h2>
          <p className="mt-4 text-lg text-surface-700">
            Start with paper trading — no capital required. Build confidence in
            your approach before deploying live.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Create Free Account</Button>
            </Link>
            <Link href="/strategies">
              <Button variant="outline" size="lg">
                Browse Strategies
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Risk Disclaimer ───────────────────────────────────────────── */}
      <section className="border-t border-surface-300 py-8">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="flex items-start gap-3 text-surface-600">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              <strong className="text-surface-700">Risk Disclaimer:</strong>{" "}
              Prediction market trading involves significant risk and is not
              suitable for all individuals. Past performance of any strategy,
              whether simulated or live, does not guarantee future results. You
              should not trade with funds you cannot afford to lose. MarketPilot
              provides tools and automation — it does not provide financial
              advice. Please review our{" "}
              <Link
                href="/risk-disclosure"
                className="text-brand-400 hover:text-brand-500 underline"
              >
                Risk Disclosure
              </Link>{" "}
              before using this platform.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

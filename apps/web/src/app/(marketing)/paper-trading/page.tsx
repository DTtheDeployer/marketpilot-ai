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
  FlaskConical,
  LineChart,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Gauge,
} from "lucide-react";

const benefits = [
  {
    icon: FlaskConical,
    title: "Risk-Free Environment",
    description:
      "Execute strategies with simulated capital against real market data. Every trade, fill, and P&L update mirrors live conditions without financial exposure.",
  },
  {
    icon: LineChart,
    title: "Real Market Data",
    description:
      "Paper trading uses live orderbook data and real-time prices. Your simulations reflect actual market conditions, not synthetic test data.",
  },
  {
    icon: BarChart3,
    title: "Full Analytics",
    description:
      "Track P&L, win rate, Sharpe ratio, max drawdown, and per-strategy attribution. The same analytics dashboard available to live traders.",
  },
  {
    icon: ShieldCheck,
    title: "Risk Control Validation",
    description:
      "Test your stop-losses, daily limits, and circuit breakers in simulation. Verify your risk parameters work as expected before going live.",
  },
  {
    icon: Clock,
    title: "Unlimited Duration",
    description:
      "Paper trade for as long as you want. There is no pressure to go live. Build conviction in your approach at your own pace.",
  },
  {
    icon: Gauge,
    title: "Performance Benchmarking",
    description:
      "Compare strategy performance side by side. Understand which approaches suit different market conditions before allocating real capital.",
  },
];

const included = [
  "Deploy up to 5 strategies simultaneously (Pro plan)",
  "Real-time simulated order fills",
  "Full P&L and drawdown tracking",
  "Configurable risk parameters",
  "Historical backtest comparison",
  "Performance export and reporting",
];

export default function PaperTradingPage() {
  return (
    <div className="min-h-screen">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Badge variant="paper" className="mb-6">
            Paper Trading
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-900">
            Simulate Before You Deploy
          </h1>
          <p className="mt-6 text-lg text-surface-700 max-w-2xl mx-auto">
            Paper trading lets you run any strategy with simulated capital
            against live market data. Validate your approach, tune your
            parameters, and build confidence — all without risking a single
            dollar.
          </p>
          <div className="mt-10">
            <Link href="/signup">
              <Button size="lg">
                Start Paper Trading Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Benefits Grid ─────────────────────────────────────────────── */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                    <benefit.icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <CardTitle>{benefit.title}</CardTitle>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's Included ───────────────────────────────────────────── */}
      <section className="border-t border-surface-300 py-20 bg-surface-50">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-surface-900 text-center mb-10">
            What is Included in Paper Trading
          </h2>
          <ul className="space-y-4">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
                <span className="text-surface-800">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="border-t border-surface-300 py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-surface-900">
            Ready to Test Your Ideas?
          </h2>
          <p className="mt-4 text-surface-700">
            Create a free account and deploy your first paper trading strategy
            in under five minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/strategies">
              <Button variant="outline" size="lg">
                View Strategies
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

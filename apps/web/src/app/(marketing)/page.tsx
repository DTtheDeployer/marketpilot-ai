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
  ArrowRight,
  Bot,
  AlertTriangle,
  ShieldCheck,
  Eye,
  FlaskConical,
  ShieldAlert,
  CloudSun,
  ScanLine,
  Clock,
  TrendingUp,
  Zap,
  Lock,
} from "lucide-react";

const performanceData = [
  { strategy: "Weather Arb", roi: "+62.1%", trades: 214, winRate: "78%", status: "Live" },
  { strategy: "Mean Reversion", roi: "+19.3%", trades: 1_031, winRate: "63%", status: "Live" },
  { strategy: "Time Decay", roi: "+14.6%", trades: 387, winRate: "71%", status: "Live" },
  { strategy: "Spread Capture", roi: "+11.8%", trades: 2_847, winRate: "58%", status: "Live" },
];

const trustPoints = [
  {
    icon: Lock,
    title: "Non-Custodial",
    description:
      "Your funds stay in your wallet. MarketPilot never holds your capital — we sign transactions, you approve them.",
  },
  {
    icon: Eye,
    title: "Transparent Strategies",
    description:
      "Every strategy has a published thesis, documented parameters, and open performance history. No black boxes.",
  },
  {
    icon: FlaskConical,
    title: "Paper First",
    description:
      "Every strategy must prove itself in paper trading with real market data before you can deploy live capital.",
  },
  {
    icon: ShieldAlert,
    title: "Risk Controls Built In",
    description:
      "Stop-losses, daily drawdown limits, Kelly sizing caps, and automatic circuit breakers protect every position.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Badge variant="warning" className="mb-6">
            14 of the top 20 Polymarket traders are bots.
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-surface-900 max-w-4xl mx-auto leading-tight">
            You Should Be One of Them.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-surface-700 max-w-3xl mx-auto leading-relaxed">
            Polymarket&apos;s best performers aren&apos;t clicking buttons — they&apos;re
            running algorithms that exploit pricing gaps retail traders can&apos;t
            see. MarketPilot gives you the same edge: transparent strategies,
            institutional risk controls, and paper trading to prove it works
            before you risk a dollar.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="xl">
                Start Paper Trading — Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/strategies">
              <Button variant="outline" size="xl">
                See Live Bot Performance
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────── */}
      <section className="border-y border-surface-300 bg-surface-100/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-surface-900">$9B+</p>
              <p className="mt-1 text-sm text-surface-600">
                Polymarket 2024 Volume
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-surface-900">6 Strategies</p>
              <p className="mt-1 text-sm text-surface-600">
                Curated &amp; transparent
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-surface-900">24/7</p>
              <p className="mt-1 text-sm text-surface-600">
                Automated execution
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-surface-900">94%</p>
              <p className="mt-1 text-sm text-surface-600">
                NOAA forecast accuracy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How The Edge Works ─────────────────────────────────────────── */}
      <section className="py-24 bg-surface-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-surface-900">
              Why Bots Win on Polymarket
            </h2>
            <p className="mt-4 text-lg text-surface-700 max-w-2xl mx-auto">
              Human traders react to headlines. Bots react to data — faster,
              more precisely, and 24 hours a day.
            </p>
          </div>

          {/* Weather Arb Example */}
          <Card className="max-w-4xl mx-auto mb-12">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center">
                  <CloudSun className="h-5 w-5 text-brand-400" />
                </div>
                <div>
                  <CardTitle>Weather Arb — The Edge in Action</CardTitle>
                  <CardDescription>
                    How data-driven bots exploit the gap between science and sentiment
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="rounded-lg border border-surface-300 bg-surface-200/50 p-5 text-center">
                  <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-2">
                    NOAA Forecast
                  </p>
                  <p className="text-4xl font-bold text-brand-400">94%</p>
                  <p className="text-sm text-surface-700 mt-1">
                    Probability of above-normal temps
                  </p>
                </div>
                <div className="rounded-lg border border-surface-300 bg-surface-200/50 p-5 text-center">
                  <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-2">
                    Polymarket Price
                  </p>
                  <p className="text-4xl font-bold text-surface-900">11&cent;</p>
                  <p className="text-sm text-surface-700 mt-1">
                    Implied probability: 11%
                  </p>
                </div>
                <div className="rounded-lg border border-green-500/30 bg-success/10 p-5 text-center">
                  <p className="text-xs font-mono text-green-400 uppercase tracking-wider mb-2">
                    Expected Value
                  </p>
                  <p className="text-4xl font-bold text-green-400">8.5x</p>
                  <p className="text-sm text-surface-700 mt-1">
                    EV gap the bot captures
                  </p>
                </div>
              </div>

              {/* Visual Flow */}
              <div className="flex items-center justify-center gap-3 flex-wrap text-sm">
                <div className="flex items-center gap-2 rounded-full bg-surface-200 border border-surface-300 px-4 py-2">
                  <CloudSun className="h-4 w-4 text-brand-400" />
                  <span className="text-surface-900 font-medium">NOAA Forecast</span>
                </div>
                <ArrowRight className="h-4 w-4 text-surface-600" />
                <div className="flex items-center gap-2 rounded-full bg-brand-600/10 border border-brand-500/30 px-4 py-2">
                  <Bot className="h-4 w-4 text-brand-400" />
                  <span className="text-brand-400 font-medium">MarketPilot Bot</span>
                </div>
                <ArrowRight className="h-4 w-4 text-surface-600" />
                <div className="flex items-center gap-2 rounded-full bg-success/10 border border-green-500/30 px-4 py-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 font-medium">Profit</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: ScanLine, text: "60+ markets scanned" },
              { icon: Clock, text: "720 scans per day" },
              { icon: ShieldCheck, text: "Kelly-criterion sizing" },
              { icon: Zap, text: "No sleep, no emotions" },
            ].map((point) => (
              <div
                key={point.text}
                className="flex items-center gap-3 rounded-lg border border-surface-300 bg-surface-100 p-4"
              >
                <point.icon className="h-5 w-5 text-brand-400 shrink-0" />
                <span className="text-sm font-medium text-surface-900">
                  {point.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Performance ──────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900">
              Live Strategy Performance
            </h2>
            <p className="mt-4 text-lg text-surface-700 max-w-2xl mx-auto">
              Real results from bots running on Polymarket. Updated continuously.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-300">
                        <th className="text-left py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                          Strategy
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                          ROI
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                          Trades
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                          Win Rate
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceData.map((row) => (
                        <tr
                          key={row.strategy}
                          className="border-b border-surface-300 last:border-0 hover:bg-surface-200/50 transition-colors"
                        >
                          <td className="py-4 px-6 font-medium text-surface-900">
                            {row.strategy}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-bold text-green-400">
                            {row.roi}
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-surface-700">
                            {row.trades.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-surface-700">
                            {row.winRate}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Badge variant="live" className="text-[10px]">
                              {row.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            <p className="mt-4 text-xs text-surface-600 text-center">
              Past performance — simulated or live — does not guarantee future
              results.
            </p>
          </div>
        </div>
      </section>

      {/* ── Trust ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-surface-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-surface-900">
              Built for Trust
            </h2>
            <p className="mt-4 text-lg text-surface-700 max-w-2xl mx-auto">
              We earn your confidence through transparency, not promises.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPoints.map((point) => (
              <Card key={point.title}>
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center mb-3">
                    <point.icon className="h-5 w-5 text-brand-400" />
                  </div>
                  <CardTitle>{point.title}</CardTitle>
                  <CardDescription>{point.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <Bot className="h-12 w-12 text-brand-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-surface-900">
            Ready to Capture the Edge?
          </h2>
          <p className="mt-4 text-lg text-surface-700">
            Start with paper trading — no capital required. Let the bot prove
            itself before you risk a dollar.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">
                Launch Your First Paper Bot
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/weather-arb">
              <Button variant="outline" size="lg">
                Explore Weather Arb
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

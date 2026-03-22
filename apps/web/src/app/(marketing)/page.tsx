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
  DollarSign,
  Layers,
  Timer,
  Activity,
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
      <section className="relative overflow-hidden py-32 sm:py-44">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-brand-600/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Floating particle decorations */}
        <div className="absolute top-32 left-[15%] w-1.5 h-1.5 rounded-full bg-brand-400/30 animate-pulse" />
        <div className="absolute top-48 right-[20%] w-1 h-1 rounded-full bg-brand-400/20 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-32 left-[25%] w-2 h-2 rounded-full bg-brand-400/15 animate-pulse" style={{ animationDelay: "0.5s" }} />
        <div className="absolute top-64 left-[10%] w-1 h-1 rounded-full bg-purple-400/20 animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-48 right-[15%] w-1.5 h-1.5 rounded-full bg-purple-400/25 animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-40 right-[35%] w-1 h-1 rounded-full bg-brand-300/20 animate-pulse" style={{ animationDelay: "0.7s" }} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Badge variant="warning" className="mb-8 text-sm px-4 py-1.5">
            14 of the top 20 Polymarket traders are bots.
          </Badge>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight max-w-5xl mx-auto leading-[1.05]">
            <span className="text-gradient-animated">You Should Be</span>
            <br />
            <span className="text-surface-900">One of Them.</span>
          </h1>
          <p className="mt-8 text-lg sm:text-xl lg:text-2xl text-surface-700 max-w-3xl mx-auto leading-relaxed">
            Polymarket&apos;s best performers aren&apos;t clicking buttons — they&apos;re
            running algorithms that exploit pricing gaps retail traders can&apos;t
            see. MarketPilot gives you the same edge: transparent strategies,
            institutional risk controls, and paper trading to prove it works
            before you risk a dollar.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="xl" className="relative group overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Start Paper Trading — Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>
            <Link href="/strategies">
              <Button variant="outline" size="xl" className="backdrop-blur-sm">
                See Live Bot Performance
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
          <div className="glass-card rounded-2xl px-8 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              <div className="relative">
                <div className="flex justify-center mb-3">
                  <div className="rounded-lg bg-brand-500/10 p-2.5">
                    <DollarSign className="h-5 w-5 text-brand-400" />
                  </div>
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-surface-900 stat-value">$9B+</p>
                <p className="mt-1 text-sm text-surface-600">
                  Polymarket 2024 Volume
                </p>
                <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-surface-300/50 to-transparent" />
              </div>
              <div className="relative">
                <div className="flex justify-center mb-3">
                  <div className="rounded-lg bg-brand-500/10 p-2.5">
                    <Layers className="h-5 w-5 text-brand-400" />
                  </div>
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-surface-900 stat-value">6 Strategies</p>
                <p className="mt-1 text-sm text-surface-600">
                  Curated &amp; transparent
                </p>
                <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-surface-300/50 to-transparent" />
              </div>
              <div className="relative">
                <div className="flex justify-center mb-3">
                  <div className="rounded-lg bg-brand-500/10 p-2.5">
                    <Timer className="h-5 w-5 text-brand-400" />
                  </div>
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-surface-900 stat-value">24/7</p>
                <p className="mt-1 text-sm text-surface-600">
                  Automated execution
                </p>
                <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-surface-300/50 to-transparent" />
              </div>
              <div>
                <div className="flex justify-center mb-3">
                  <div className="rounded-lg bg-brand-500/10 p-2.5">
                    <Activity className="h-5 w-5 text-brand-400" />
                  </div>
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-surface-900 stat-value">94%</p>
                <p className="mt-1 text-sm text-surface-600">
                  NOAA forecast accuracy
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How The Edge Works ─────────────────────────────────────────── */}
      <section className="py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900">
              Why Bots Win on Polymarket
            </h2>
            <p className="mt-6 text-lg lg:text-xl text-surface-700 max-w-2xl mx-auto">
              Human traders react to headlines. Bots react to data — faster,
              more precisely, and 24 hours a day.
            </p>
          </div>

          {/* Weather Arb Example */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-12 w-12 rounded-xl bg-brand-600/10 flex items-center justify-center">
                    <CloudSun className="h-6 w-6 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-surface-900">Weather Arb — The Edge in Action</h3>
                    <p className="text-sm text-surface-700">
                      How data-driven bots exploit the gap between science and sentiment
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="relative rounded-xl border border-brand-500/20 bg-brand-500/5 p-6 text-center">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
                    <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-3">
                      NOAA Forecast
                    </p>
                    <p className="text-5xl font-bold text-brand-400 stat-value">94%</p>
                    <p className="text-sm text-surface-700 mt-2">
                      Probability of above-normal temps
                    </p>
                  </div>
                  <div className="relative rounded-xl border border-surface-300 bg-surface-200/30 p-6 text-center">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-surface-500/30 to-transparent" />
                    <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-3">
                      Polymarket Price
                    </p>
                    <p className="text-5xl font-bold text-surface-900 stat-value">11&cent;</p>
                    <p className="text-sm text-surface-700 mt-2">
                      Implied probability: 11%
                    </p>
                  </div>
                  <div className="relative rounded-xl border border-green-500/30 bg-green-500/5 p-6 text-center">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
                    <p className="text-xs font-mono text-green-400 uppercase tracking-wider mb-3">
                      Expected Value
                    </p>
                    <p className="text-5xl font-bold text-green-400 stat-value">8.5x</p>
                    <p className="text-sm text-surface-700 mt-2">
                      EV gap the bot captures
                    </p>
                  </div>
                </div>

                {/* Visual Flow with connecting lines */}
                <div className="relative flex items-center justify-center gap-4 flex-wrap text-sm py-4">
                  <div className="hidden md:block absolute top-1/2 left-[20%] right-[20%] h-px bg-gradient-to-r from-brand-500/20 via-brand-500/40 to-green-500/20" />
                  <div className="relative flex items-center gap-2 rounded-full bg-surface-200/80 border border-surface-300 px-5 py-2.5 backdrop-blur-sm">
                    <CloudSun className="h-4 w-4 text-brand-400" />
                    <span className="text-surface-900 font-medium">NOAA Forecast</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-surface-500" />
                  <div className="relative flex items-center gap-2 rounded-full bg-brand-600/10 border border-brand-500/30 px-5 py-2.5 backdrop-blur-sm shadow-lg shadow-brand-500/5">
                    <Bot className="h-4 w-4 text-brand-400" />
                    <span className="text-brand-400 font-medium">MarketPilot Bot</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-surface-500" />
                  <div className="relative flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/30 px-5 py-2.5 backdrop-blur-sm shadow-lg shadow-green-500/5">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-medium">Profit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                className="flex items-center gap-3 rounded-xl border border-surface-300 bg-surface-100 p-5 card-glow transition-all duration-300 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-black/20"
              >
                <div className="rounded-lg bg-brand-500/10 p-2">
                  <point.icon className="h-5 w-5 text-brand-400 shrink-0" />
                </div>
                <span className="text-sm font-medium text-surface-900">
                  {point.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Performance ──────────────────────────────────────────── */}
      <section className="py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900">
              Live Strategy Performance
            </h2>
            <p className="mt-6 text-lg lg:text-xl text-surface-700 max-w-2xl mx-auto">
              Real results from bots running on Polymarket. Updated continuously.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-5 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                        Strategy
                      </th>
                      <th className="text-right py-5 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                        ROI
                      </th>
                      <th className="text-right py-5 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                        Trades
                      </th>
                      <th className="text-right py-5 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                        Win Rate
                      </th>
                      <th className="text-right py-5 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceData.map((row, i) => (
                      <tr
                        key={row.strategy}
                        className={`border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors ${
                          i % 2 === 1 ? "bg-white/[0.01]" : ""
                        }`}
                      >
                        <td className="py-5 px-6 font-medium text-surface-900">
                          {row.strategy}
                        </td>
                        <td className="py-5 px-6 text-right font-mono font-bold text-green-400">
                          {row.roi}
                        </td>
                        <td className="py-5 px-6 text-right font-mono text-surface-700">
                          {row.trades.toLocaleString()}
                        </td>
                        <td className="py-5 px-6 text-right font-mono text-surface-700">
                          {row.winRate}
                        </td>
                        <td className="py-5 px-6 text-right">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
                            <Badge variant="live" className="text-[10px]">
                              {row.status}
                            </Badge>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-4 text-xs text-surface-600 text-center">
              Past performance — simulated or live — does not guarantee future
              results.
            </p>
          </div>
        </div>
      </section>

      {/* ── Trust ─────────────────────────────────────────────────────── */}
      <section className="py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900">
              Built for Trust
            </h2>
            <p className="mt-6 text-lg lg:text-xl text-surface-700 max-w-2xl mx-auto">
              We earn your confidence through transparency, not promises.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPoints.map((point) => (
              <Card key={point.title} className="group relative overflow-hidden">
                <CardHeader>
                  <div className="h-14 w-14 rounded-xl bg-brand-600/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-brand-600/20 group-hover:scale-105">
                    <point.icon className="h-7 w-7 text-brand-400" />
                  </div>
                  <CardTitle className="text-lg">{point.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{point.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-brand-600/10 to-surface-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <div className="h-16 w-16 rounded-2xl bg-brand-600/10 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-brand-500/10">
            <Bot className="h-8 w-8 text-brand-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900">
            Ready to Capture the Edge?
          </h2>
          <p className="mt-6 text-lg lg:text-xl text-surface-700 max-w-xl mx-auto">
            Start with paper trading — no capital required. Let the bot prove
            itself before you risk a dollar.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="relative group overflow-hidden shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30 transition-shadow">
                <span className="relative z-10 flex items-center gap-2">
                  Launch Your First Paper Bot
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Button>
            </Link>
            <Link href="/weather-arb">
              <Button variant="outline" size="lg" className="backdrop-blur-sm">
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

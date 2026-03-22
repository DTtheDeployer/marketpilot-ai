import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@marketpilot/ui";
import { ArrowRight, AlertTriangle } from "lucide-react";

const performanceData = [
  {
    strategy: "Weather Arb",
    return30d: "+62.1%",
    winRate: "78%",
    maxDrawdown: "-8.2%",
  },
  {
    strategy: "Mean Reversion",
    return30d: "+19.3%",
    winRate: "63%",
    maxDrawdown: "-12.1%",
  },
  {
    strategy: "Spread Capture",
    return30d: "+11.8%",
    winRate: "58%",
    maxDrawdown: "-6.4%",
  },
  {
    strategy: "Time Decay",
    return30d: "+14.6%",
    winRate: "71%",
    maxDrawdown: "-9.7%",
  },
];

const featureCards = [
  {
    title: "Non-Custodial",
    description:
      "Your wallet, your funds, your control. MarketPilot never holds your capital.",
  },
  {
    title: "Paper First",
    description:
      "Prove the edge before risking capital. Every strategy must pass paper trading first.",
  },
  {
    title: "Risk Controls",
    description:
      "Per-position stops, daily limits, circuit breakers. Protection is built in, not bolted on.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-surface-0 py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — Copy */}
            <div>
              <p className="text-sm font-mono text-brand-400 tracking-wide uppercase mb-6">
                14 of the top 20 Polymarket traders are bots.
              </p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
                You Should Be
                <br />
                One of Them.
              </h1>
              <p className="mt-8 text-lg text-surface-800 max-w-xl leading-relaxed">
                Polymarket&apos;s best performers aren&apos;t clicking
                buttons&nbsp;&mdash; they&apos;re running algorithms.
                MarketPilot gives you transparent strategies, institutional risk
                controls, and paper trading to prove it works before you risk a
                dollar.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button
                    size="xl"
                    className="bg-brand-600 text-white hover:bg-brand-500"
                  >
                    Start Paper Trading
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/strategies">
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-surface-400 text-white hover:bg-surface-100"
                  >
                    View Live Performance
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — Dashboard Preview Card */}
            <div className="bg-surface-100 border border-surface-300 p-8">
              <div className="flex items-center justify-between mb-8">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider">
                  Dashboard Preview
                </p>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
                  <span className="text-xs font-mono text-green-400">LIVE</span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-2">
                    Total P&amp;L
                  </p>
                  <p className="text-3xl font-bold text-green-400 stat-value">
                    +$142.50
                  </p>
                </div>
                <div>
                  <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-2">
                    Win Rate
                  </p>
                  <p className="text-3xl font-bold text-white stat-value">
                    71%
                  </p>
                </div>
                <div>
                  <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-2">
                    Active Bots
                  </p>
                  <p className="text-3xl font-bold text-white stat-value">3</p>
                </div>
              </div>
              <div className="mt-8 border-t border-surface-300 pt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-600 font-mono">
                    Last trade
                  </span>
                  <span className="text-green-400 font-mono">
                    Weather Arb &mdash; +$0.36
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="text-surface-600 font-mono">
                    Open positions
                  </span>
                  <span className="text-white font-mono">7</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="text-surface-600 font-mono">Uptime</span>
                  <span className="text-white font-mono">99.8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────── */}
      <section className="bg-surface-50 border-y border-surface-300">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-white stat-value">
                $9B+
              </p>
              <p className="mt-2 text-sm text-surface-600">
                Polymarket 2024 Volume
              </p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-white stat-value">
                6
              </p>
              <p className="mt-2 text-sm text-surface-600">
                Curated Strategies
              </p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-white stat-value">
                24/7
              </p>
              <p className="mt-2 text-sm text-surface-600">
                Automated Execution
              </p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-white stat-value">
                94%
              </p>
              <p className="mt-2 text-sm text-surface-600">
                NOAA Forecast Accuracy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How The Edge Works ─────────────────────────────────────────── */}
      <section className="bg-surface-0 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-16">
            The Weather Arb Edge
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left — Explanation */}
            <div>
              <p className="text-lg text-surface-800 leading-relaxed mb-6">
                NOAA weather forecasts are{" "}
                <span className="text-white font-semibold">94% accurate</span>{" "}
                for 3-day temperature predictions. But Polymarket prices
                routinely imply only{" "}
                <span className="text-white font-semibold">
                  11% probability
                </span>{" "}
                for the same outcomes.
              </p>
              <p className="text-lg text-surface-800 leading-relaxed mb-6">
                That gap&nbsp;&mdash;{" "}
                <span className="text-white font-semibold">
                  94% vs 11%
                </span>{" "}
                &nbsp;&mdash; represents an{" "}
                <span className="text-brand-400 font-bold">
                  8.5x expected value
                </span>{" "}
                edge. Our bot identifies these mispricings across 60+ weather
                markets, sizes positions using Kelly criterion, and executes 24/7.
              </p>
              <p className="text-lg text-surface-800 leading-relaxed">
                The market is driven by sentiment. The bot is driven by data. The
                edge is the difference.
              </p>
            </div>

            {/* Right — Trade Card */}
            <div className="bg-surface-100 border border-surface-300">
              <div className="border-b border-surface-300 px-6 py-4 flex items-center justify-between">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider">
                  Trade Example
                </p>
                <span className="text-xs font-mono text-green-400">
                  FILLED
                </span>
              </div>
              <div className="p-6">
                <p className="text-xl font-bold text-white mb-6">
                  NYC 74-76&deg;F&nbsp;&mdash; Saturday
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-surface-300 pb-4">
                    <span className="text-sm text-surface-600 font-mono">
                      NOAA Confidence
                    </span>
                    <span className="text-sm font-bold text-brand-400 font-mono">
                      94%
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-surface-300 pb-4">
                    <span className="text-sm text-surface-600 font-mono">
                      Market Price
                    </span>
                    <span className="text-sm font-bold text-white font-mono">
                      11&cent;
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-surface-300 pb-4">
                    <span className="text-sm text-surface-600 font-mono">
                      Expected Value
                    </span>
                    <span className="text-sm font-bold text-green-400 font-mono">
                      +$0.83/trade
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-600 font-mono">
                      Result
                    </span>
                    <span className="text-sm font-bold text-green-400 font-mono">
                      Filled at 47&cent; &rarr; +$0.36 profit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Performance ──────────────────────────────────────────── */}
      <section className="bg-surface-50 py-24 sm:py-32 border-y border-surface-300">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Paper Trading Results
          </h2>
          <p className="text-lg text-surface-600 mb-12">Updated daily.</p>

          <div className="max-w-5xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-300">
                    <th className="text-left py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                      Strategy
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                      30D Return
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                      Win Rate
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                      Max Drawdown
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.map((row) => (
                    <tr
                      key={row.strategy}
                      className="border-b border-surface-300 last:border-0"
                    >
                      <td className="py-4 px-6 font-medium text-white">
                        {row.strategy}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-green-400">
                        {row.return30d}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-surface-800">
                        {row.winRate}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-red-400">
                        {row.maxDrawdown}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-xs text-surface-600">
              Past performance&nbsp;&mdash; simulated or live&nbsp;&mdash; does
              not guarantee future results. Paper trading uses real market data
              but no actual capital is at risk.
            </p>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ─────────────────────────────────────────────── */}
      <section className="bg-surface-0 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureCards.map((card) => (
              <Card key={card.title}>
                <CardHeader>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                  <CardDescription className="leading-relaxed mt-2">
                    {card.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-surface-50 border-y border-surface-300 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Start Trading in 60 Seconds
          </h2>
          <p className="mt-6 text-lg text-surface-800 max-w-xl mx-auto">
            Create a free account. Deploy a paper bot. Watch it trade.
          </p>
          <div className="mt-10">
            <Link href="/signup">
              <Button
                size="xl"
                className="bg-brand-600 text-white hover:bg-brand-500 px-12"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Risk Disclaimer ───────────────────────────────────────────── */}
      <section className="bg-surface-0 border-t border-surface-300 py-8">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="flex items-start gap-3 text-surface-600">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              <strong className="text-surface-800">Risk Disclaimer:</strong>{" "}
              Trading prediction markets involves significant risk and is not
              suitable for all individuals. Past performance of any strategy,
              whether simulated or live, does not guarantee future results. You
              should not trade with funds you cannot afford to lose. MarketPilot
              provides tools and automation&nbsp;&mdash; it does not provide
              financial advice. Please review our{" "}
              <Link
                href="/risk-disclosure"
                className="text-brand-400 hover:text-brand-300 underline"
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

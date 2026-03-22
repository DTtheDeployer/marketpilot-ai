import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@marketpilot/ui";
import {
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Activity,
} from "lucide-react";

export default function MeanReversionPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="muted">Free</Badge>
              <Badge variant="warning">Moderate Risk</Badge>
              <Badge variant="paper">Statistical</Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-surface-900 leading-tight">
              Mean Reversion
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-surface-700 leading-relaxed">
              When prices spike away from their average, bet on them snapping
              back. Markets overreact to news &mdash; this strategy profits from
              the correction.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="xl">
                  Paper Trade This Strategy
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/strategies">
                <Button variant="outline" size="xl">
                  All Strategies
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works — Visual ─────────────────────────────────────── */}
      <section className="border-y border-surface-300 bg-surface-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-surface-700 mb-16 max-w-2xl">
            The bot watches for prices that deviate significantly from their
            moving average, then trades the expected snap-back.
          </p>

          {/* Visual: Price vs Moving Average */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-surface-100 border border-surface-300 p-6 sm:p-8">
              <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-6">
                Price vs. 20-Period Moving Average
              </p>
              {/* Simplified ASCII-style chart visualization */}
              <div className="space-y-1 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-surface-600 w-12 text-right">70&cent;</span>
                  <div className="flex-1 h-6 relative">
                    <div className="absolute left-[65%] top-0 bg-red-400/20 border border-red-400/40 px-2 py-0.5 text-red-400 font-bold text-[10px]">
                      SELL HERE &darr;
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-surface-600 w-12 text-right">65&cent;</span>
                  <div className="flex-1 h-6 relative">
                    <div className="absolute left-[60%] w-[15%] h-full bg-red-400/10 border-t-2 border-red-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-surface-600 w-12 text-right">55&cent;</span>
                  <div className="flex-1 h-6 relative">
                    <div className="absolute left-0 right-0 h-px bg-brand-400/50 top-1/2 border-dashed border-t border-brand-400/50" />
                    <span className="absolute right-0 text-brand-400 text-[10px]">
                      &larr; 20-day avg (50&cent;)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-surface-600 w-12 text-right">40&cent;</span>
                  <div className="flex-1 h-6 relative">
                    <div className="absolute left-[20%] w-[15%] h-full bg-green-400/10 border-b-2 border-green-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-surface-600 w-12 text-right">35&cent;</span>
                  <div className="flex-1 h-6 relative">
                    <div className="absolute left-[25%] top-0 bg-green-400/20 border border-green-400/40 px-2 py-0.5 text-green-400 font-bold text-[10px]">
                      BUY HERE &uarr;
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-6 pt-4 border-t border-surface-300 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-brand-400" />
                  <span className="text-surface-600">Moving Average</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400/20 border border-green-400/40" />
                  <span className="text-surface-600">Buy zone (2+ std dev below)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400/20 border border-red-400/40" />
                  <span className="text-surface-600">Sell zone (2+ std dev above)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Flow cards */}
          <div className="hidden lg:grid grid-cols-4 gap-0 items-start">
            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 w-full p-6">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                  01 &mdash; DETECT
                </p>
                <div className="text-3xl mb-3">&#128200;</div>
                <p className="text-sm font-bold text-surface-900 font-mono mb-1">
                  Price Deviation
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Current</span>
                    <span className="text-surface-900">65&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">20D avg</span>
                    <span className="text-surface-900">50&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Z-score</span>
                    <span className="text-red-400 font-bold">+3.2</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-300" />
              <div className="text-surface-600">&darr;</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 w-full p-6">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                  02 &mdash; SIGNAL
                </p>
                <div className="text-3xl mb-3">&#128680;</div>
                <p className="text-sm font-bold text-surface-900 font-mono mb-1">
                  Overextended
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Direction</span>
                    <span className="text-red-400 font-bold">SELL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Threshold</span>
                    <span className="text-surface-900">Z &gt; 2.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Confidence</span>
                    <span className="text-brand-400 font-bold">High</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-300" />
              <div className="text-surface-600">&darr;</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 border-brand-500/30 w-full p-6">
                <p className="text-xs font-mono text-brand-400 uppercase tracking-wider mb-4">
                  03 &mdash; TRADE
                </p>
                <div className="text-3xl mb-3">&#9889;</div>
                <p className="text-sm font-bold text-brand-400 font-mono mb-1">
                  Sell YES @ 65&cent;
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Entry</span>
                    <span className="text-surface-900">65&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Target</span>
                    <span className="text-surface-900">52&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Stop</span>
                    <span className="text-red-400">72&cent;</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-300" />
              <div className="text-surface-600">&darr;</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 border-green-500/30 w-full p-6">
                <p className="text-xs font-mono text-green-400 uppercase tracking-wider mb-4">
                  04 &mdash; REVERT
                </p>
                <div className="text-3xl mb-3">&#9989;</div>
                <p className="text-sm font-bold text-green-400 font-mono mb-1">
                  Price Reverts to 52&cent;
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Entry</span>
                    <span className="text-surface-900">65&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Exit</span>
                    <span className="text-surface-900">52&cent;</span>
                  </div>
                  <div className="flex justify-between border-t border-surface-300 pt-2">
                    <span className="text-surface-600">Profit</span>
                    <span className="text-green-400 font-bold">+13&cent;/share</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: vertical stack */}
          <div className="lg:hidden space-y-4">
            {[
              {
                step: "01", label: "DETECT", source: "Price Deviation",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["Current", "65\u00A2", "text-surface-900"],
                  ["20D avg", "50\u00A2", "text-surface-900"],
                  ["Z-score", "+3.2", "text-red-400 font-bold"],
                ],
              },
              {
                step: "02", label: "SIGNAL", source: "Overextended",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["Direction", "SELL", "text-red-400 font-bold"],
                  ["Threshold", "Z > 2.0", "text-surface-900"],
                  ["Confidence", "High", "text-brand-400 font-bold"],
                ],
              },
              {
                step: "03", label: "TRADE", source: "Sell YES @ 65\u00A2",
                color: "text-brand-400", borderColor: "border-brand-500/30",
                rows: [
                  ["Entry", "65\u00A2", "text-surface-900"],
                  ["Target", "52\u00A2", "text-surface-900"],
                  ["Stop", "72\u00A2", "text-red-400"],
                ],
              },
              {
                step: "04", label: "REVERT", source: "Price Reverts to 52\u00A2",
                color: "text-green-400", borderColor: "border-green-500/30",
                rows: [
                  ["Entry", "65\u00A2", "text-surface-900"],
                  ["Exit", "52\u00A2", "text-surface-900"],
                  ["Profit", "+13\u00A2/share", "text-green-400 font-bold"],
                ],
              },
            ].map((card) => (
              <div
                key={card.step}
                className={`bg-surface-100 border border-surface-300 ${card.borderColor} p-6`}
              >
                <p className={`text-xs font-mono ${card.color} uppercase tracking-wider mb-3`}>
                  {card.step} &mdash; {card.label}
                </p>
                <p className={`text-sm font-bold ${card.color} font-mono`}>
                  {card.source}
                </p>
                <div className="mt-3 space-y-2 font-mono text-sm">
                  {card.rows.map(([label, value, cls]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-surface-600">{label}</span>
                      <span className={cls}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── One Trade, Explained ──────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
            One Trade, Explained
          </h2>
          <p className="text-lg text-surface-700 mb-12 max-w-2xl">
            A real example of how the bot catches a price overreaction.
          </p>

          <div className="max-w-3xl">
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center mb-3">
                  <Activity className="h-5 w-5 text-brand-400" />
                </div>
                <CardTitle>
                  &ldquo;Will GDP growth exceed 3%?&rdquo;
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 font-mono text-sm">
                  <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-4 space-y-2">
                    <p className="text-surface-600">
                      <span className="text-surface-900">Current price:</span>{" "}
                      65&cent; (spiked on rumor)
                    </p>
                    <p className="text-surface-600">
                      <span className="text-surface-900">20-day average:</span>{" "}
                      50&cent;
                    </p>
                    <p className="text-surface-600">
                      <span className="text-surface-900">Z-score:</span>{" "}
                      <span className="text-red-400 font-bold">+3.2</span> (2+
                      std deviations above mean)
                    </p>
                    <div className="border-t border-surface-300 pt-2 mt-2">
                      <p className="text-surface-600">
                        <span className="text-surface-900">Signal:</span> SELL
                        &mdash; price likely to revert toward mean
                      </p>
                      <p className="text-surface-600">
                        <span className="text-surface-900">Entry:</span> Sell YES
                        @ 65&cent;
                      </p>
                      <p className="text-surface-600">
                        <span className="text-surface-900">Hold time:</span> 6
                        hours
                      </p>
                    </div>
                    <div className="border-t border-surface-300 pt-2 mt-2">
                      <p className="text-surface-600">
                        <span className="text-surface-900">
                          Price reverts to 52&cent;
                        </span>{" "}
                        as rumor fades
                      </p>
                      <p className="text-green-400 font-bold">
                        Profit: +13&cent;/share (20% return)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── What To Expect — Scenario Cards ───────────────────────────── */}
      <section className="border-y border-surface-300 bg-surface-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
            What To Expect
          </h2>
          <p className="text-lg text-surface-700 mb-16 max-w-2xl">
            Medium frequency, holds 2&ndash;12 hours. Works best in choppy,
            range-bound markets.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="bg-surface-100 border border-surface-300 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <p className="text-sm font-bold text-surface-900 uppercase tracking-wider">
                  Conservative
                </p>
              </div>
              <div className="mb-6">
                <p className="text-sm font-mono text-surface-600 mb-1">
                  Starting with $500
                </p>
                <p className="text-4xl font-bold text-surface-900 font-mono">
                  $540<span className="text-2xl text-surface-600">&ndash;</span>$570
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-blue-400">+8&ndash;14%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-blue-400" style={{ width: "25%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/day</span>
                  <span className="text-surface-900">1&ndash;3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Z-score filter</span>
                  <span className="text-surface-900">&gt; 3.0 only</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-surface-900">$30/day</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-100 border-2 border-brand-500 p-8 relative">
              <div className="absolute -top-3 right-6">
                <span className="bg-brand-500 text-white text-xs font-bold font-mono px-3 py-1 uppercase tracking-wider">
                  Popular
                </span>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-brand-400" />
                <p className="text-sm font-bold text-surface-900 uppercase tracking-wider">
                  Moderate
                </p>
              </div>
              <div className="mb-6">
                <p className="text-sm font-mono text-surface-600 mb-1">
                  Starting with $500
                </p>
                <p className="text-4xl font-bold text-surface-900 font-mono">
                  $590<span className="text-2xl text-surface-600">&ndash;</span>$620
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-brand-400">+18&ndash;24%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: "50%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/day</span>
                  <span className="text-surface-900">3&ndash;6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Z-score filter</span>
                  <span className="text-surface-900">&gt; 2.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-surface-900">$50/day</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-100 border border-surface-300 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <p className="text-sm font-bold text-surface-900 uppercase tracking-wider">
                  Aggressive
                </p>
              </div>
              <div className="mb-6">
                <p className="text-sm font-mono text-surface-600 mb-1">
                  Starting with $500
                </p>
                <p className="text-4xl font-bold text-surface-900 font-mono">
                  $650<span className="text-2xl text-surface-600">&ndash;</span>$750
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-amber-400">+30&ndash;50%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: "80%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/day</span>
                  <span className="text-surface-900">6&ndash;10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Z-score filter</span>
                  <span className="text-surface-900">&gt; 1.5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-surface-900">$100/day</span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-8 text-xs text-surface-600 text-center max-w-2xl mx-auto">
            Projections based on backtest data. Actual results will vary. Past
            performance does not guarantee future returns.
          </p>
        </div>
      </section>

      {/* ── Stats Grid ────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-12 text-center">
            Key Stats
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-surface-100 border border-surface-300 p-6 text-center">
              <p className="text-4xl font-bold font-mono text-surface-900">
                63%
              </p>
              <p className="text-sm text-surface-600 mt-2">Win Rate</p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-6 text-center">
              <p className="text-4xl font-bold font-mono text-green-400">
                +19.3%
              </p>
              <p className="text-sm text-surface-600 mt-2">30-Day Return</p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-6 text-center">
              <p className="text-4xl font-bold font-mono text-red-400">
                -6.4%
              </p>
              <p className="text-sm text-surface-600 mt-2">Max Drawdown</p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-6 text-center">
              <p className="text-4xl font-bold font-mono text-surface-900">
                80+
              </p>
              <p className="text-sm text-surface-600 mt-2">Trades / Month</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Risk Section ──────────────────────────────────────────────── */}
      <section className="border-y border-surface-300 bg-surface-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="h-6 w-6 text-brand-400" />
              <h2 className="text-3xl font-bold text-surface-900">
                Risk Profile
              </h2>
            </div>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm font-mono text-surface-600">Risk Level:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-8 h-3 ${level <= 3 ? "bg-amber-400" : "bg-surface-300"}`}
                  />
                ))}
              </div>
              <Badge variant="warning">3 / 5</Badge>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">
                  What Can Go Wrong
                </h3>
                <ul className="space-y-3 text-sm text-surface-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      <strong className="text-surface-900">Trending markets:</strong>{" "}
                      When a real fundamental shift happens, the &ldquo;mean&rdquo;
                      itself moves. The price isn&apos;t reverting &mdash;
                      it&apos;s re-pricing permanently.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      <strong className="text-surface-900">Extended deviations:</strong>{" "}
                      Prices can stay &ldquo;irrational&rdquo; longer than the bot
                      can hold. A Z-score of 3 can go to 5 before reverting.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      <strong className="text-surface-900">Low liquidity:</strong>{" "}
                      In thin markets, the &ldquo;average&rdquo; itself may be
                      noisy and unreliable as a signal.
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">
                  How the Bot Handles It
                </h3>
                <ul className="space-y-3 text-sm text-surface-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      Hard stop-losses on every trade &mdash; if price moves
                      further against the position, exit automatically.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      Trend filter &mdash; skips signals when the 50-period
                      moving average is trending strongly in one direction.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      Minimum volume requirement ensures the bot only trades
                      markets with reliable price data.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <Activity className="h-12 w-12 text-brand-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-surface-900">
            Paper Trade Mean Reversion
          </h2>
          <p className="mt-4 text-lg text-surface-700">
            Watch the bot catch price overreactions in real time &mdash; with
            simulated capital and zero risk.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">
                Paper Trade This Strategy
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/strategies">
              <Button variant="outline" size="lg">
                Browse All Strategies
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
              whether simulated or live, does not guarantee future results.
              Backtest results reflect hypothetical performance and have inherent
              limitations. You should not trade with funds you cannot afford to
              lose. MarketPilot provides tools and automation &mdash; it does not
              provide financial advice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

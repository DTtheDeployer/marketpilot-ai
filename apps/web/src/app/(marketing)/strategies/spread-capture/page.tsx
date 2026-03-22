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
  ArrowLeftRight,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function SpreadCapturePage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="muted">Free</Badge>
              <Badge variant="default">Low Risk</Badge>
              <Badge variant="paper">Passive Income</Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-surface-900 leading-tight">
              Spread Capture
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-surface-700 leading-relaxed">
              Place limit orders on both sides of the spread. When both fill,
              you capture the gap as profit &mdash; no directional bet required.
              Pure market-making income.
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

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section className="border-y border-surface-300 bg-surface-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-surface-700 mb-16 max-w-2xl">
            The bot acts as a market maker &mdash; providing liquidity on both
            sides and profiting from the gap between bid and ask.
          </p>

          {/* Desktop: horizontal flow */}
          <div className="hidden lg:grid grid-cols-3 gap-0 items-start">
            {/* Card 1 — Place Bid */}
            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 w-full p-6">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                  01 &mdash; BID
                </p>
                <div className="text-3xl mb-3">&#128178;</div>
                <p className="text-sm font-bold text-surface-900 font-mono mb-1">
                  Place Bid @ 48&cent;
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Side</span>
                    <span className="text-green-400 font-bold">BUY YES</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Price</span>
                    <span className="text-surface-900">48&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Type</span>
                    <span className="text-surface-900">Limit Order</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-300" />
              <div className="text-surface-600">&darr;</div>
            </div>

            {/* Card 2 — Place Ask */}
            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 w-full p-6">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                  02 &mdash; ASK
                </p>
                <div className="text-3xl mb-3">&#128184;</div>
                <p className="text-sm font-bold text-surface-900 font-mono mb-1">
                  Place Ask @ 52&cent;
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Side</span>
                    <span className="text-red-400 font-bold">SELL YES</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Price</span>
                    <span className="text-surface-900">52&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Type</span>
                    <span className="text-surface-900">Limit Order</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-300" />
              <div className="text-surface-600">&darr;</div>
            </div>

            {/* Card 3 — Profit */}
            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 border-green-500/30 w-full p-6">
                <p className="text-xs font-mono text-green-400 uppercase tracking-wider mb-4">
                  03 &mdash; PROFIT
                </p>
                <div className="text-3xl mb-3">&#9989;</div>
                <p className="text-sm font-bold text-green-400 font-mono mb-1">
                  Both Fill = +4&cent; Profit
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Buy cost</span>
                    <span className="text-surface-900">48&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Sell revenue</span>
                    <span className="text-surface-900">52&cent;</span>
                  </div>
                  <div className="flex justify-between border-t border-surface-300 pt-2">
                    <span className="text-surface-600">Net profit</span>
                    <span className="text-green-400 font-bold">+4&cent;/share</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Direction risk</span>
                    <span className="text-green-400 font-bold">None</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: vertical stack */}
          <div className="lg:hidden space-y-4">
            {[
              {
                step: "01", label: "BID", source: "Place Bid @ 48\u00A2",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["Side", "BUY YES", "text-green-400 font-bold"],
                  ["Price", "48\u00A2", "text-surface-900"],
                  ["Type", "Limit Order", "text-surface-900"],
                ],
              },
              {
                step: "02", label: "ASK", source: "Place Ask @ 52\u00A2",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["Side", "SELL YES", "text-red-400 font-bold"],
                  ["Price", "52\u00A2", "text-surface-900"],
                  ["Type", "Limit Order", "text-surface-900"],
                ],
              },
              {
                step: "03", label: "PROFIT", source: "Both Fill = +4\u00A2 Profit",
                color: "text-green-400", borderColor: "border-green-500/30",
                rows: [
                  ["Buy cost", "48\u00A2", "text-surface-900"],
                  ["Sell revenue", "52\u00A2", "text-surface-900"],
                  ["Net profit", "+4\u00A2/share", "text-green-400 font-bold"],
                  ["Direction risk", "None", "text-green-400 font-bold"],
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
            A real example of how the bot captures a spread.
          </p>

          <div className="max-w-3xl">
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center mb-3">
                  <ArrowLeftRight className="h-5 w-5 text-brand-400" />
                </div>
                <CardTitle>
                  &ldquo;Will BTC hit $200K by June?&rdquo;
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 font-mono text-sm">
                  <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-4 space-y-2">
                    <p className="text-surface-600">
                      <span className="text-surface-900">Market spread:</span>{" "}
                      48&cent; bid / 52&cent; ask
                    </p>
                    <p className="text-surface-600">
                      <span className="text-surface-900">Spread width:</span>{" "}
                      4&cent; (8.3%)
                    </p>
                    <div className="border-t border-surface-300 pt-2 mt-2">
                      <p className="text-surface-600">
                        <span className="text-surface-900">Bot places:</span>{" "}
                        BUY YES @ 48&cent;, SELL YES @ 52&cent;
                      </p>
                      <p className="text-surface-600">
                        <span className="text-surface-900">Shares:</span> 100
                      </p>
                      <p className="text-surface-600">
                        <span className="text-surface-900">Cost basis:</span>{" "}
                        $48.00
                      </p>
                    </div>
                    <div className="border-t border-surface-300 pt-2 mt-2">
                      <p className="text-surface-600">
                        <span className="text-surface-900">Both sides fill.</span>{" "}
                        No directional exposure.
                      </p>
                      <p className="text-green-400 font-bold">
                        Profit: +$4.00 (8.3% round-trip)
                      </p>
                      <p className="text-surface-600">
                        <span className="text-surface-900">Time held:</span> ~12
                        minutes
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
            Low returns per trade, high frequency. Steady compounding over time.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Conservative */}
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
                  $520<span className="text-2xl text-surface-600">&ndash;</span>$540
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-blue-400">+4&ndash;8%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-blue-400" style={{ width: "20%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/day</span>
                  <span className="text-surface-900">5&ndash;8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Spread filter</span>
                  <span className="text-surface-900">Wide spreads only</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-surface-900">$25/day</span>
                </div>
              </div>
            </div>

            {/* Moderate — POPULAR */}
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
                  $555<span className="text-2xl text-surface-600">&ndash;</span>$575
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-brand-400">+11&ndash;15%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: "45%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/day</span>
                  <span className="text-surface-900">8&ndash;15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Spread filter</span>
                  <span className="text-surface-900">Medium+ spreads</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-surface-900">$50/day</span>
                </div>
              </div>
            </div>

            {/* Aggressive */}
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
                  $590<span className="text-2xl text-surface-600">&ndash;</span>$625
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-amber-400">+18&ndash;25%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: "70%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/day</span>
                  <span className="text-surface-900">15&ndash;25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Spread filter</span>
                  <span className="text-surface-900">All spreads &gt;2&cent;</span>
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
                84%
              </p>
              <p className="text-sm text-surface-600 mt-2">Win Rate</p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-6 text-center">
              <p className="text-4xl font-bold font-mono text-green-400">
                +11.8%
              </p>
              <p className="text-sm text-surface-600 mt-2">30-Day Return</p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-6 text-center">
              <p className="text-4xl font-bold font-mono text-red-400">
                -2.1%
              </p>
              <p className="text-sm text-surface-600 mt-2">Max Drawdown</p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-6 text-center">
              <p className="text-4xl font-bold font-mono text-surface-900">
                200+
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
                    className={`w-8 h-3 ${level <= 2 ? "bg-green-400" : "bg-surface-300"}`}
                  />
                ))}
              </div>
              <Badge variant="success">2 / 5</Badge>
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
                      <strong className="text-surface-900">Inventory risk:</strong>{" "}
                      One side fills but the other doesn&apos;t. You&apos;re left
                      holding a directional position until the other side fills or
                      you exit.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      <strong className="text-surface-900">Spread compression:</strong>{" "}
                      If more market makers enter, spreads narrow and per-trade
                      profit decreases.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      <strong className="text-surface-900">Fast market moves:</strong>{" "}
                      A sudden price spike can fill one side and move the market
                      before the other side fills.
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
                      Inventory time limits &mdash; if one side doesn&apos;t fill
                      within 30 minutes, the open order is cancelled and the filled
                      position is exited at market.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      Maximum inventory cap prevents holding more than 500 shares
                      on one side at any time.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      Minimum spread filter &mdash; only enters markets with
                      spreads wide enough to cover fees and slippage.
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
          <ArrowLeftRight className="h-12 w-12 text-brand-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-surface-900">
            Paper Trade Spread Capture
          </h2>
          <p className="mt-4 text-lg text-surface-700">
            Watch the bot capture spreads in real time with zero risk. Free on
            all plans.
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

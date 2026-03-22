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
  BarChart3,
} from "lucide-react";

export default function OrderbookImbalancePage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="default">Pro</Badge>
              <Badge variant="warning">Moderate Risk</Badge>
              <Badge variant="paper">Microstructure</Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-surface-900 leading-tight">
              Orderbook Imbalance
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-surface-700 leading-relaxed">
              When there&apos;s way more buy orders than sell orders, price is
              about to move up. The bot reads the orderbook and positions ahead
              of the crowd.
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
            The bot monitors orderbook depth in real time. When one side
            massively outweighs the other, it trades in the direction of the
            imbalance.
          </p>

          {/* Visual: Simplified Orderbook */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="bg-surface-100 border border-surface-300 p-6 sm:p-8">
              <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-6">
                Orderbook Depth &mdash; Imbalance Detected
              </p>
              <div className="grid grid-cols-2 gap-4">
                {/* Bids (left, tall) */}
                <div>
                  <p className="text-xs font-mono text-green-400 font-bold mb-3 text-center">
                    BIDS (Buyers)
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-end justify-end gap-2">
                      <span className="text-xs font-mono text-surface-600">48&cent;</span>
                      <div className="h-4 bg-green-400/30 border border-green-400/50" style={{ width: "90%" }} />
                    </div>
                    <div className="flex items-end justify-end gap-2">
                      <span className="text-xs font-mono text-surface-600">47&cent;</span>
                      <div className="h-4 bg-green-400/30 border border-green-400/50" style={{ width: "80%" }} />
                    </div>
                    <div className="flex items-end justify-end gap-2">
                      <span className="text-xs font-mono text-surface-600">46&cent;</span>
                      <div className="h-4 bg-green-400/30 border border-green-400/50" style={{ width: "95%" }} />
                    </div>
                    <div className="flex items-end justify-end gap-2">
                      <span className="text-xs font-mono text-surface-600">45&cent;</span>
                      <div className="h-4 bg-green-400/30 border border-green-400/50" style={{ width: "70%" }} />
                    </div>
                    <div className="flex items-end justify-end gap-2">
                      <span className="text-xs font-mono text-surface-600">44&cent;</span>
                      <div className="h-4 bg-green-400/30 border border-green-400/50" style={{ width: "60%" }} />
                    </div>
                  </div>
                  <p className="text-sm font-mono text-green-400 font-bold mt-3 text-center">
                    5,000 shares
                  </p>
                </div>

                {/* Asks (right, short) */}
                <div>
                  <p className="text-xs font-mono text-red-400 font-bold mb-3 text-center">
                    ASKS (Sellers)
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-end gap-2">
                      <div className="h-4 bg-red-400/30 border border-red-400/50" style={{ width: "15%" }} />
                      <span className="text-xs font-mono text-surface-600">52&cent;</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="h-4 bg-red-400/30 border border-red-400/50" style={{ width: "10%" }} />
                      <span className="text-xs font-mono text-surface-600">53&cent;</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="h-4 bg-red-400/30 border border-red-400/50" style={{ width: "20%" }} />
                      <span className="text-xs font-mono text-surface-600">54&cent;</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="h-4 bg-red-400/30 border border-red-400/50" style={{ width: "8%" }} />
                      <span className="text-xs font-mono text-surface-600">55&cent;</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="h-4 bg-red-400/30 border border-red-400/50" style={{ width: "12%" }} />
                      <span className="text-xs font-mono text-surface-600">56&cent;</span>
                    </div>
                  </div>
                  <p className="text-sm font-mono text-red-400 font-bold mt-3 text-center">
                    800 shares
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-surface-300 flex items-center justify-between">
                <div className="text-xs font-mono">
                  <span className="text-surface-600">Imbalance ratio: </span>
                  <span className="text-brand-400 font-bold">6.25x</span>
                  <span className="text-surface-600"> (bids &gt; asks)</span>
                </div>
                <div className="bg-green-400/20 border border-green-400/40 px-3 py-1 text-green-400 font-bold text-xs font-mono">
                  SIGNAL: BUY &uarr;
                </div>
              </div>
            </div>
          </div>

          {/* Flow cards */}
          <div className="hidden lg:grid grid-cols-3 gap-0 items-start">
            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 w-full p-6">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                  01 &mdash; SCAN
                </p>
                <div className="text-3xl mb-3">&#128218;</div>
                <p className="text-sm font-bold text-surface-900 font-mono mb-1">
                  Read Orderbook
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Bid depth</span>
                    <span className="text-green-400 font-bold">5,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Ask depth</span>
                    <span className="text-red-400 font-bold">800</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Ratio</span>
                    <span className="text-brand-400 font-bold">6.25x</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-300" />
              <div className="text-surface-600">&darr;</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 border-brand-500/30 w-full p-6">
                <p className="text-xs font-mono text-brand-400 uppercase tracking-wider mb-4">
                  02 &mdash; TRADE
                </p>
                <div className="text-3xl mb-3">&#9889;</div>
                <p className="text-sm font-bold text-brand-400 font-mono mb-1">
                  Buy YES @ 50&cent;
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Direction</span>
                    <span className="text-green-400 font-bold">LONG</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Target</span>
                    <span className="text-surface-900">+3&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Stop</span>
                    <span className="text-red-400">-2&cent;</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-300" />
              <div className="text-surface-600">&darr;</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 border-green-500/30 w-full p-6">
                <p className="text-xs font-mono text-green-400 uppercase tracking-wider mb-4">
                  03 &mdash; PROFIT
                </p>
                <div className="text-3xl mb-3">&#9989;</div>
                <p className="text-sm font-bold text-green-400 font-mono mb-1">
                  Price Moves +3&cent;
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Entry</span>
                    <span className="text-surface-900">50&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Exit</span>
                    <span className="text-surface-900">53&cent;</span>
                  </div>
                  <div className="flex justify-between border-t border-surface-300 pt-2">
                    <span className="text-surface-600">Profit</span>
                    <span className="text-green-400 font-bold">+3&cent;/share</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Time held</span>
                    <span className="text-surface-900">10 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: vertical stack */}
          <div className="lg:hidden space-y-4">
            {[
              {
                step: "01", label: "SCAN", source: "Read Orderbook",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["Bid depth", "5,000", "text-green-400 font-bold"],
                  ["Ask depth", "800", "text-red-400 font-bold"],
                  ["Ratio", "6.25x", "text-brand-400 font-bold"],
                ],
              },
              {
                step: "02", label: "TRADE", source: "Buy YES @ 50\u00A2",
                color: "text-brand-400", borderColor: "border-brand-500/30",
                rows: [
                  ["Direction", "LONG", "text-green-400 font-bold"],
                  ["Target", "+3\u00A2", "text-surface-900"],
                  ["Stop", "-2\u00A2", "text-red-400"],
                ],
              },
              {
                step: "03", label: "PROFIT", source: "Price Moves +3\u00A2",
                color: "text-green-400", borderColor: "border-green-500/30",
                rows: [
                  ["Entry", "50\u00A2", "text-surface-900"],
                  ["Exit", "53\u00A2", "text-surface-900"],
                  ["Profit", "+3\u00A2/share", "text-green-400 font-bold"],
                  ["Time held", "10 min", "text-surface-900"],
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
            A real example of how the bot reads the orderbook and profits from
            an imbalance.
          </p>

          <div className="max-w-3xl">
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center mb-3">
                  <BarChart3 className="h-5 w-5 text-brand-400" />
                </div>
                <CardTitle>
                  &ldquo;Will Fed cut rates before July?&rdquo;
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 font-mono text-sm">
                  <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-4 space-y-2">
                    <p className="text-surface-600">
                      <span className="text-surface-900">Bid depth:</span>{" "}
                      5,000 shares across 5 price levels
                    </p>
                    <p className="text-surface-600">
                      <span className="text-surface-900">Ask depth:</span>{" "}
                      800 shares across 5 price levels
                    </p>
                    <p className="text-surface-600">
                      <span className="text-surface-900">Imbalance ratio:</span>{" "}
                      <span className="text-brand-400 font-bold">6.25x</span>{" "}
                      (threshold: 3.0x)
                    </p>
                    <div className="border-t border-surface-300 pt-2 mt-2">
                      <p className="text-surface-600">
                        <span className="text-surface-900">Signal:</span> Heavy
                        buying pressure &rarr; BUY
                      </p>
                      <p className="text-surface-600">
                        <span className="text-surface-900">Entry:</span> Buy YES
                        @ 50&cent;
                      </p>
                      <p className="text-surface-600">
                        <span className="text-surface-900">Hold time:</span> 10
                        minutes
                      </p>
                    </div>
                    <div className="border-t border-surface-300 pt-2 mt-2">
                      <p className="text-surface-600">
                        <span className="text-surface-900">
                          Price moves to 53&cent;
                        </span>{" "}
                        as buy pressure absorbs asks
                      </p>
                      <p className="text-green-400 font-bold">
                        Profit: +3&cent;/share (6% return in 10 minutes)
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
            Very short holding periods (minutes). High frequency. Needs liquid
            markets to work.
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
                  Starting with $1,000
                </p>
                <p className="text-4xl font-bold text-surface-900 font-mono">
                  $1,060<span className="text-2xl text-surface-600">&ndash;</span>$1,090
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-blue-400">+6&ndash;9%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-blue-400" style={{ width: "25%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/day</span>
                  <span className="text-surface-900">3&ndash;5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Imbalance filter</span>
                  <span className="text-surface-900">&gt; 5x ratio</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-surface-900">$40/day</span>
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
                  Starting with $1,000
                </p>
                <p className="text-4xl font-bold text-surface-900 font-mono">
                  $1,120<span className="text-2xl text-surface-600">&ndash;</span>$1,180
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-brand-400">+12&ndash;18%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: "50%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/day</span>
                  <span className="text-surface-900">8&ndash;15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Imbalance filter</span>
                  <span className="text-surface-900">&gt; 3x ratio</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-surface-900">$75/day</span>
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
                  Starting with $1,000
                </p>
                <p className="text-4xl font-bold text-surface-900 font-mono">
                  $1,200<span className="text-2xl text-surface-600">&ndash;</span>$1,300
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-amber-400">+20&ndash;30%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: "75%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/day</span>
                  <span className="text-surface-900">15&ndash;30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Imbalance filter</span>
                  <span className="text-surface-900">&gt; 2x ratio</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-surface-900">$150/day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Capital Scale Table */}
          <div className="mt-16">
            <h3 className="text-xl font-bold text-white mb-2">Returns Scale With Capital</h3>
            <p className="text-sm text-surface-600 mb-8">Moderate scenario &mdash; 12&ndash;25% monthly return range</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-300">
                    <th className="pb-3 pr-6 text-left font-mono text-surface-600">Starting Capital</th>
                    <th className="pb-3 pr-6 text-left font-mono text-surface-600">Monthly Low</th>
                    <th className="pb-3 pr-6 text-left font-mono text-surface-600">Monthly High</th>
                    <th className="pb-3 pr-6 text-left font-mono text-surface-600">Trades/Day</th>
                    <th className="pb-3 text-left font-mono text-surface-600">Max Position</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {[
                    { capital: "$50", low: "+$6", high: "+$13", trades: "5\u20138", maxPos: "$8" },
                    { capital: "$100", low: "+$12", high: "+$25", trades: "6\u201310", maxPos: "$15" },
                    { capital: "$250", low: "+$30", high: "+$63", trades: "8\u201312", maxPos: "$35" },
                    { capital: "$500", low: "+$60", high: "+$125", trades: "8\u201315", maxPos: "$75" },
                    { capital: "$1,000", low: "+$120", high: "+$250", trades: "10\u201318", maxPos: "$150" },
                    { capital: "$5,000", low: "+$600", high: "+$1,250", trades: "12\u201320", maxPos: "$750" },
                  ].map((row) => (
                    <tr key={row.capital} className="border-b border-surface-300/50">
                      <td className="py-3 pr-6 text-surface-900">{row.capital}</td>
                      <td className="py-3 pr-6 text-green-400">{row.low}</td>
                      <td className="py-3 pr-6 text-green-400">{row.high}</td>
                      <td className="py-3 pr-6 text-surface-900">{row.trades}</td>
                      <td className="py-3 text-surface-900">{row.maxPos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Visual bar chart */}
            <div className="mt-8 space-y-3">
              {[
                { capital: "$50", range: "+$6\u2013$13", width: "5%" },
                { capital: "$100", range: "+$12\u2013$25", width: "10%" },
                { capital: "$250", range: "+$30\u2013$63", width: "25%" },
                { capital: "$500", range: "+$60\u2013$125", width: "50%" },
                { capital: "$1K", range: "+$120\u2013$250", width: "75%" },
                { capital: "$5K", range: "+$600\u2013$1.25K", width: "100%" },
              ].map((bar) => (
                <div key={bar.capital} className="flex items-center gap-4">
                  <span className="text-sm font-mono text-surface-600 w-12 text-right">{bar.capital}</span>
                  <div className="flex-1 h-6 bg-surface-300 overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: bar.width }} />
                  </div>
                  <span className="text-sm font-mono text-green-400 w-28">{bar.range}</span>
                </div>
              ))}
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
                67%
              </p>
              <p className="text-sm text-surface-600 mt-2">Win Rate</p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-6 text-center">
              <p className="text-4xl font-bold font-mono text-green-400">
                +15.2%
              </p>
              <p className="text-sm text-surface-600 mt-2">30-Day Return</p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-6 text-center">
              <p className="text-4xl font-bold font-mono text-red-400">
                -5.1%
              </p>
              <p className="text-sm text-surface-600 mt-2">Max Drawdown</p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-6 text-center">
              <p className="text-4xl font-bold font-mono text-surface-900">
                150+
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
                      <strong className="text-surface-900">False signals in thin markets:</strong>{" "}
                      A single large order can create an imbalance that
                      disappears immediately after being filled.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      <strong className="text-surface-900">Spoofing:</strong>{" "}
                      Some traders place large orders to create fake imbalances,
                      then cancel them before execution.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      <strong className="text-surface-900">Speed competition:</strong>{" "}
                      Other bots may be reading the same signal and react faster.
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
                      Minimum liquidity threshold &mdash; only trades markets
                      with at least $10K in daily volume.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      Persistence filter &mdash; imbalance must persist for at
                      least 30 seconds before triggering a trade.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      Tight stop-losses &mdash; exits immediately if price moves
                      against the position by more than 2&cent;.
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
          <BarChart3 className="h-12 w-12 text-brand-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-surface-900">
            Paper Trade Orderbook Imbalance
          </h2>
          <p className="mt-4 text-lg text-surface-700">
            Watch the bot read orderbook depth and execute trades in minutes
            &mdash; with simulated capital and zero risk.
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

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
  GitBranch,
} from "lucide-react";

export default function CrossMarketPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="paper">Elite</Badge>
              <Badge variant="danger">Higher Risk</Badge>
              <Badge variant="default">Arbitrage</Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-surface-900 leading-tight">
              Cross-Market Divergence
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-surface-700 leading-relaxed">
              Related markets should move together. When they diverge, trade
              the gap. Buy the cheap one, sell the expensive one, and profit
              when they converge back.
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
            The bot tracks pairs of correlated markets. When their prices
            diverge beyond a threshold, it trades both sides to capture the
            convergence.
          </p>

          {/* Visual: Two correlated price lines */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-surface-100 border border-surface-300 p-6 sm:p-8">
              <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-6">
                Correlated Markets &mdash; Divergence Detected
              </p>

              {/* Simplified dual-line visualization */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-brand-400 w-24 text-right font-bold">Market A</span>
                  <div className="flex-1 relative h-2 bg-surface-300">
                    <div className="absolute left-0 h-full bg-brand-400/40" style={{ width: "60%" }} />
                    <div className="absolute h-4 w-4 rounded-full bg-brand-400 border-2 border-surface-100 -top-1" style={{ left: "58%" }} />
                  </div>
                  <span className="text-xs font-mono text-brand-400 font-bold w-12">60&cent;</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-amber-400 w-24 text-right font-bold">Market B</span>
                  <div className="flex-1 relative h-2 bg-surface-300">
                    <div className="absolute left-0 h-full bg-amber-400/40" style={{ width: "35%" }} />
                    <div className="absolute h-4 w-4 rounded-full bg-amber-400 border-2 border-surface-100 -top-1" style={{ left: "33%" }} />
                  </div>
                  <span className="text-xs font-mono text-amber-400 font-bold w-12">35&cent;</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-surface-200/50 border border-surface-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-sm">
                  <div>
                    <span className="text-surface-600 text-xs">Historical correlation</span>
                    <p className="text-surface-900 font-bold">0.92</p>
                  </div>
                  <div>
                    <span className="text-surface-600 text-xs">Current spread</span>
                    <p className="text-red-400 font-bold">25&cent; (anomalous)</p>
                  </div>
                  <div>
                    <span className="text-surface-600 text-xs">Expected spread</span>
                    <p className="text-green-400 font-bold">5&ndash;8&cent; (normal)</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-6 text-xs font-mono">
                <div className="bg-green-400/20 border border-green-400/40 px-3 py-1.5 text-green-400 font-bold">
                  BUY Market B (cheap)
                </div>
                <span className="text-surface-600">+</span>
                <div className="bg-red-400/20 border border-red-400/40 px-3 py-1.5 text-red-400 font-bold">
                  SELL Market A (expensive)
                </div>
                <span className="text-surface-600">=</span>
                <span className="text-brand-400 font-bold">Trade the gap</span>
              </div>
            </div>
          </div>

          {/* Flow cards */}
          <div className="hidden lg:grid grid-cols-4 gap-0 items-start">
            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 w-full p-6">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                  01 &mdash; SCAN
                </p>
                <div className="text-3xl mb-3">&#128279;</div>
                <p className="text-sm font-bold text-surface-900 font-mono mb-1">
                  Find Correlated Pairs
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Pairs tracked</span>
                    <span className="text-surface-900">50+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Min correlation</span>
                    <span className="text-surface-900">0.85</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Updated</span>
                    <span className="text-surface-900">Every 5 min</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-300" />
              <div className="text-surface-600">&darr;</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 w-full p-6">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                  02 &mdash; DETECT
                </p>
                <div className="text-3xl mb-3">&#128680;</div>
                <p className="text-sm font-bold text-surface-900 font-mono mb-1">
                  Divergence Signal
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Market A</span>
                    <span className="text-surface-900">60&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Market B</span>
                    <span className="text-surface-900">35&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Spread</span>
                    <span className="text-red-400 font-bold">25&cent;</span>
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
                  Pairs Trade
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Buy</span>
                    <span className="text-green-400 font-bold">B @ 35&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Sell</span>
                    <span className="text-red-400 font-bold">A @ 60&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Net cost</span>
                    <span className="text-surface-900">$35 (100 shares B)</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-300" />
              <div className="text-surface-600">&darr;</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 border-green-500/30 w-full p-6">
                <p className="text-xs font-mono text-green-400 uppercase tracking-wider mb-4">
                  04 &mdash; CONVERGE
                </p>
                <div className="text-3xl mb-3">&#9989;</div>
                <p className="text-sm font-bold text-green-400 font-mono mb-1">
                  Spread Narrows
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">A moves to</span>
                    <span className="text-surface-900">52&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">B moves to</span>
                    <span className="text-surface-900">47&cent;</span>
                  </div>
                  <div className="flex justify-between border-t border-surface-300 pt-2">
                    <span className="text-surface-600">Profit on B</span>
                    <span className="text-green-400 font-bold">+12&cent;/share</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: vertical stack */}
          <div className="lg:hidden space-y-4">
            {[
              {
                step: "01", label: "SCAN", source: "Find Correlated Pairs",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["Pairs tracked", "50+", "text-surface-900"],
                  ["Min correlation", "0.85", "text-surface-900"],
                  ["Updated", "Every 5 min", "text-surface-900"],
                ],
              },
              {
                step: "02", label: "DETECT", source: "Divergence Signal",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["Market A", "60\u00A2", "text-surface-900"],
                  ["Market B", "35\u00A2", "text-surface-900"],
                  ["Spread", "25\u00A2", "text-red-400 font-bold"],
                ],
              },
              {
                step: "03", label: "TRADE", source: "Pairs Trade",
                color: "text-brand-400", borderColor: "border-brand-500/30",
                rows: [
                  ["Buy", "B @ 35\u00A2", "text-green-400 font-bold"],
                  ["Sell", "A @ 60\u00A2", "text-red-400 font-bold"],
                  ["Net cost", "$35 (100 shares B)", "text-surface-900"],
                ],
              },
              {
                step: "04", label: "CONVERGE", source: "Spread Narrows",
                color: "text-green-400", borderColor: "border-green-500/30",
                rows: [
                  ["A moves to", "52\u00A2", "text-surface-900"],
                  ["B moves to", "47\u00A2", "text-surface-900"],
                  ["Profit on B", "+12\u00A2/share", "text-green-400 font-bold"],
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
            A real example of how the bot exploits a divergence between two
            correlated political markets.
          </p>

          <div className="max-w-3xl">
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center mb-3">
                  <GitBranch className="h-5 w-5 text-brand-400" />
                </div>
                <CardTitle>
                  Presidential vs. Popular Vote Markets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 font-mono text-sm">
                  <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-4 space-y-2">
                    <p className="text-surface-600">
                      <span className="text-surface-900">Market A:</span>{" "}
                      &ldquo;Will Party X win presidency?&rdquo; &mdash;{" "}
                      <span className="text-brand-400 font-bold">60&cent;</span>
                    </p>
                    <p className="text-surface-600">
                      <span className="text-surface-900">Market B:</span>{" "}
                      &ldquo;Will Party X win popular vote?&rdquo; &mdash;{" "}
                      <span className="text-amber-400 font-bold">35&cent;</span>
                    </p>
                    <p className="text-surface-600">
                      <span className="text-surface-900">
                        Historical correlation:
                      </span>{" "}
                      <span className="text-brand-400 font-bold">0.92</span>
                    </p>
                    <p className="text-surface-600">
                      <span className="text-surface-900">Normal spread:</span>{" "}
                      5&ndash;8&cent;. <span className="text-surface-900">Current spread:</span>{" "}
                      <span className="text-red-400 font-bold">25&cent;</span>
                    </p>
                    <div className="border-t border-surface-300 pt-2 mt-2">
                      <p className="text-surface-600">
                        <span className="text-surface-900">Signal:</span>{" "}
                        Market B is underpriced relative to Market A. The
                        divergence is 3x normal.
                      </p>
                      <p className="text-surface-600">
                        <span className="text-surface-900">Action:</span> Buy
                        Market B YES @ 35&cent; (the cheap one)
                      </p>
                    </div>
                    <div className="border-t border-surface-300 pt-2 mt-2">
                      <p className="text-surface-600">
                        <span className="text-surface-900">
                          Over 3 days, spread narrows:
                        </span>{" "}
                        A moves to 52&cent;, B moves to 47&cent;
                      </p>
                      <p className="text-green-400 font-bold">
                        Profit on B: +12&cent;/share (34% return)
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
            Rare signals (1&ndash;3 per week), but high conviction and large
            payouts when they appear.
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
                  Starting with $2,000
                </p>
                <p className="text-4xl font-bold text-surface-900 font-mono">
                  $2,200<span className="text-2xl text-surface-600">&ndash;</span>$2,350
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-blue-400">+10&ndash;17%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-blue-400" style={{ width: "30%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/week</span>
                  <span className="text-surface-900">1&ndash;2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Min divergence</span>
                  <span className="text-surface-900">&gt; 3x normal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-surface-900">$100/day</span>
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
                  Starting with $2,000
                </p>
                <p className="text-4xl font-bold text-surface-900 font-mono">
                  $2,400<span className="text-2xl text-surface-600">&ndash;</span>$2,550
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-brand-400">+20&ndash;28%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: "55%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/week</span>
                  <span className="text-surface-900">2&ndash;3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Min divergence</span>
                  <span className="text-surface-900">&gt; 2x normal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-surface-900">$200/day</span>
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
                  Starting with $2,000
                </p>
                <p className="text-4xl font-bold text-surface-900 font-mono">
                  $2,600<span className="text-2xl text-surface-600">&ndash;</span>$3,000
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
                  <span className="text-surface-600">Trades/week</span>
                  <span className="text-surface-900">3&ndash;5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Min divergence</span>
                  <span className="text-surface-900">&gt; 1.5x normal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-surface-900">$400/day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Capital Scale Table */}
          <div className="mt-16">
            <h3 className="text-xl font-bold text-white mb-2">Returns Scale With Capital</h3>
            <p className="text-sm text-surface-600 mb-8">Moderate scenario &mdash; 18&ndash;35% monthly return range</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-300">
                    <th className="pb-3 pr-6 text-left font-mono text-surface-600">Starting Capital</th>
                    <th className="pb-3 pr-6 text-left font-mono text-surface-600">Monthly Low</th>
                    <th className="pb-3 pr-6 text-left font-mono text-surface-600">Monthly High</th>
                    <th className="pb-3 pr-6 text-left font-mono text-surface-600">Trades/Week</th>
                    <th className="pb-3 text-left font-mono text-surface-600">Max Position</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {[
                    { capital: "$50", low: "+$9", high: "+$18", trades: "1\u20132", maxPos: "$10" },
                    { capital: "$100", low: "+$18", high: "+$35", trades: "1\u20132", maxPos: "$20" },
                    { capital: "$250", low: "+$45", high: "+$88", trades: "2\u20133", maxPos: "$50" },
                    { capital: "$500", low: "+$90", high: "+$175", trades: "2\u20133", maxPos: "$100" },
                    { capital: "$1,000", low: "+$180", high: "+$350", trades: "2\u20134", maxPos: "$200" },
                    { capital: "$5,000", low: "+$900", high: "+$1,750", trades: "3\u20135", maxPos: "$1,000" },
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
                { capital: "$50", range: "+$9\u2013$18", width: "5%" },
                { capital: "$100", range: "+$18\u2013$35", width: "10%" },
                { capital: "$250", range: "+$45\u2013$88", width: "25%" },
                { capital: "$500", range: "+$90\u2013$175", width: "50%" },
                { capital: "$1K", range: "+$180\u2013$350", width: "75%" },
                { capital: "$5K", range: "+$900\u2013$1.75K", width: "100%" },
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
                72%
              </p>
              <p className="text-sm text-surface-600 mt-2">Win Rate</p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-6 text-center">
              <p className="text-4xl font-bold font-mono text-green-400">
                +22.4%
              </p>
              <p className="text-sm text-surface-600 mt-2">30-Day Return</p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-6 text-center">
              <p className="text-4xl font-bold font-mono text-red-400">
                -7.8%
              </p>
              <p className="text-sm text-surface-600 mt-2">Max Drawdown</p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-6 text-center">
              <p className="text-4xl font-bold font-mono text-surface-900">
                8+
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
                    className={`w-8 h-3 ${level <= 4 ? "bg-amber-400" : "bg-surface-300"}`}
                  />
                ))}
              </div>
              <Badge variant="warning">4 / 5</Badge>
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
                      <strong className="text-surface-900">Correlation breakdown:</strong>{" "}
                      The historical relationship between two markets can break
                      permanently due to a structural change (e.g., a new policy
                      that decouples the outcomes).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      <strong className="text-surface-900">Divergence widens:</strong>{" "}
                      The spread can get worse before it gets better. The bot
                      may be buying into a falling market.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      <strong className="text-surface-900">Liquidity risk:</strong>{" "}
                      Related markets often have lower volume, making it harder
                      to enter and exit at target prices.
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
                      Rolling correlation check &mdash; only trades pairs that
                      maintain &gt; 0.85 correlation over the trailing 30 days.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      Maximum divergence stop &mdash; if the spread widens to
                      5x normal, the bot exits the position to cap losses.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      Position limits &mdash; no more than 10% of bankroll on
                      any single pairs trade.
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
          <GitBranch className="h-12 w-12 text-brand-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-surface-900">
            Paper Trade Cross-Market Divergence
          </h2>
          <p className="mt-4 text-lg text-surface-700">
            Watch the bot find and trade cross-market mispricings &mdash; with
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

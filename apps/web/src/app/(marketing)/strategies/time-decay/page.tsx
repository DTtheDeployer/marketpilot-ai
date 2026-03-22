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
  Timer,
} from "lucide-react";

export default function TimeDecayPage() {
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
              <Badge variant="paper">Convergence</Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-surface-900 leading-tight">
              Time Decay Repricing
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-surface-700 leading-relaxed">
              As events approach resolution, uncertainty decreases and prices
              converge. Markets far from expected value near expiry are
              mispriced &mdash; and the clock is ticking.
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
            Prices must converge to 0&cent; or 100&cent; at resolution. Near
            expiry, the bot identifies markets that haven&apos;t priced this in
            yet.
          </p>

          {/* Visual: Convergence chart */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-surface-100 border border-surface-300 p-6 sm:p-8">
              <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-6">
                Price Convergence Toward Resolution
              </p>
              <div className="space-y-2">
                {/* Timeline representation */}
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-surface-600 w-20 text-right">30 days</span>
                  <div className="flex-1 relative h-8">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-surface-300" />
                    <div className="absolute top-0 left-[30%] w-2 h-2 rounded-full bg-surface-600" />
                    <span className="absolute top-3 left-[28%] text-surface-600 text-[10px]">30&cent;</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-surface-600 w-20 text-right">7 days</span>
                  <div className="flex-1 relative h-8">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-surface-300" />
                    <div className="absolute top-0 left-[35%] w-2 h-2 rounded-full bg-surface-600" />
                    <span className="absolute top-3 left-[33%] text-surface-600 text-[10px]">35&cent;</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-surface-600 w-20 text-right">48 hours</span>
                  <div className="flex-1 relative h-8">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-surface-300" />
                    <div className="absolute top-0 left-[22%] w-2 h-2 rounded-full bg-brand-400" />
                    <span className="absolute top-3 left-[20%] text-brand-400 text-[10px] font-bold">22&cent;</span>
                    <div className="absolute top-0 left-[28%] bg-green-400/20 border border-green-400/40 px-2 py-0.5 text-green-400 font-bold text-[10px]">
                      BUY HERE &mdash; mispriced
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-surface-600 w-20 text-right">6 hours</span>
                  <div className="flex-1 relative h-8 bg-brand-400/5 border-l-2 border-brand-400/30">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-surface-300" />
                    <div className="absolute top-0 left-[55%] w-2 h-2 rounded-full bg-brand-400" />
                    <span className="absolute top-3 left-[53%] text-brand-400 text-[10px]">55&cent;</span>
                    <span className="absolute top-3 right-0 text-brand-400/60 text-[10px]">convergence zone</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-surface-600 w-20 text-right font-bold">Resolved</span>
                  <div className="flex-1 relative h-8 bg-green-400/5 border-l-2 border-green-400/30">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-surface-300" />
                    <div className="absolute top-0 left-[100%] -ml-2 w-2 h-2 rounded-full bg-green-400" />
                    <span className="absolute top-3 right-0 text-green-400 font-bold text-[10px]">100&cent; (YES)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-6 pt-4 border-t border-surface-300 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-brand-400/10 border-l-2 border-brand-400/30" />
                  <span className="text-surface-600">Convergence zone (last 48h)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-surface-600">Resolution (0&cent; or 100&cent;)</span>
                </div>
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
                <div className="text-3xl mb-3">&#9200;</div>
                <p className="text-sm font-bold text-surface-900 font-mono mb-1">
                  Find Near-Expiry
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Expires in</span>
                    <span className="text-brand-400 font-bold">6 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Price</span>
                    <span className="text-surface-900">22&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Category</span>
                    <span className="text-surface-900">Weather</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-300" />
              <div className="text-surface-600">&darr;</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 w-full p-6">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                  02 &mdash; EVALUATE
                </p>
                <div className="text-3xl mb-3">&#128270;</div>
                <p className="text-sm font-bold text-surface-900 font-mono mb-1">
                  True Probability
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Market says</span>
                    <span className="text-red-400 font-bold">22%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Data says</span>
                    <span className="text-green-400 font-bold">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Edge</span>
                    <span className="text-brand-400 font-bold">+63%</span>
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
                  Buy YES @ 22&cent;
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Cost</span>
                    <span className="text-surface-900">$22.00 (100 shares)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">If YES</span>
                    <span className="text-green-400 font-bold">+$78.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">If NO</span>
                    <span className="text-red-400">-$22.00</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-300" />
              <div className="text-surface-600">&darr;</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 border-green-500/30 w-full p-6">
                <p className="text-xs font-mono text-green-400 uppercase tracking-wider mb-4">
                  04 &mdash; RESOLVE
                </p>
                <div className="text-3xl mb-3">&#9989;</div>
                <p className="text-sm font-bold text-green-400 font-mono mb-1">
                  Resolves YES
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Payout</span>
                    <span className="text-surface-900">$100.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Cost</span>
                    <span className="text-surface-900">$22.00</span>
                  </div>
                  <div className="flex justify-between border-t border-surface-300 pt-2">
                    <span className="text-surface-600">Profit</span>
                    <span className="text-green-400 font-bold">+$78.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">ROI</span>
                    <span className="text-green-400 font-bold text-lg">+354%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: vertical stack */}
          <div className="lg:hidden space-y-4">
            {[
              {
                step: "01", label: "SCAN", source: "Find Near-Expiry",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["Expires in", "6 hours", "text-brand-400 font-bold"],
                  ["Price", "22\u00A2", "text-surface-900"],
                  ["Category", "Weather", "text-surface-900"],
                ],
              },
              {
                step: "02", label: "EVALUATE", source: "True Probability",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["Market says", "22%", "text-red-400 font-bold"],
                  ["Data says", "85%", "text-green-400 font-bold"],
                  ["Edge", "+63%", "text-brand-400 font-bold"],
                ],
              },
              {
                step: "03", label: "TRADE", source: "Buy YES @ 22\u00A2",
                color: "text-brand-400", borderColor: "border-brand-500/30",
                rows: [
                  ["Cost", "$22.00 (100 shares)", "text-surface-900"],
                  ["If YES", "+$78.00", "text-green-400 font-bold"],
                  ["If NO", "-$22.00", "text-red-400"],
                ],
              },
              {
                step: "04", label: "RESOLVE", source: "Resolves YES",
                color: "text-green-400", borderColor: "border-green-500/30",
                rows: [
                  ["Payout", "$100.00", "text-surface-900"],
                  ["Cost", "$22.00", "text-surface-900"],
                  ["Profit", "+$78.00", "text-green-400 font-bold"],
                  ["ROI", "+354%", "text-green-400 font-bold"],
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
            High conviction, binary outcome. When you&apos;re right, the payout
            is massive.
          </p>

          <div className="max-w-3xl">
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center mb-3">
                  <Timer className="h-5 w-5 text-brand-400" />
                </div>
                <CardTitle>
                  &ldquo;Above-normal temps in NYC this week?&rdquo;
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 font-mono text-sm">
                  <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-4 space-y-2">
                    <p className="text-surface-600">
                      <span className="text-surface-900">Market price:</span>{" "}
                      22&cent; (implies 22% YES probability)
                    </p>
                    <p className="text-surface-600">
                      <span className="text-surface-900">Time to resolution:</span>{" "}
                      6 hours
                    </p>
                    <p className="text-surface-600">
                      <span className="text-surface-900">NOAA forecast:</span>{" "}
                      85% probability of above-normal temps
                    </p>
                    <div className="border-t border-surface-300 pt-2 mt-2">
                      <p className="text-surface-600">
                        <span className="text-surface-900">Edge:</span>{" "}
                        Market at 22&cent; vs. fundamental value of 85&cent;.
                        Massive mispricing near expiry.
                      </p>
                      <p className="text-surface-600">
                        <span className="text-surface-900">Action:</span> Buy 100
                        YES @ 22&cent; = $22.00 cost
                      </p>
                    </div>
                    <div className="border-t border-surface-300 pt-2 mt-2">
                      <p className="text-surface-600">
                        <span className="text-surface-900">
                          Event resolves YES
                        </span>{" "}
                        &mdash; actual temps above normal
                      </p>
                      <p className="text-green-400 font-bold">
                        Profit: +$78.00 (+354% ROI)
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
            Trades near expiry with high conviction. Big payouts when right,
            total position loss when wrong.
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
                  $535<span className="text-2xl text-surface-600">&ndash;</span>$560
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-blue-400">+7&ndash;12%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-blue-400" style={{ width: "25%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/week</span>
                  <span className="text-surface-900">2&ndash;4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Min edge</span>
                  <span className="text-surface-900">&gt; 40% gap</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Max position</span>
                  <span className="text-surface-900">3% of bankroll</span>
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
                  $565<span className="text-2xl text-surface-600">&ndash;</span>$600
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-brand-400">+13&ndash;20%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: "50%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/week</span>
                  <span className="text-surface-900">5&ndash;8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Min edge</span>
                  <span className="text-surface-900">&gt; 25% gap</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Max position</span>
                  <span className="text-surface-900">5% of bankroll</span>
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
                  $625<span className="text-2xl text-surface-600">&ndash;</span>$750
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-amber-400">+25&ndash;50%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: "80%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/week</span>
                  <span className="text-surface-900">8&ndash;15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Min edge</span>
                  <span className="text-surface-900">&gt; 15% gap</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Max position</span>
                  <span className="text-surface-900">8% of bankroll</span>
                </div>
              </div>
            </div>
          </div>

          {/* Capital Scale Table */}
          <div className="mt-16">
            <h3 className="text-xl font-bold text-white mb-2">Returns Scale With Capital</h3>
            <p className="text-sm text-surface-600 mb-8">Moderate scenario &mdash; 10&ndash;20% monthly return range</p>
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
                    { capital: "$50", low: "+$5", high: "+$10", trades: "3\u20135", maxPos: "$5" },
                    { capital: "$100", low: "+$10", high: "+$20", trades: "4\u20136", maxPos: "$10" },
                    { capital: "$250", low: "+$25", high: "+$50", trades: "5\u20138", maxPos: "$25" },
                    { capital: "$500", low: "+$50", high: "+$100", trades: "5\u20138", maxPos: "$50" },
                    { capital: "$1,000", low: "+$100", high: "+$200", trades: "6\u201310", maxPos: "$100" },
                    { capital: "$5,000", low: "+$500", high: "+$1,000", trades: "8\u201312", maxPos: "$500" },
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
                { capital: "$50", range: "+$5\u2013$10", width: "5%" },
                { capital: "$100", range: "+$10\u2013$20", width: "10%" },
                { capital: "$250", range: "+$25\u2013$50", width: "25%" },
                { capital: "$500", range: "+$50\u2013$100", width: "50%" },
                { capital: "$1K", range: "+$100\u2013$200", width: "75%" },
                { capital: "$5K", range: "+$500\u2013$1K", width: "100%" },
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
                68%
              </p>
              <p className="text-sm text-surface-600 mt-2">Win Rate</p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-6 text-center">
              <p className="text-4xl font-bold font-mono text-green-400">
                +14.6%
              </p>
              <p className="text-sm text-surface-600 mt-2">30-Day Return</p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-6 text-center">
              <p className="text-4xl font-bold font-mono text-red-400">
                -4.8%
              </p>
              <p className="text-sm text-surface-600 mt-2">Max Drawdown</p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-6 text-center">
              <p className="text-4xl font-bold font-mono text-surface-900">
                25+
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
                      <strong className="text-surface-900">Binary outcome:</strong>{" "}
                      Every trade either wins big or loses the entire position.
                      There is no partial win &mdash; the market resolves to
                      0&cent; or 100&cent;.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      <strong className="text-surface-900">Wrong conviction:</strong>{" "}
                      If the fundamental analysis is wrong (e.g., NOAA
                      forecast misses), the position goes to zero.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      <strong className="text-surface-900">Clustered losses:</strong>{" "}
                      Multiple correlated events can fail together, causing
                      drawdowns larger than expected.
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
                      Small position sizes &mdash; no single trade exceeds 5% of
                      bankroll so a loss is always survivable.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      Correlation limits &mdash; no more than 3 positions on
                      similar events to prevent clustered losses.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5 font-bold">&bull;</span>
                    <span>
                      Minimum edge threshold &mdash; only trades when the gap
                      between market price and estimated fair value exceeds 25%.
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
          <Timer className="h-12 w-12 text-brand-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-surface-900">
            Paper Trade Time Decay
          </h2>
          <p className="mt-4 text-lg text-surface-700">
            Watch the bot find mispriced markets near expiry and capture
            convergence profits &mdash; with zero risk.
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

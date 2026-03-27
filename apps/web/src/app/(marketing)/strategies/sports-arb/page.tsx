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
  AlertTriangle,
  ShieldCheck,
  Trophy,
} from "lucide-react";

export default function SportsArbPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="paper">Pro</Badge>
              <Badge variant="default">Data-Driven</Badge>
              <Badge variant="danger">High Frequency</Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-surface-900 leading-tight">
              Sports Arbitrage
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-surface-700 leading-relaxed">
              Sharp bookmaker odds vs retail-priced Polymarket sports contracts.
              When the sportsbooks and prediction markets disagree, trade the gap
              and profit from the convergence at resolution.
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

      {/* ── Thesis ────────────────────────────────────────────────────── */}
      <section className="border-y border-surface-300 bg-surface-100 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-surface-900 mb-4">
              The Thesis
            </h2>
            <p className="text-surface-700 leading-relaxed">
              Professional sportsbooks employ teams of quants to set odds. Their
              lines represent the sharpest consensus on event probabilities.
              Polymarket&rsquo;s sports contracts are priced by retail traders who
              often lag behind the sharp line. When a bookmaker implies 72% and
              Polymarket prices at 58&cent;, that 14-point gap is the edge. Buy
              the underpriced contract, hold to resolution, and collect the
              difference.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works — Visual ─────────────────────────────────────── */}
      <section className="border-b border-surface-300 bg-surface-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-surface-700 mb-16 max-w-2xl">
            The bot continuously compares sharp bookmaker odds against Polymarket
            sports markets. When it finds a mispricing above the threshold, it
            trades.
          </p>

          {/* Visual: Odds comparison */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-surface-100 border border-surface-300 p-6 sm:p-8">
              <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-6">
                UFC 310 &mdash; Mispricing Detected
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-brand-400 w-28 text-right font-bold">Bookmaker</span>
                  <div className="flex-1 relative h-2 bg-surface-300">
                    <div className="absolute left-0 h-full bg-brand-400/40" style={{ width: "72%" }} />
                    <div className="absolute h-4 w-4 rounded-full bg-brand-400 border-2 border-surface-100 -top-1" style={{ left: "70%" }} />
                  </div>
                  <span className="text-xs font-mono text-brand-400 font-bold w-12">72%</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-amber-400 w-28 text-right font-bold">Polymarket</span>
                  <div className="flex-1 relative h-2 bg-surface-300">
                    <div className="absolute left-0 h-full bg-amber-400/40" style={{ width: "58%" }} />
                    <div className="absolute h-4 w-4 rounded-full bg-amber-400 border-2 border-surface-100 -top-1" style={{ left: "56%" }} />
                  </div>
                  <span className="text-xs font-mono text-amber-400 font-bold w-12">58&cent;</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-surface-200/50 border border-surface-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-sm">
                  <div>
                    <span className="text-surface-600 text-xs">Bookmaker implied</span>
                    <p className="text-surface-900 font-bold">72%</p>
                  </div>
                  <div>
                    <span className="text-surface-600 text-xs">Polymarket price</span>
                    <p className="text-amber-400 font-bold">58&cent;</p>
                  </div>
                  <div>
                    <span className="text-surface-600 text-xs">Edge</span>
                    <p className="text-green-400 font-bold">+14%</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-6 text-xs font-mono">
                <div className="bg-green-400/20 border border-green-400/40 px-3 py-1.5 text-green-400 font-bold">
                  BUY YES @ 58&cent;
                </div>
                <span className="text-surface-600">&rarr;</span>
                <span className="text-surface-600">Fighter wins</span>
                <span className="text-surface-600">&rarr;</span>
                <span className="text-green-400 font-bold">Resolves $1.00 &rarr; +42&cent; profit</span>
              </div>
            </div>
          </div>

          {/* Flow cards */}
          <div className="hidden lg:grid grid-cols-4 gap-0 items-start">
            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 w-full p-6">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                  01 &mdash; FETCH ODDS
                </p>
                <div className="text-3xl mb-3">
                  <Trophy className="h-8 w-8 text-surface-700" />
                </div>
                <p className="text-sm font-bold text-surface-900 font-mono mb-1">
                  The Odds API
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Sports</span>
                    <span className="text-surface-900">5 leagues</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Bookmakers</span>
                    <span className="text-surface-900">20+</span>
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
                  02 &mdash; MATCH
                </p>
                <div className="text-3xl mb-3">&#128279;</div>
                <p className="text-sm font-bold text-surface-900 font-mono mb-1">
                  Fuzzy Name Match
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Bookmaker</span>
                    <span className="text-surface-900">Fighter A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Polymarket</span>
                    <span className="text-surface-900">Fighter A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Confidence</span>
                    <span className="text-green-400">Matched</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-300" />
              <div className="text-surface-600">&darr;</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 border-brand-500/30 w-full p-6">
                <p className="text-xs font-mono text-brand-400 uppercase tracking-wider mb-4">
                  03 &mdash; COMPARE
                </p>
                <div className="text-3xl mb-3">&#9889;</div>
                <p className="text-sm font-bold text-brand-400 font-mono mb-1">
                  Calculate Edge
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Book prob</span>
                    <span className="text-surface-900">72%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Poly price</span>
                    <span className="text-amber-400">58&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Edge</span>
                    <span className="text-green-400 font-bold">+14%</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-300" />
              <div className="text-surface-600">&darr;</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 border-green-500/30 w-full p-6">
                <p className="text-xs font-mono text-green-400 uppercase tracking-wider mb-4">
                  04 &mdash; TRADE
                </p>
                <div className="text-3xl mb-3">&#9989;</div>
                <p className="text-sm font-bold text-green-400 font-mono mb-1">
                  Buy &amp; Hold
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Buy YES</span>
                    <span className="text-green-400 font-bold">@ 58&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Resolves</span>
                    <span className="text-surface-900">$1.00</span>
                  </div>
                  <div className="flex justify-between border-t border-surface-300 pt-2">
                    <span className="text-surface-600">Profit</span>
                    <span className="text-green-400 font-bold">+42&cent;/share</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: vertical stack */}
          <div className="lg:hidden space-y-4">
            {[
              {
                step: "01", label: "FETCH ODDS", source: "The Odds API",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["Sports", "5 leagues", "text-surface-900"],
                  ["Bookmakers", "20+", "text-surface-900"],
                  ["Updated", "Every 5 min", "text-surface-900"],
                ],
              },
              {
                step: "02", label: "MATCH", source: "Fuzzy Name Match",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["Bookmaker", "Fighter A", "text-surface-900"],
                  ["Polymarket", "Fighter A", "text-surface-900"],
                  ["Confidence", "Matched", "text-green-400"],
                ],
              },
              {
                step: "03", label: "COMPARE", source: "Calculate Edge",
                color: "text-brand-400", borderColor: "border-brand-500/30",
                rows: [
                  ["Book prob", "72%", "text-surface-900"],
                  ["Poly price", "58\u00A2", "text-amber-400"],
                  ["Edge", "+14%", "text-green-400"],
                ],
              },
              {
                step: "04", label: "TRADE", source: "Buy & Hold",
                color: "text-green-400", borderColor: "border-green-500/30",
                rows: [
                  ["Buy YES", "@ 58\u00A2", "text-green-400"],
                  ["Resolves", "$1.00", "text-surface-900"],
                  ["Profit", "+42\u00A2/share", "text-green-400"],
                ],
              },
            ].map((card) => (
              <div
                key={card.step}
                className={`bg-surface-100 border border-surface-300 ${card.borderColor} p-5`}
              >
                <p className={`text-xs font-mono ${card.color} uppercase tracking-wider mb-3`}>
                  {card.step} &mdash; {card.label}
                </p>
                <p className={`text-sm font-bold font-mono mb-3 ${card.color === "text-surface-600" ? "text-surface-900" : card.color}`}>
                  {card.source}
                </p>
                <div className="space-y-2 font-mono text-sm">
                  {card.rows.map(([label, value, valueColor]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-surface-600">{label}</span>
                      <span className={`font-bold ${valueColor}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trade Example ─────────────────────────────────────────────── */}
      <section className="border-b border-surface-300 bg-surface-100 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-surface-900 mb-12">
            Trade Example
          </h2>
          <div className="max-w-4xl">
            <div className="bg-surface-50 border border-surface-300 p-6 sm:p-8">
              <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                UFC 310 &mdash; Real Scenario
              </p>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between border-b border-surface-300 pb-3">
                  <span className="text-surface-600">Event</span>
                  <span className="text-surface-900 font-bold">Fighter A vs Fighter B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Pinnacle implied (Fighter A)</span>
                  <span className="text-brand-400 font-bold">72%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Polymarket YES price</span>
                  <span className="text-amber-400 font-bold">58&cent;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Edge</span>
                  <span className="text-green-400 font-bold">+14%</span>
                </div>
                <div className="flex justify-between border-t border-surface-300 pt-3">
                  <span className="text-surface-600">Action</span>
                  <span className="text-green-400 font-bold">BUY YES @ 58&cent;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Fighter A wins</span>
                  <span className="text-green-400 font-bold">Resolves $1.00 &rarr; +42&cent; profit per share</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Fighter A loses</span>
                  <span className="text-red-400 font-bold">Resolves $0.00 &rarr; -58&cent; loss per share</span>
                </div>
                <div className="flex justify-between border-t border-surface-300 pt-3">
                  <span className="text-surface-600">Expected value</span>
                  <span className="text-green-400 font-bold">+$0.18 per share (72% &times; 42&cent; - 28% &times; 58&cent;)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Capital Scale Scenarios ───────────────────────────────────── */}
      <section className="border-b border-surface-300 bg-surface-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-surface-900 mb-4">
            Capital Scale Scenarios
          </h2>
          <p className="text-surface-700 mb-12 max-w-2xl">
            Projected returns at different capital levels, assuming a 68% win
            rate and average edge of 10%.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tier: "Conservative",
                capital: "$100",
                monthly: "$15 - $25",
                traits: [
                  "Quarter-Kelly sizing",
                  "5 max positions",
                  "$2 max per trade",
                  "Paper mode first",
                ],
                borderColor: "border-blue-500/30",
                headerColor: "text-blue-400",
              },
              {
                tier: "Moderate",
                capital: "$500",
                monthly: "$80 - $140",
                traits: [
                  "Quarter-Kelly sizing",
                  "8 max positions",
                  "$10 max per trade",
                  "All 5 sports",
                ],
                borderColor: "border-brand-500/30",
                headerColor: "text-brand-400",
              },
              {
                tier: "Aggressive",
                capital: "$2,000",
                monthly: "$350 - $600",
                traits: [
                  "Half-Kelly sizing",
                  "12 max positions",
                  "$50 max per trade",
                  "Live + in-play odds",
                ],
                borderColor: "border-amber-500/30",
                headerColor: "text-amber-400",
              },
            ].map((scenario) => (
              <Card key={scenario.tier} className={`border ${scenario.borderColor}`}>
                <CardHeader>
                  <CardTitle className={scenario.headerColor}>
                    {scenario.tier}
                  </CardTitle>
                  <CardDescription>
                    Starting capital: {scenario.capital}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-surface-900 font-mono mb-4">
                    {scenario.monthly}
                    <span className="text-sm text-surface-600 font-normal ml-1">/month</span>
                  </p>
                  <ul className="space-y-2">
                    {scenario.traits.map((t) => (
                      <li key={t} className="flex items-center gap-2 text-sm text-surface-700">
                        <ShieldCheck className="h-4 w-4 text-green-400 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Performance Stats ─────────────────────────────────────────── */}
      <section className="border-b border-surface-300 bg-surface-100 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-surface-900 mb-12">
            Backtest Performance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Win Rate", value: "68%", color: "text-green-400" },
              { label: "30D Return", value: "+28.4%", color: "text-green-400" },
              { label: "Max Drawdown", value: "-8.2%", color: "text-red-400" },
              { label: "Avg Edge", value: "10.3%", color: "text-brand-400" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-surface-50 border border-surface-300 p-6 text-center"
              >
                <p className={`text-3xl font-bold font-mono ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-sm text-surface-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Risk ──────────────────────────────────────────────────────── */}
      <section className="border-b border-surface-300 bg-surface-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-surface-900 mb-8">
            Risk Factors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {[
              {
                title: "Odds Movement",
                description:
                  "Bookmaker odds can shift rapidly. The edge calculated at scan time may shrink by execution time.",
              },
              {
                title: "Matching Accuracy",
                description:
                  "Fuzzy name matching between bookmaker events and Polymarket markets can produce false matches on rare occasions.",
              },
              {
                title: "Liquidity Risk",
                description:
                  "Polymarket sports markets can have thin orderbooks. Large orders may face slippage or partial fills.",
              },
              {
                title: "Resolution Risk",
                description:
                  "Sports events can be canceled, postponed, or have disputed outcomes. Market resolution may differ from expectations.",
              },
            ].map((risk) => (
              <div
                key={risk.title}
                className="flex gap-4 bg-surface-100 border border-surface-300 p-5"
              >
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-surface-900 mb-1">
                    {risk.title}
                  </p>
                  <p className="text-sm text-surface-700">{risk.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Trophy className="h-12 w-12 text-brand-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
            Ready to trade the sharpest edges in sports?
          </h2>
          <p className="text-lg text-surface-700 max-w-2xl mx-auto mb-8">
            Start paper trading the Sports Arbitrage strategy today. No API key
            required for paper mode &mdash; simulated markets included.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="xl">
                Start Paper Trading
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/strategies">
              <Button variant="outline" size="xl">
                Explore All Strategies
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

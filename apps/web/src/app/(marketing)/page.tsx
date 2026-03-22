import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@marketpilot/ui";
import { ArrowRight, AlertTriangle, Check } from "lucide-react";

const tradeFeed = [
  {
    status: "open",
    time: "2m ago",
    action: "BUY",
    market: "NYC 74-76\u00B0F",
    price: "11\u00A2",
    detail: "NOAA: 94% | Size: $2.00 | EV: +$0.83",
  },
  {
    status: "won",
    time: "47m ago",
    action: "SELL",
    market: "CHI 68-70\u00B0F",
    price: "47\u00A2",
    detail: "Entry: 9\u00A2 | Profit: +$0.76",
  },
  {
    status: "won",
    time: "1h ago",
    action: "SELL",
    market: "SEA 58-60\u00B0F",
    price: "52\u00A2",
    detail: "Entry: 12\u00A2 | Profit: +$0.80",
  },
  {
    status: "open",
    time: "1h ago",
    action: "BUY",
    market: "ATL 82-84\u00B0F",
    price: "14\u00A2",
    detail: "NOAA: 91% | Size: $1.80 | EV: +$0.72",
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

            {/* Right — Live Trade Feed */}
            <div className="bg-surface-100 border border-surface-300">
              <div className="flex items-center justify-between px-6 py-4 border-b border-surface-300">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider">
                  Live Paper Trading Feed
                </p>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
                  <span className="text-xs font-mono text-green-400">LIVE</span>
                </span>
              </div>

              <div className="divide-y divide-surface-300">
                {tradeFeed.map((trade, i) => (
                  <div key={i} className="px-6 py-4">
                    <div className="flex items-center gap-3 mb-1">
                      {trade.status === "open" ? (
                        <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      )}
                      <span className="text-xs font-mono text-surface-600">
                        {trade.time}
                      </span>
                      <span
                        className={`text-sm font-bold font-mono ${
                          trade.action === "BUY"
                            ? "text-brand-400"
                            : "text-green-400"
                        }`}
                      >
                        {trade.action}
                      </span>
                      <span className="text-sm font-mono text-white">
                        {trade.market} @ {trade.price}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-surface-600 ml-5">
                      {trade.detail}
                      {trade.status === "won" && (
                        <span className="text-green-400 ml-1">&check;</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-surface-300 bg-surface-100">
                <div className="flex items-center justify-between font-mono text-sm">
                  <span className="text-surface-600">Today</span>
                  <div className="flex items-center gap-4">
                    <span className="text-green-400 font-bold">+$4.82</span>
                    <span className="text-surface-600">
                      Win Rate: <span className="text-white">75%</span>
                    </span>
                    <span className="text-surface-600">
                      <span className="text-white">6</span> trades
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── One Trade, Explained ─────────────────────────────────────── */}
      <section className="bg-surface-50 py-24 sm:py-32 border-y border-surface-300">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            One Trade, Explained
          </h2>
          <p className="text-lg text-surface-600 mb-16 max-w-2xl">
            From data to dollars in four steps. Here&apos;s exactly how the Weather Arb bot turns a NOAA forecast into profit.
          </p>

          {/* Desktop: horizontal flow */}
          <div className="hidden lg:grid grid-cols-4 gap-0 items-start">
            {/* Card 1 — SCAN */}
            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 w-full p-6">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                  01 &mdash; SCAN
                </p>
                <div className="text-3xl mb-3">&#127777;</div>
                <p className="text-sm font-bold text-white font-mono mb-1">
                  NOAA API
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">City</span>
                    <span className="text-white">NYC Saturday</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">High</span>
                    <span className="text-white">75&deg;F</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Conf</span>
                    <span className="text-brand-400 font-bold">94%</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-300" />
              <div className="text-surface-600">&darr;</div>
            </div>

            {/* Card 2 — DETECT */}
            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 w-full p-6">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                  02 &mdash; DETECT
                </p>
                <div className="text-3xl mb-3">&#128202;</div>
                <p className="text-sm font-bold text-white font-mono mb-1">
                  Polymarket
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Market</span>
                    <span className="text-white">NYC 74-76&deg;F</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Price</span>
                    <span className="text-white">11&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Implied</span>
                    <span className="text-red-400 font-bold">11%</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-300" />
              <div className="text-surface-600">&darr;</div>
            </div>

            {/* Card 3 — TRADE */}
            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 border-brand-500/30 w-full p-6">
                <p className="text-xs font-mono text-brand-400 uppercase tracking-wider mb-4">
                  03 &mdash; TRADE
                </p>
                <div className="text-3xl mb-3">&#9889;</div>
                <p className="text-sm font-bold text-brand-400 font-mono mb-1">
                  Bot Executes
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Action</span>
                    <span className="text-brand-400 font-bold">BUY 18 shares</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Cost</span>
                    <span className="text-white">$2.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">EV</span>
                    <span className="text-green-400 font-bold">+$0.83/share</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-300" />
              <div className="text-surface-600">&darr;</div>
            </div>

            {/* Card 4 — PROFIT */}
            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 border-green-500/30 w-full p-6">
                <p className="text-xs font-mono text-green-400 uppercase tracking-wider mb-4">
                  04 &mdash; PROFIT
                </p>
                <div className="text-3xl mb-3">&#9989;</div>
                <p className="text-sm font-bold text-green-400 font-mono mb-1">
                  Resolved YES
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Payout</span>
                    <span className="text-white">$18.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Cost</span>
                    <span className="text-white">$2.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Profit</span>
                    <span className="text-green-400 font-bold">+$16.00</span>
                  </div>
                  <div className="flex justify-between border-t border-surface-300 pt-2">
                    <span className="text-surface-600">ROI</span>
                    <span className="text-green-400 font-bold text-lg">+800%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: vertical stack */}
          <div className="lg:hidden space-y-4">
            {[
              {
                step: "01", label: "SCAN", emoji: "\u{1F321}\uFE0F", source: "NOAA API",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["City", "NYC Saturday", "text-white"],
                  ["High", "75\u00B0F", "text-white"],
                  ["Conf", "94%", "text-brand-400 font-bold"],
                ],
              },
              {
                step: "02", label: "DETECT", emoji: "\u{1F4CA}", source: "Polymarket",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["Market", "NYC 74-76\u00B0F", "text-white"],
                  ["Price", "11\u00A2", "text-white"],
                  ["Implied", "11%", "text-red-400 font-bold"],
                ],
              },
              {
                step: "03", label: "TRADE", emoji: "\u26A1", source: "Bot Executes",
                color: "text-brand-400", borderColor: "border-brand-500/30",
                rows: [
                  ["Action", "BUY 18 shares", "text-brand-400 font-bold"],
                  ["Cost", "$2.00", "text-white"],
                  ["EV", "+$0.83/share", "text-green-400 font-bold"],
                ],
              },
              {
                step: "04", label: "PROFIT", emoji: "\u2705", source: "Resolved YES",
                color: "text-green-400", borderColor: "border-green-500/30",
                rows: [
                  ["Payout", "$18.00", "text-white"],
                  ["Cost", "$2.00", "text-white"],
                  ["Profit", "+$16.00", "text-green-400 font-bold"],
                  ["ROI", "+800%", "text-green-400 font-bold"],
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

      {/* ── What $100 Could Become ───────────────────────────────────── */}
      <section className="bg-surface-0 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            What $100 Could Become
          </h2>
          <p className="text-lg text-surface-600 mb-16 max-w-2xl">
            Three risk profiles, one strategy. Choose how aggressively the bot trades.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Conservative */}
            <div className="bg-surface-100 border border-surface-300 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <p className="text-sm font-bold text-white uppercase tracking-wider">
                  Conservative
                </p>
              </div>
              <div className="mb-6">
                <p className="text-sm font-mono text-surface-600 mb-1">
                  Starting with $100
                </p>
                <p className="text-4xl font-bold text-white font-mono">
                  $115<span className="text-2xl text-surface-600">&ndash;</span>$130
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-blue-400">+15&ndash;30%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-blue-400" style={{ width: "30%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/day</span>
                  <span className="text-white">2&ndash;3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Filter</span>
                  <span className="text-white">High confidence only</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-white">$50/day</span>
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
                <p className="text-sm font-bold text-white uppercase tracking-wider">
                  Moderate
                </p>
              </div>
              <div className="mb-6">
                <p className="text-sm font-mono text-surface-600 mb-1">
                  Starting with $100
                </p>
                <p className="text-4xl font-bold text-white font-mono">
                  $150<span className="text-2xl text-surface-600">&ndash;</span>$200
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-brand-400">+50&ndash;100%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: "60%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/day</span>
                  <span className="text-white">5&ndash;8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Filter</span>
                  <span className="text-white">Balanced risk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-white">$50/day</span>
                </div>
              </div>
            </div>

            {/* Aggressive */}
            <div className="bg-surface-100 border border-surface-300 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <p className="text-sm font-bold text-white uppercase tracking-wider">
                  Aggressive
                </p>
              </div>
              <div className="mb-6">
                <p className="text-sm font-mono text-surface-600 mb-1">
                  Starting with $100
                </p>
                <p className="text-4xl font-bold text-white font-mono">
                  $200<span className="text-2xl text-surface-600">&ndash;</span>$400
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-amber-400">+200%+/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: "90%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Trades/day</span>
                  <span className="text-white">10+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Filter</span>
                  <span className="text-white">Higher risk tolerance</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-white">$100/day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Capital Scale Table */}
          <div className="mt-16">
            <h3 className="text-xl font-bold text-white mb-2">Returns Scale With Capital</h3>
            <p className="text-sm text-surface-600 mb-8">Moderate scenario — 50-100% monthly return range</p>
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
                    { capital: "$50", low: "$25", high: "$50", trades: "3-5", pos: "$1.00" },
                    { capital: "$100", low: "$50", high: "$100", trades: "5-8", pos: "$2.00" },
                    { capital: "$250", low: "$125", high: "$250", trades: "5-8", pos: "$5.00" },
                    { capital: "$500", low: "$250", high: "$500", trades: "5-8", pos: "$10.00" },
                    { capital: "$1,000", low: "$500", high: "$1,000", trades: "5-8", pos: "$20.00" },
                    { capital: "$5,000", low: "$2,500", high: "$5,000", trades: "5-8", pos: "$100.00" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-surface-300/50 hover:bg-surface-200/30 transition-colors">
                      <td className="py-3 pr-6 text-white font-medium">{row.capital}</td>
                      <td className="py-3 pr-6 text-green-400">+{row.low}</td>
                      <td className="py-3 pr-6 text-green-400">+{row.high}</td>
                      <td className="py-3 pr-6 text-surface-800">{row.trades}</td>
                      <td className="py-3 text-surface-800">{row.pos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Visual bar chart */}
            <div className="mt-8 space-y-3">
              {[
                { label: "$50", width: "5%", value: "+$25-50" },
                { label: "$100", width: "10%", value: "+$50-100" },
                { label: "$250", width: "25%", value: "+$125-250" },
                { label: "$500", width: "50%", value: "+$250-500" },
                { label: "$1K", width: "75%", value: "+$500-1K" },
                { label: "$5K", width: "100%", value: "+$2.5K-5K" },
              ].map((bar) => (
                <div key={bar.label} className="flex items-center gap-4">
                  <span className="text-xs font-mono text-surface-600 w-10 text-right">{bar.label}</span>
                  <div className="flex-1 h-6 bg-surface-300/50 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-brand-400 flex items-center justify-end pr-2"
                      style={{ width: bar.width }}
                    >
                      <span className="text-[10px] font-mono text-white font-medium whitespace-nowrap">
                        {bar.value}/mo
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 text-xs text-surface-600 text-center max-w-2xl mx-auto">
            Projections based on backtest data using the moderate risk profile. Actual results will vary.
            Past performance does not guarantee future returns. Trading prediction markets involves
            significant risk. Position sizes are automatically scaled by Kelly criterion.
          </p>
        </div>
      </section>

      {/* ── The Numbers ──────────────────────────────────────────────── */}
      <section className="bg-surface-50 py-24 sm:py-32 border-y border-surface-300">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-16 text-center">
            The Numbers
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-surface-100 border border-surface-300 p-8 text-center">
              <p className="text-5xl lg:text-6xl font-bold text-white font-mono">
                847
              </p>
              <p className="mt-3 text-sm text-surface-600 font-mono uppercase tracking-wider">
                Trades
              </p>
              <p className="text-xs text-surface-600 mt-1">(backtest)</p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-8 text-center">
              <p className="text-5xl lg:text-6xl font-bold text-white font-mono">
                71<span className="text-3xl">%</span>
              </p>
              <p className="mt-3 text-sm text-surface-600 font-mono uppercase tracking-wider">
                Win Rate
              </p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-8 text-center">
              <p className="text-5xl lg:text-6xl font-bold text-green-400 font-mono">
                4.7
              </p>
              <p className="mt-3 text-sm text-surface-600 font-mono uppercase tracking-wider">
                Profit Factor
              </p>
            </div>
            <div className="bg-surface-100 border border-surface-300 p-8 text-center">
              <p className="text-5xl lg:text-6xl font-bold text-brand-400 font-mono">
                3.2
              </p>
              <p className="mt-3 text-sm text-surface-600 font-mono uppercase tracking-wider">
                Sharpe Ratio
              </p>
            </div>
          </div>

          <p className="mt-8 text-xs text-surface-600 text-center">
            Based on historical backtest across 4 quarters of Polymarket weather data. Not indicative of future results.
          </p>
        </div>
      </section>

      {/* ── Your Command Center — Dashboard Preview ──────────────────── */}
      <section className="bg-surface-0 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Your Command Center
          </h2>
          <p className="text-lg text-surface-600 mb-16 max-w-2xl">
            Everything you need to monitor, control, and profit&nbsp;&mdash; in one view.
          </p>

          <div className="bg-surface-100 border border-surface-300 max-w-6xl mx-auto">
            {/* Window chrome */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-surface-300">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <p className="text-xs font-mono text-surface-600">
                MarketPilot AI Dashboard
              </p>
              <div />
            </div>

            {/* Top row — 4 stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 border-b border-surface-300">
              <div className="bg-surface-50 border border-surface-300 p-4">
                <p className="text-[10px] font-mono text-surface-600 uppercase tracking-wider mb-1">
                  Total P&amp;L
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-green-400 font-mono">
                  +$2,847.50
                </p>
                <p className="text-xs font-mono text-green-400 mt-1">+284.7%</p>
              </div>
              <div className="bg-surface-50 border border-surface-300 p-4">
                <p className="text-[10px] font-mono text-surface-600 uppercase tracking-wider mb-1">
                  Today&apos;s P&amp;L
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-green-400 font-mono">
                  +$127.40
                </p>
              </div>
              <div className="bg-surface-50 border border-surface-300 p-4">
                <p className="text-[10px] font-mono text-surface-600 uppercase tracking-wider mb-1">
                  Active Bots
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl lg:text-3xl font-bold text-white font-mono">4</p>
                  <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
                </div>
              </div>
              <div className="bg-surface-50 border border-surface-300 p-4">
                <p className="text-[10px] font-mono text-surface-600 uppercase tracking-wider mb-1">
                  Win Rate
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-white font-mono">
                  73.2<span className="text-lg">%</span>
                </p>
              </div>
            </div>

            {/* Middle — P&L chart */}
            <div className="p-6 border-b border-surface-300">
              <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                Cumulative P&amp;L &mdash; Last 30 Days
              </p>
              <div className="h-40 relative">
                <svg
                  viewBox="0 0 600 150"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="dashPnlGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(74, 222, 128)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="rgb(74, 222, 128)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="37" x2="600" y2="37" stroke="rgb(100,100,100)" strokeWidth="0.5" strokeDasharray="4 4" />
                  <line x1="0" y1="75" x2="600" y2="75" stroke="rgb(100,100,100)" strokeWidth="0.5" strokeDasharray="4 4" />
                  <line x1="0" y1="112" x2="600" y2="112" stroke="rgb(100,100,100)" strokeWidth="0.5" strokeDasharray="4 4" />
                  {/* Chart line */}
                  <path
                    d="M0,130 L20,128 L40,125 L60,122 L80,118 L100,115 L120,110 L140,108 L160,105 L180,98 L200,95 L220,90 L240,85 L260,82 L280,78 L300,72 L320,68 L340,60 L360,55 L380,52 L400,48 L420,42 L440,38 L460,35 L480,30 L500,26 L520,22 L540,18 L560,15 L580,12 L600,8"
                    fill="none"
                    stroke="rgb(74, 222, 128)"
                    strokeWidth="2.5"
                  />
                  {/* Gradient fill */}
                  <path
                    d="M0,130 L20,128 L40,125 L60,122 L80,118 L100,115 L120,110 L140,108 L160,105 L180,98 L200,95 L220,90 L240,85 L260,82 L280,78 L300,72 L320,68 L340,60 L360,55 L380,52 L400,48 L420,42 L440,38 L460,35 L480,30 L500,26 L520,22 L540,18 L560,15 L580,12 L600,8 L600,150 L0,150 Z"
                    fill="url(#dashPnlGradient)"
                  />
                </svg>
                {/* X axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                  <span className="text-[10px] font-mono text-surface-600">Feb 20</span>
                  <span className="text-[10px] font-mono text-surface-600">Mar 1</span>
                  <span className="text-[10px] font-mono text-surface-600">Mar 10</span>
                  <span className="text-[10px] font-mono text-surface-600">Mar 20</span>
                </div>
              </div>
            </div>

            {/* Bottom row — two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-surface-300">
              {/* Left — Active Bots */}
              <div className="p-6">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                  Active Bots
                </p>
                <div className="space-y-3">
                  {[
                    { name: "Weather Arb", status: "Running", statusColor: "bg-green-400", pnl: "+$1,240.20", uptime: "14h uptime" },
                    { name: "Mean Reversion", status: "Running", statusColor: "bg-green-400", pnl: "+$891.30", uptime: "22h uptime" },
                    { name: "Spread Capture", status: "Running", statusColor: "bg-green-400", pnl: "+$492.10", uptime: "3d uptime" },
                    { name: "Momentum Surge", status: "Paused", statusColor: "bg-amber-400", pnl: "+$223.90", uptime: "\u2014" },
                  ].map((bot) => (
                    <div key={bot.name} className="flex items-center justify-between text-sm font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${bot.statusColor} shrink-0`} />
                        <span className="text-white">{bot.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-surface-600 text-xs hidden sm:inline">{bot.status}</span>
                        <span className="text-green-400 font-bold">{bot.pnl}</span>
                        <span className="text-surface-600 text-xs w-16 text-right">{bot.uptime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Recent Trades */}
              <div className="p-6">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                  Recent Trades
                </p>
                <div className="space-y-3">
                  {[
                    { time: "2m ago", action: "BUY", actionColor: "text-brand-400", market: "NYC 74-76\u00B0F", size: "$2.00", price: "11\u00A2", bot: "Weather Arb", result: "" },
                    { time: "18m ago", action: "SELL", actionColor: "text-green-400", market: "CHI 68-70\u00B0F", size: "$2.00", price: "47\u00A2", bot: "Weather Arb", result: "+$0.72 \u2713" },
                    { time: "1h ago", action: "BUY", actionColor: "text-brand-400", market: "Spread ATL", size: "$1.50", price: "48\u00A2", bot: "Spread Cap.", result: "" },
                    { time: "3h ago", action: "SELL", actionColor: "text-green-400", market: "Mean Rev NYC", size: "$3.00", price: "62\u00A2", bot: "Mean Rev.", result: "+$0.84 \u2713" },
                  ].map((trade, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-mono gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-surface-600 shrink-0">{trade.time}</span>
                        <span className={`${trade.actionColor} font-bold shrink-0`}>{trade.action}</span>
                        <span className="text-white truncate">{trade.market}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-surface-600 hidden sm:inline">{trade.size}</span>
                        <span className="text-surface-600">{trade.price}</span>
                        {trade.result ? (
                          <span className="text-green-400 font-bold">{trade.result}</span>
                        ) : (
                          <span className="text-surface-600 text-[10px]">{trade.bot}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Free vs Pro vs Operator — Tier Comparison ────────────────── */}
      <section className="bg-surface-50 py-24 sm:py-32 border-y border-surface-300">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 text-center">
            Start Free. Scale When Ready.
          </h2>
          <p className="text-lg text-surface-600 mb-16 max-w-2xl mx-auto text-center">
            Every user starts with paper trading. Upgrade when you&apos;ve seen the edge.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Explorer — Free */}
            <div className="bg-surface-100 border border-surface-300 p-8 flex flex-col">
              <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">Explorer</p>
              <p className="text-3xl font-bold text-white font-mono mb-6">
                $0<span className="text-lg text-surface-600">/mo</span>
              </p>

              <div className="space-y-3 mb-8">
                {[
                  "1 paper trading bot",
                  "Weather Arb strategy",
                  "Basic dashboard",
                  "5 backtests/month",
                  "Community support",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-surface-800">{f}</span>
                  </div>
                ))}
              </div>

              {/* Mini dashboard mock — Free tier */}
              <div className="bg-surface-50 border border-surface-300 mb-6">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-surface-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-[10px] font-mono text-white">Weather Arb</span>
                    <span className="text-[10px] font-mono text-green-400 ml-auto">+$42.10</span>
                  </div>
                  <div className="h-8 bg-surface-100 border border-surface-300 flex items-center justify-center">
                    <span className="text-[9px] font-mono text-surface-600">Basic stats</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-mono text-surface-600 mb-1">Performance preview</p>
                <p className="text-sm font-mono text-green-400">$100 &rarr; $150&ndash;200/mo (paper)</p>
              </div>

              <div className="mt-auto">
                <Link href="/signup">
                  <Button className="w-full border border-surface-400 text-white hover:bg-surface-200 bg-transparent">
                    Start Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Strategist — $49/mo */}
            <div className="bg-surface-100 border-2 border-brand-500 p-8 flex flex-col relative">
              <div className="absolute -top-3 right-6">
                <span className="bg-brand-500 text-white text-xs font-bold font-mono px-3 py-1 uppercase tracking-wider">
                  Most Popular
                </span>
              </div>
              <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">Strategist</p>
              <p className="text-3xl font-bold text-white font-mono mb-6">
                $49<span className="text-lg text-surface-600">/mo</span>
              </p>

              <p className="text-xs text-surface-600 mb-3">Everything in Free, plus:</p>
              <div className="space-y-3 mb-8">
                {[
                  "ALL 6 strategies",
                  "5 active bots simultaneously",
                  "Advanced analytics",
                  "50 backtests/month",
                  "Real-time alerts",
                  "Strategy customization",
                  "Email support",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-surface-800">{f}</span>
                  </div>
                ))}
              </div>

              {/* Mini dashboard mock — Strategist tier */}
              <div className="bg-surface-50 border border-surface-300 mb-6">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-surface-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-surface-100 border border-surface-300 p-1.5">
                      <p className="text-[8px] font-mono text-surface-600">P&amp;L</p>
                      <p className="text-[10px] font-mono text-green-400 font-bold">+$847.50</p>
                    </div>
                    <div className="bg-surface-100 border border-surface-300 p-1.5">
                      <p className="text-[8px] font-mono text-surface-600">Win Rate</p>
                      <p className="text-[10px] font-mono text-white font-bold">73%</p>
                    </div>
                  </div>
                  {/* Mini chart */}
                  <div className="h-6 mb-2">
                    <svg viewBox="0 0 200 24" className="w-full h-full" preserveAspectRatio="none">
                      <path d="M0,20 L30,18 L60,15 L90,12 L120,10 L150,7 L180,5 L200,3" fill="none" stroke="rgb(74,222,128)" strokeWidth="1.5" />
                      <path d="M0,20 L30,18 L60,15 L90,12 L120,10 L150,7 L180,5 L200,3 L200,24 L0,24 Z" fill="rgb(74,222,128)" fillOpacity="0.1" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    {["Weather Arb", "Mean Rev.", "Spread Cap."].map((b) => (
                      <div key={b} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-green-400" />
                        <span className="text-[9px] font-mono text-white">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-mono text-surface-600 mb-1">Performance preview</p>
                <p className="text-sm font-mono text-green-400">$100 &rarr; $250&ndash;500/mo (paper, all strategies)</p>
              </div>

              <div className="mt-auto">
                <Link href="/signup">
                  <Button className="w-full bg-brand-600 text-white hover:bg-brand-500">
                    Upgrade to Strategist <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Operator — $149/mo */}
            <div className="bg-surface-100 border border-surface-300 p-8 flex flex-col">
              <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">Operator</p>
              <p className="text-3xl font-bold text-white font-mono mb-6">
                $149<span className="text-lg text-surface-600">/mo</span>
              </p>

              <p className="text-xs text-surface-600 mb-3">Everything in Strategist, plus:</p>
              <div className="space-y-3 mb-8">
                {[
                  "LIVE TRADING enabled",
                  "10 active bots",
                  "Unlimited backtests",
                  "Priority alerts",
                  "Wallet integration",
                  "API access",
                  "Priority support",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-surface-800">{f}</span>
                  </div>
                ))}
              </div>

              {/* Mini dashboard mock — Operator tier */}
              <div className="bg-surface-50 border border-surface-300 mb-6">
                <div className="flex items-center justify-between px-3 py-2 border-b border-surface-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-[8px] font-mono font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5">LIVE</span>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-surface-100 border border-surface-300 p-1.5">
                      <p className="text-[8px] font-mono text-surface-600">Real P&amp;L</p>
                      <p className="text-[10px] font-mono text-green-400 font-bold">+$2,847</p>
                    </div>
                    <div className="bg-surface-100 border border-surface-300 p-1.5">
                      <p className="text-[8px] font-mono text-surface-600">Wallet</p>
                      <p className="text-[10px] font-mono text-white font-bold">0x4f...a2</p>
                    </div>
                  </div>
                  {/* Mini chart */}
                  <div className="h-6 mb-2">
                    <svg viewBox="0 0 200 24" className="w-full h-full" preserveAspectRatio="none">
                      <path d="M0,22 L25,20 L50,17 L75,14 L100,11 L125,9 L150,7 L175,4 L200,2" fill="none" stroke="rgb(74,222,128)" strokeWidth="1.5" />
                      <path d="M0,22 L25,20 L50,17 L75,14 L100,11 L125,9 L150,7 L175,4 L200,2 L200,24 L0,24 Z" fill="rgb(74,222,128)" fillOpacity="0.1" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    {["Weather Arb", "Mean Rev.", "Spread Cap.", "Momentum", "+2 more"].map((b) => (
                      <div key={b} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-green-400" />
                        <span className="text-[9px] font-mono text-white">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-mono text-surface-600 mb-1">Performance preview</p>
                <p className="text-sm font-mono text-green-400">$1,000 &rarr; $1,500&ndash;3,000/mo (live, real returns)</p>
              </div>

              <div className="mt-auto">
                <Link href="/signup">
                  <Button className="w-full border border-surface-400 text-white hover:bg-surface-200 bg-transparent">
                    Go Operator <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* All plans include */}
          <div className="mt-12 text-center">
            <p className="text-sm text-surface-600">
              <span className="text-surface-800 font-medium">All plans include:</span>{" "}
              Paper trading, risk controls, emergency stop, trade logging, Telegram alerts
            </p>
          </div>
        </div>
      </section>

      {/* ── Trust ────────────────────────────────────────────────────── */}
      <section className="bg-surface-50 py-24 sm:py-32 border-y border-surface-300">
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
      <section className="bg-surface-0 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Start Trading in 60 Seconds
          </h2>
          <p className="mt-6 text-lg text-surface-800 max-w-xl mx-auto">
            Create a free account. Deploy a paper bot. Watch it trade.
          </p>

          {/* Mini bot launch preview */}
          <div className="mt-10 bg-surface-100 border border-surface-300 max-w-md mx-auto p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
              <span className="text-xs font-mono text-green-400">
                BOT DEPLOYED
              </span>
            </div>
            <div className="space-y-2 text-sm font-mono text-left">
              <p className="text-surface-600">
                <span className="text-white">Strategy:</span> Weather Arb
              </p>
              <p className="text-surface-600">
                <span className="text-white">Mode:</span> Paper Trading
              </p>
              <p className="text-surface-600">
                <span className="text-white">Status:</span>{" "}
                <span className="text-green-400">Scanning 60+ markets...</span>
              </p>
            </div>
          </div>

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

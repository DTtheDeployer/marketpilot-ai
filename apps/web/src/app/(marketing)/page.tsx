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
import { ArrowRight, AlertTriangle, Check, CloudSun, Trophy } from "lucide-react";

const tradeFeed = [
  {
    status: "open",
    time: "3m ago",
    action: "BUY",
    market: "Lakers ML YES",
    price: "42\u00A2",
    detail: "DraftKings: 58% | Poly: 42% | Edge: +16% | Size: $1.80",
  },
  {
    status: "won",
    time: "2h ago",
    action: "SELL",
    market: "Man City ML YES",
    price: "71\u00A2",
    detail: "Entry: 52\u00A2 | Profit: +$0.95 | ROI: +36%",
  },
  {
    status: "won",
    time: "5h ago",
    action: "SELL",
    market: "UFC Main Event YES",
    price: "68\u00A2",
    detail: "Entry: 38\u00A2 | Profit: +$1.20 | ROI: +79%",
  },
  {
    status: "open",
    time: "6h ago",
    action: "BUY",
    market: "Celtics -3.5 YES",
    price: "45\u00A2",
    detail: "FanDuel: 61% | Poly: 45% | Edge: +16% | Size: $1.60",
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
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="success">Live Now</Badge>
                <Badge variant="default">Sports Arbitrage</Badge>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
                The Books<br />
                Set the Odds.<br />
                <span className="text-brand-400">You Trade the Gap.</span>
              </h1>
              <p className="mt-8 text-lg text-surface-800 max-w-xl leading-relaxed">
                Sharp bookmakers price sports at 58%.
                Polymarket trades the same outcome at 42\u00A2.
                MarketPilot&apos;s Sports Arb bot detects these edges across
                NBA, UFC, EPL, Champions League, and NFL&nbsp;&mdash; then
                trades them automatically.
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
                <Link href="/how-it-works">
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-surface-400 text-white hover:bg-surface-100"
                  >
                    See How It Works
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — Live Trade Feed */}
            <div className="bg-surface-100 border border-surface-300">
              <div className="flex items-center justify-between px-6 py-4 border-b border-surface-300">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-brand-400" />
                  <p className="text-xs font-mono text-surface-600 uppercase tracking-wider">
                    Sports Arb — Paper Trading Feed
                  </p>
                </div>
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
                    <span className="text-green-400 font-bold">+$5.95</span>
                    <span className="text-surface-600">
                      Win Rate: <span className="text-white">78%</span>
                    </span>
                    <span className="text-surface-600">
                      <span className="text-white">9</span> trades
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
            From odds to profit in four steps. Here&apos;s exactly how the Sports Arb bot turns a bookmaker edge into money.
          </p>

          {/* Desktop: horizontal flow */}
          <div className="hidden lg:grid grid-cols-4 gap-0 items-start">
            {/* Card 1 — SCAN */}
            <div className="flex flex-col items-center">
              <div className="bg-surface-100 border border-surface-300 w-full p-6">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                  01 &mdash; SCAN
                </p>
                <div className="text-3xl mb-3">&#127942;</div>
                <p className="text-sm font-bold text-white font-mono mb-1">
                  The Odds API
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Event</span>
                    <span className="text-white">Lakers vs Celtics</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Book</span>
                    <span className="text-white">DraftKings</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Lakers ML</span>
                    <span className="text-brand-400 font-bold">58%</span>
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
                    <span className="text-white">Lakers to Win</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Price</span>
                    <span className="text-white">42&cent;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Edge</span>
                    <span className="text-green-400 font-bold">+16%</span>
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
                    <span className="text-brand-400 font-bold">BUY Lakers YES</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Size</span>
                    <span className="text-white">$1.80 (&#188;-Kelly)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">EV</span>
                    <span className="text-green-400 font-bold">+$0.29/share</span>
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
                  Lakers WIN
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Payout</span>
                    <span className="text-white">$4.29</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Cost</span>
                    <span className="text-white">$1.80</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Profit</span>
                    <span className="text-green-400 font-bold">+$2.49</span>
                  </div>
                  <div className="flex justify-between border-t border-surface-300 pt-2">
                    <span className="text-surface-600">ROI</span>
                    <span className="text-green-400 font-bold text-lg">+138%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: vertical stack */}
          <div className="lg:hidden space-y-4">
            {[
              {
                step: "01", label: "SCAN", emoji: "\u{1F3C6}", source: "The Odds API",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["Event", "Lakers vs Celtics", "text-white"],
                  ["Book", "DraftKings", "text-white"],
                  ["Lakers ML", "58%", "text-brand-400 font-bold"],
                ],
              },
              {
                step: "02", label: "DETECT", emoji: "\u{1F4CA}", source: "Polymarket",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["Market", "Lakers to Win", "text-white"],
                  ["Price", "42\u00A2", "text-white"],
                  ["Edge", "+16%", "text-green-400 font-bold"],
                ],
              },
              {
                step: "03", label: "TRADE", emoji: "\u26A1", source: "Bot Executes",
                color: "text-brand-400", borderColor: "border-brand-500/30",
                rows: [
                  ["Action", "BUY Lakers YES", "text-brand-400 font-bold"],
                  ["Size", "$1.80 (\u00BC-Kelly)", "text-white"],
                  ["EV", "+$0.29/share", "text-green-400 font-bold"],
                ],
              },
              {
                step: "04", label: "PROFIT", emoji: "\u2705", source: "Lakers WIN",
                color: "text-green-400", borderColor: "border-green-500/30",
                rows: [
                  ["Payout", "$4.29", "text-white"],
                  ["Cost", "$1.80", "text-white"],
                  ["Profit", "+$2.49", "text-green-400 font-bold"],
                  ["ROI", "+138%", "text-green-400 font-bold"],
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

      {/* ── Sports Leagues ─────────────────────────────────────────────── */}
      <section className="bg-surface-0 py-16 border-b border-surface-300">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <p className="text-center text-sm font-mono text-surface-600 uppercase tracking-wider mb-8">
            Scanning 5 leagues every 5 minutes
          </p>
          <div className="grid grid-cols-5 gap-4 text-center">
            {[
              { league: "NBA", icon: "\u{1F3C0}" },
              { league: "UFC/MMA", icon: "\u{1F94A}" },
              { league: "EPL", icon: "\u26BD" },
              { league: "UCL", icon: "\u{1F3C6}" },
              { league: "NFL", icon: "\u{1F3C8}" },
            ].map((sport) => (
              <div key={sport.league} className="bg-surface-100 border border-surface-300 p-4">
                <p className="text-2xl mb-2">{sport.icon}</p>
                <p className="text-xs font-mono font-bold text-surface-900">{sport.league}</p>
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
                  <span className="text-surface-600">Min edge</span>
                  <span className="text-white">10%+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Sizing</span>
                  <span className="text-white">&#x215B;-Kelly</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-white">$25/day</span>
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
                  $140<span className="text-2xl text-surface-600">&ndash;</span>$180
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-brand-400">+40&ndash;80%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: "60%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Min edge</span>
                  <span className="text-white">5%+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Sizing</span>
                  <span className="text-white">&#188;-Kelly</span>
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
                  $180<span className="text-2xl text-surface-600">&ndash;</span>$300
                </p>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono text-surface-600 mb-2">
                  <span>Return</span>
                  <span className="text-amber-400">+80&ndash;200%/mo</span>
                </div>
                <div className="w-full h-3 bg-surface-300 overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: "90%" }} />
                </div>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-surface-600">Min edge</span>
                  <span className="text-white">3%+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Sizing</span>
                  <span className="text-white">&#189;-Kelly</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-white">$100/day</span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-8 text-xs text-surface-600 text-center max-w-2xl mx-auto">
            Projections based on backtest data using the Sports Arb strategy. Actual results will vary.
            Past performance does not guarantee future returns. Trading prediction markets involves
            significant risk. Position sizes are automatically scaled by Kelly criterion.
          </p>
        </div>
      </section>

      {/* ── Your Command Center — Dashboard Preview ──────────────────── */}
      <section className="bg-surface-50 py-24 sm:py-32 border-y border-surface-300">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Your Command Center
          </h2>
          <p className="text-lg text-surface-600 mb-16 max-w-2xl">
            Real-time odds, live positions, automated execution&nbsp;&mdash; in one view.
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
                MarketPilot AI &mdash; Sports Arb Dashboard
              </p>
              <div />
            </div>

            {/* Top row — 4 stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 border-b border-surface-300">
              <div className="bg-surface-50 border border-surface-300 p-4">
                <p className="text-[10px] font-mono text-surface-600 uppercase tracking-wider mb-1">
                  Bankroll
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-white font-mono">
                  $247.50
                </p>
              </div>
              <div className="bg-surface-50 border border-surface-300 p-4">
                <p className="text-[10px] font-mono text-surface-600 uppercase tracking-wider mb-1">
                  Today&apos;s P&amp;L
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-green-400 font-mono">
                  +$12.40
                </p>
              </div>
              <div className="bg-surface-50 border border-surface-300 p-4">
                <p className="text-[10px] font-mono text-surface-600 uppercase tracking-wider mb-1">
                  Open Positions
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl lg:text-3xl font-bold text-white font-mono">3 / 5</p>
                  <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
                </div>
              </div>
              <div className="bg-surface-50 border border-surface-300 p-4">
                <p className="text-[10px] font-mono text-surface-600 uppercase tracking-wider mb-1">
                  Events Tracked
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-white font-mono">
                  24
                </p>
              </div>
            </div>

            {/* Bottom row — two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-surface-300">
              {/* Left — Active Events */}
              <div className="p-6">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                  Active Events
                </p>
                <div className="space-y-3">
                  {[
                    { event: "Lakers vs Celtics", sport: "NBA", book: "58% / 42%", edge: "+16%", edgeColor: "text-green-400" },
                    { event: "Man City vs Arsenal", sport: "EPL", book: "64% / 36%", edge: "+11%", edgeColor: "text-green-400" },
                    { event: "UFC 310 Main Event", sport: "MMA", book: "71% / 29%", edge: "+8%", edgeColor: "text-green-400" },
                    { event: "Bills vs Chiefs", sport: "NFL", book: "52% / 48%", edge: "+3%", edgeColor: "text-surface-600" },
                  ].map((evt) => (
                    <div key={evt.event} className="flex items-center justify-between text-sm font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-surface-600 bg-surface-200 px-1.5 py-0.5 rounded">{evt.sport}</span>
                        <span className="text-white">{evt.event}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-surface-600 text-xs hidden sm:inline">{evt.book}</span>
                        <span className={`font-bold ${evt.edgeColor}`}>{evt.edge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Recent Signals */}
              <div className="p-6">
                <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-4">
                  Recent Signals
                </p>
                <div className="space-y-3">
                  {[
                    { time: "3m ago", action: "BUY", team: "Lakers YES", size: "$1.80", edge: "+16%" },
                    { time: "2h ago", action: "SOLD", team: "Man City YES", size: "$1.50", edge: "+$0.95" },
                    { time: "5h ago", action: "SOLD", team: "UFC Main YES", size: "$1.20", edge: "+$1.20" },
                    { time: "8h ago", action: "BUY", team: "Celtics -3.5", size: "$1.60", edge: "+16%" },
                  ].map((signal, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-mono gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-surface-600 shrink-0">{signal.time}</span>
                        <span className={`font-bold shrink-0 ${signal.action === "BUY" ? "text-brand-400" : "text-green-400"}`}>
                          {signal.action}
                        </span>
                        <span className="text-white truncate">{signal.team}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-surface-600">{signal.size}</span>
                        <span className="text-green-400 font-bold">{signal.edge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Weather Arb Coming Soon ────────────────────────────────────── */}
      <section className="bg-surface-0 py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="bg-surface-100 border border-blue-500/20 p-8 sm:p-10 flex flex-col sm:flex-row items-start gap-6">
            <div className="shrink-0 h-14 w-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <CloudSun className="h-7 w-7 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-surface-900">Weather Arbitrage</h3>
                <Badge variant="paper">Coming Soon</Badge>
              </div>
              <p className="text-surface-700 text-sm leading-relaxed">
                NOAA forecasts vs Polymarket temperature brackets.
                When the government says 94% and the market says 11\u00A2,
                that&apos;s an 83-point edge. Sign up to get notified when it launches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
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
                  "Sports Arb strategy",
                  "Basic dashboard & stats",
                  "5 backtests/month",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-surface-800">{f}</span>
                  </div>
                ))}
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
                  "All strategies (incl. Weather Arb at launch)",
                  "5 active bots simultaneously",
                  "Advanced analytics & alerts",
                  "50 backtests/month",
                  "Strategy customization",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-surface-800">{f}</span>
                  </div>
                ))}
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
                  "Wallet integration",
                  "API access & priority support",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-surface-800">{f}</span>
                  </div>
                ))}
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

          <div className="mt-12 text-center">
            <p className="text-sm text-surface-600">
              <span className="text-surface-800 font-medium">All plans include:</span>{" "}
              Paper trading, risk controls, emergency stop, trade logging, Telegram alerts
            </p>
          </div>
        </div>
      </section>

      {/* ── Trust ────────────────────────────────────────────────────── */}
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
      <section className="bg-surface-50 py-24 sm:py-32 border-t border-surface-300">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Start Trading in 60 Seconds
          </h2>
          <p className="mt-6 text-lg text-surface-800 max-w-xl mx-auto">
            Create a free account. Deploy the Sports Arb bot. Watch it scan for edges across 5 leagues.
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
                <span className="text-white">Strategy:</span> Sports Arbitrage
              </p>
              <p className="text-surface-600">
                <span className="text-white">Mode:</span> Paper Trading
              </p>
              <p className="text-surface-600">
                <span className="text-white">Status:</span>{" "}
                <span className="text-green-400">Scanning NBA, UFC, EPL, UCL, NFL...</span>
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

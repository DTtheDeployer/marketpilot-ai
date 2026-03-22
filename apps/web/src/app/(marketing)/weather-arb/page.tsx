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
  CloudSun,
  ScanLine,
  GitCompare,
  Calculator,
  Ruler,
  Zap,
  LogOut,
  ShieldCheck,
  Clock,
  Database,
  ChevronDown,
  TrendingUp,
  Bot,
  Check,
} from "lucide-react";

const executionSteps = [
  {
    step: "01",
    icon: ScanLine,
    title: "Scan",
    description:
      "Every 2 minutes, the bot scans 60+ Polymarket weather markets for active contracts approaching resolution.",
  },
  {
    step: "02",
    icon: GitCompare,
    title: "Match",
    description:
      "Each market is matched to its corresponding NOAA forecast product \u2014 temperature, precipitation, or storm probability.",
  },
  {
    step: "03",
    icon: Calculator,
    title: "Evaluate",
    description:
      "The bot calculates expected value by comparing NOAA probability to the current Polymarket implied price. Only trades above the EV threshold proceed.",
  },
  {
    step: "04",
    icon: Ruler,
    title: "Size",
    description:
      "Position size is determined by Kelly criterion, capped at a configurable maximum. Larger EV gaps get larger allocations.",
  },
  {
    step: "05",
    icon: Zap,
    title: "Execute",
    description:
      "Limit orders are placed at the target price. The bot monitors fill status and adjusts if the market moves before fill.",
  },
  {
    step: "06",
    icon: LogOut,
    title: "Exit",
    description:
      "Positions are held to resolution (binary outcome). No active exit management needed \u2014 the market resolves YES or NO.",
  },
];

const riskControls = [
  { control: "Max position size", value: "5% of bankroll", description: "No single bet exceeds 5% of total capital" },
  { control: "Daily loss limit", value: "$200 (configurable)", description: "Bot pauses if daily losses exceed threshold" },
  { control: "Kelly fraction", value: "Quarter-Kelly default", description: "Conservative sizing reduces variance" },
  { control: "Min EV threshold", value: "+15% edge", description: "Only trades with significant positive EV" },
  { control: "Correlation cap", value: "3 correlated positions", description: "Limits exposure to similar weather events" },
  { control: "Circuit breaker", value: "5 consecutive losses", description: "Auto-pause and alert for manual review" },
];

const backtestResults = [
  { period: "Q1 2025", trades: 47, winRate: "76.6%", roi: "+58.2%", maxDrawdown: "-8.1%" },
  { period: "Q2 2025", trades: 52, winRate: "78.8%", roi: "+64.7%", maxDrawdown: "-6.3%" },
  { period: "Q3 2025", trades: 61, winRate: "80.3%", roi: "+71.4%", maxDrawdown: "-5.9%" },
  { period: "Q4 2025", trades: 54, winRate: "77.8%", roi: "+62.1%", maxDrawdown: "-7.2%" },
];

const faqItems = [
  {
    question: "How accurate is NOAA data really?",
    answer:
      "NOAA's Climate Prediction Center publishes verification reports showing 85-95% accuracy for 6-10 day temperature outlooks and 90-97% for shorter-range forecasts. The key insight is not that NOAA is perfect, but that it's dramatically more accurate than the implied probabilities on Polymarket, where retail traders price based on gut feeling rather than climatological data.",
  },
  {
    question: "Why doesn't the market already price in NOAA data?",
    answer:
      "Most Polymarket weather markets have low liquidity and are dominated by retail traders who don't consult NOAA probabilistic forecasts. The data is publicly available but requires programmatic access and statistical interpretation. The inefficiency persists because there aren't enough sophisticated participants to arbitrage it away \u2014 yet.",
  },
  {
    question: "What happens if NOAA is wrong?",
    answer:
      "The strategy accounts for NOAA's error rate. Kelly sizing ensures that even a string of incorrect forecasts won't cause catastrophic losses. The quarter-Kelly default means positions are sized conservatively. Historically, the strategy maintains profitability even when NOAA accuracy drops to 80%.",
  },
  {
    question: "Can this edge disappear?",
    answer:
      "Yes. If enough capital enters weather markets and prices converge to NOAA forecasts, the edge compresses. This is why we continuously monitor EV thresholds and only trade when the gap is significant. The strategy is designed to gracefully reduce activity as markets become more efficient.",
  },
  {
    question: "How much capital do I need?",
    answer:
      "Paper trading is free with no minimum. For live trading, we recommend a minimum bankroll of $500 to allow proper Kelly sizing across multiple positions. Larger bankrolls ($2,000+) enable better diversification across weather markets.",
  },
];

export default function WeatherArbPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="default">Pro</Badge>
              <Badge variant="paper">Data-Driven</Badge>
              <Badge variant="warning">Elevated Edge</Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-surface-900 leading-tight">
              Weather Arbitrage
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-surface-700 leading-relaxed">
              NOAA publishes probabilistic weather forecasts with 85-95% historical
              accuracy. Polymarket weather contracts are priced by retail traders
              using gut instinct. The gap between science and sentiment is the
              edge &mdash; and it&apos;s enormous.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="xl">
                  Start Paper Trading Weather Arb
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

      {/* ── One Trade, Explained — Visual Walkthrough ────────────────── */}
      <section className="border-y border-surface-300 bg-surface-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
            One Trade, Explained
          </h2>
          <p className="text-lg text-surface-700 mb-16 max-w-2xl">
            From data to dollars in four steps. Here&apos;s exactly how the bot turns a NOAA forecast into profit.
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
                <p className="text-sm font-bold text-surface-900 font-mono mb-1">
                  NOAA API
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">City</span>
                    <span className="text-surface-900">NYC Saturday</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">High</span>
                    <span className="text-surface-900">75&deg;F</span>
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
                <p className="text-sm font-bold text-surface-900 font-mono mb-1">
                  Polymarket
                </p>
                <div className="mt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600">Market</span>
                    <span className="text-surface-900">NYC 74-76&deg;F</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Price</span>
                    <span className="text-surface-900">11&cent;</span>
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
                    <span className="text-surface-900">$2.00</span>
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
                    <span className="text-surface-900">$18.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600">Cost</span>
                    <span className="text-surface-900">$2.00</span>
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
                step: "01", label: "SCAN", source: "NOAA API",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["City", "NYC Saturday", "text-surface-900"],
                  ["High", "75\u00B0F", "text-surface-900"],
                  ["Conf", "94%", "text-brand-400 font-bold"],
                ],
              },
              {
                step: "02", label: "DETECT", source: "Polymarket",
                color: "text-surface-600", borderColor: "",
                rows: [
                  ["Market", "NYC 74-76\u00B0F", "text-surface-900"],
                  ["Price", "11\u00A2", "text-surface-900"],
                  ["Implied", "11%", "text-red-400 font-bold"],
                ],
              },
              {
                step: "03", label: "TRADE", source: "Bot Executes",
                color: "text-brand-400", borderColor: "border-brand-500/30",
                rows: [
                  ["Action", "BUY 18 shares", "text-brand-400 font-bold"],
                  ["Cost", "$2.00", "text-surface-900"],
                  ["EV", "+$0.83/share", "text-green-400 font-bold"],
                ],
              },
              {
                step: "04", label: "PROFIT", source: "Resolved YES",
                color: "text-green-400", borderColor: "border-green-500/30",
                rows: [
                  ["Payout", "$18.00", "text-surface-900"],
                  ["Cost", "$2.00", "text-surface-900"],
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

      {/* ── What's Possible — Scenario Cards ─────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
            What&apos;s Possible
          </h2>
          <p className="text-lg text-surface-700 mb-16 max-w-2xl">
            Three risk profiles, one strategy. Choose how aggressively the bot trades.
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
                  Starting with $100
                </p>
                <p className="text-4xl font-bold text-surface-900 font-mono">
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
                  <span className="text-surface-900">2&ndash;3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Filter</span>
                  <span className="text-surface-900">High confidence only</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Loss limit</span>
                  <span className="text-surface-900">$50/day</span>
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
                  Starting with $100
                </p>
                <p className="text-4xl font-bold text-surface-900 font-mono">
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
                  <span className="text-surface-900">5&ndash;8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Filter</span>
                  <span className="text-surface-900">Balanced risk</span>
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
                  Starting with $100
                </p>
                <p className="text-4xl font-bold text-surface-900 font-mono">
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
                  <span className="text-surface-900">10+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Filter</span>
                  <span className="text-surface-900">Higher risk tolerance</span>
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
            performance does not guarantee future returns. Trading prediction
            markets involves significant risk.
          </p>
        </div>
      </section>

      {/* ── The Thesis ────────────────────────────────────────────────── */}
      <section className="border-y border-surface-300 bg-surface-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-surface-900 mb-6">
              The Thesis
            </h2>
            <div className="space-y-4 text-surface-700 leading-relaxed">
              <p>
                Polymarket hosts dozens of weather-related prediction markets:
                &ldquo;Will July 2026 be the hottest on record?&rdquo;,
                &ldquo;Above-normal temperatures in the Southwest this spring?&rdquo;,
                &ldquo;Hurricane season above average?&rdquo;
              </p>
              <p>
                These markets are priced by retail participants who generally rely
                on recent memory, news headlines, and intuition. They do not
                consult NOAA&apos;s Climate Prediction Center, which publishes
                probabilistic forecasts updated daily with rigorous statistical
                methodology and decades of verification data.
              </p>
              <p>
                The result: <strong className="text-surface-900">persistent, measurable
                mispricings</strong>. When NOAA says 94% and the market says 11&cent;,
                the expected value of a YES position is massively positive. The
                Weather Arb strategy systematically identifies and exploits these
                gaps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Math ──────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-surface-900">The Math</h2>
            <p className="mt-4 text-lg text-surface-700 max-w-2xl mx-auto">
              Expected value drives every decision. Here&apos;s how a typical
              Weather Arb trade is evaluated.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* EV Calculation */}
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center mb-3">
                  <Calculator className="h-5 w-5 text-brand-400" />
                </div>
                <CardTitle>Expected Value Calculation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 font-mono text-sm">
                  <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-4 space-y-2">
                    <p className="text-surface-600">
                      <span className="text-surface-900">NOAA probability:</span> 94%
                    </p>
                    <p className="text-surface-600">
                      <span className="text-surface-900">Market price:</span> $0.11 (11%)
                    </p>
                    <p className="text-surface-600">
                      <span className="text-surface-900">Payout if YES:</span> $1.00
                    </p>
                    <div className="border-t border-surface-300 pt-2 mt-2">
                      <p className="text-surface-600">
                        <span className="text-surface-900">EV</span> = (0.94 x $0.89) - (0.06 x $0.11)
                      </p>
                      <p className="text-surface-600">
                        <span className="text-surface-900">EV</span> = $0.8366 - $0.0066
                      </p>
                      <p className="text-green-400 font-bold">
                        EV = +$0.83 per share (754% ROI)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kelly Sizing */}
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center mb-3">
                  <Ruler className="h-5 w-5 text-brand-400" />
                </div>
                <CardTitle>Kelly Criterion Sizing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 font-mono text-sm">
                  <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-4 space-y-2">
                    <p className="text-surface-600">
                      <span className="text-surface-900">Kelly %</span> = (bp - q) / b
                    </p>
                    <p className="text-surface-600">
                      <span className="text-surface-900">b</span> = odds received = $0.89 / $0.11 = 8.09
                    </p>
                    <p className="text-surface-600">
                      <span className="text-surface-900">p</span> = probability of win = 0.94
                    </p>
                    <p className="text-surface-600">
                      <span className="text-surface-900">q</span> = probability of loss = 0.06
                    </p>
                    <div className="border-t border-surface-300 pt-2 mt-2">
                      <p className="text-surface-600">
                        <span className="text-surface-900">Full Kelly</span> = (8.09 x 0.94 - 0.06) / 8.09
                      </p>
                      <p className="text-surface-600">
                        <span className="text-surface-900">Full Kelly</span> = 93.3% of bankroll
                      </p>
                      <p className="text-amber-400 font-bold">
                        Quarter-Kelly = 23.3% (capped at 5%)
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-surface-600">
                    Quarter-Kelly reduces variance while preserving most of the
                    edge. Position cap prevents over-concentration.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Execution Flow ────────────────────────────────────────────── */}
      <section className="py-24 bg-surface-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-surface-900">
              Execution Flow
            </h2>
            <p className="mt-4 text-lg text-surface-700 max-w-2xl mx-auto">
              Six steps, fully automated, running 24/7.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {executionSteps.map((step) => (
              <div key={step.step} className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl font-bold text-brand-600/20">
                    {step.step}
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-brand-600/10 flex items-center justify-center">
                    <step.icon className="h-4 w-4 text-brand-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-surface-700 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Risk Controls ─────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900">
              Risk Controls
            </h2>
            <p className="mt-4 text-lg text-surface-700 max-w-2xl mx-auto">
              Every position is bounded by multiple layers of protection.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-300">
                        <th className="text-left py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                          Control
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                          Default Value
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {riskControls.map((row) => (
                        <tr
                          key={row.control}
                          className="border-b border-surface-300 last:border-0 hover:bg-surface-200/50 transition-colors"
                        >
                          <td className="py-4 px-6 font-medium text-surface-900">
                            {row.control}
                          </td>
                          <td className="py-4 px-6 font-mono text-brand-400">
                            {row.value}
                          </td>
                          <td className="py-4 px-6 text-surface-700">
                            {row.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Backtest Results ──────────────────────────────────────────── */}
      <section className="py-24 bg-surface-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900">
              Backtest Results
            </h2>
            <p className="mt-4 text-lg text-surface-700 max-w-2xl mx-auto">
              Historical performance across four quarters of Polymarket weather
              markets.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-300">
                        <th className="text-left py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                          Period
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                          Trades
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                          Win Rate
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                          ROI
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-mono text-surface-600 uppercase tracking-wider">
                          Max Drawdown
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {backtestResults.map((row) => (
                        <tr
                          key={row.period}
                          className="border-b border-surface-300 last:border-0 hover:bg-surface-200/50 transition-colors"
                        >
                          <td className="py-4 px-6 font-medium text-surface-900">
                            {row.period}
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-surface-700">
                            {row.trades}
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-surface-700">
                            {row.winRate}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-bold text-green-400">
                            {row.roi}
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-red-400">
                            {row.maxDrawdown}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            <p className="mt-4 text-xs text-surface-600 text-center">
              Backtested against historical Polymarket data and NOAA forecasts.
              Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </section>

      {/* ── Data Sources ──────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900">
              Data Sources
            </h2>
            <p className="mt-4 text-lg text-surface-700 max-w-2xl mx-auto">
              Institutional-quality data feeds powering every decision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center mb-3">
                  <CloudSun className="h-5 w-5 text-brand-400" />
                </div>
                <CardTitle>NOAA Climate Prediction Center</CardTitle>
                <CardDescription>
                  Primary signal source
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-surface-700">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-400 mt-1">&#8226;</span>
                    6-10 day and 8-14 day temperature outlooks
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-400 mt-1">&#8226;</span>
                    Monthly and seasonal precipitation forecasts
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-400 mt-1">&#8226;</span>
                    Hurricane season probability assessments
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-400 mt-1">&#8226;</span>
                    85-95% historical accuracy (verified)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-400 mt-1">&#8226;</span>
                    Updated daily, programmatic API access
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center mb-3">
                  <Database className="h-5 w-5 text-brand-400" />
                </div>
                <CardTitle>Polymarket CLOB API</CardTitle>
                <CardDescription>
                  Market data and execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-surface-700">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-400 mt-1">&#8226;</span>
                    Real-time orderbook depth and pricing
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-400 mt-1">&#8226;</span>
                    Weather market contract discovery
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-400 mt-1">&#8226;</span>
                    Limit order placement and monitoring
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-400 mt-1">&#8226;</span>
                    Historical price and volume data
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-400 mt-1">&#8226;</span>
                    Resolution status tracking
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-surface-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-surface-300 bg-surface-100"
              >
                <summary className="flex items-center justify-between cursor-pointer p-6 text-surface-900 font-medium">
                  {item.question}
                  <ChevronDown className="h-5 w-5 text-surface-600 transition-transform group-open:rotate-180 shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-6 text-sm text-surface-700 leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Requirements ──────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900">
              Requirements
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center mb-3">
                  <Bot className="h-5 w-5 text-brand-400" />
                </div>
                <CardTitle className="text-base">Plan</CardTitle>
                <CardDescription>
                  Pro tier or above. Paper trading available on all plans.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center mb-3">
                  <TrendingUp className="h-5 w-5 text-brand-400" />
                </div>
                <CardTitle className="text-base">Capital</CardTitle>
                <CardDescription>
                  $0 for paper trading. $500+ recommended for live execution.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center mb-3">
                  <Clock className="h-5 w-5 text-brand-400" />
                </div>
                <CardTitle className="text-base">Setup Time</CardTitle>
                <CardDescription>
                  Under 5 minutes. Configure risk parameters and deploy.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-24 bg-surface-50">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <CloudSun className="h-12 w-12 text-brand-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-surface-900">
            Start Paper Trading Weather Arb
          </h2>
          <p className="mt-4 text-lg text-surface-700">
            Prove the edge with zero risk. Watch the bot identify and trade
            weather mispricings in real time &mdash; with simulated capital.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">
                Start Paper Trading Weather Arb
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

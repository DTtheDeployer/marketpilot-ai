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
  Zap,
  TrendingUp,
  BarChart3,
  Activity,
  Volume2,
} from "lucide-react";

export default function MomentumSurgePage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="default">Pro</Badge>
              <Badge variant="warning">Higher Risk</Badge>
              <Badge variant="muted">Trend Following</Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Momentum Surge
            </h1>
            <p className="mt-6 text-lg text-surface-800 leading-relaxed max-w-2xl">
              Detects unusual trading volume and rapid price movement to ride directional
              moves in fast-moving prediction markets. When the crowd rushes in, the bot
              is already positioned.
            </p>
            <p className="mt-2 text-sm text-surface-600">
              Risk Level: 4/5 &middot; Edge Source: Volume + price momentum detection &middot; Hold Time: 30 min — 6 hours
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg">
                  Paper Trade This Strategy
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/strategies">
                <Button variant="outline" size="lg">
                  Compare All Strategies
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section className="py-20 border-t border-surface-300">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-surface-800 max-w-2xl mb-12">
            When a prediction market suddenly sees 5-10x its normal trading volume,
            it usually means new information is being priced in. The bot detects these
            surges before the price fully adjusts and rides the momentum.
          </p>

          {/* Volume spike visual */}
          <div className="mb-16">
            <Card className="p-6">
              <p className="text-xs text-surface-600 font-mono mb-4">VOLUME DETECTION — REAL-TIME</p>
              <div className="flex items-end gap-1 h-40 mb-4">
                {/* Normal volume bars */}
                {[20, 25, 18, 22, 30, 15, 28, 20, 24, 18].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-surface-400 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
                {/* Surge bars */}
                {[45, 65, 90, 100, 85].map((h, i) => (
                  <div
                    key={`s-${i}`}
                    className="flex-1 bg-amber-500 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
                {/* After */}
                {[60, 40, 35].map((h, i) => (
                  <div
                    key={`a-${i}`}
                    className="flex-1 bg-surface-400 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-surface-600">
                <span>Normal volume</span>
                <span className="text-amber-400 font-medium">Volume surge detected — 7.2x average</span>
                <span>Fading</span>
              </div>
            </Card>
          </div>

          {/* Flow cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-5">
              <div className="text-xs font-mono text-amber-400 mb-3">01 — MONITOR</div>
              <h3 className="text-lg font-bold text-white mb-2">Track Volume</h3>
              <p className="text-sm text-surface-700">
                Bot monitors 24h rolling volume across all active markets. Calculates
                a baseline average for each market.
              </p>
              <div className="mt-4 p-3 bg-surface-200 rounded border border-surface-300">
                <p className="text-xs font-mono text-surface-600">Baseline: 1,200 trades/hr</p>
                <p className="text-xs font-mono text-surface-600">Current: 8,640 trades/hr</p>
                <p className="text-xs font-mono text-amber-400">Ratio: 7.2x normal</p>
              </div>
            </Card>

            <Card className="p-5">
              <div className="text-xs font-mono text-amber-400 mb-3">02 — DETECT</div>
              <h3 className="text-lg font-bold text-white mb-2">Confirm Direction</h3>
              <p className="text-sm text-surface-700">
                Volume alone isn't enough. Bot checks if price is moving WITH the volume.
                Surge + directional move = signal.
              </p>
              <div className="mt-4 p-3 bg-surface-200 rounded border border-surface-300">
                <p className="text-xs font-mono text-surface-600">Price 5m ago: 34¢</p>
                <p className="text-xs font-mono text-surface-600">Price now: 41¢</p>
                <p className="text-xs font-mono text-green-400">Move: +20.6% with volume</p>
              </div>
            </Card>

            <Card className="p-5">
              <div className="text-xs font-mono text-amber-400 mb-3">03 — ENTER</div>
              <h3 className="text-lg font-bold text-white mb-2">Ride the Wave</h3>
              <p className="text-sm text-surface-700">
                Bot enters in the direction of momentum. Position sized by Kelly
                using volume-derived confidence score.
              </p>
              <div className="mt-4 p-3 bg-surface-200 rounded border border-surface-300">
                <p className="text-xs font-mono text-green-400">BUY @ 41¢</p>
                <p className="text-xs font-mono text-surface-600">Size: $3.00</p>
                <p className="text-xs font-mono text-surface-600">Confidence: 78%</p>
              </div>
            </Card>

            <Card className="p-5">
              <div className="text-xs font-mono text-amber-400 mb-3">04 — EXIT</div>
              <h3 className="text-lg font-bold text-white mb-2">Take Profit</h3>
              <p className="text-sm text-surface-700">
                Exit when momentum fades (volume drops below 3x baseline) or
                target reached. Tight stop-loss if reversal detected.
              </p>
              <div className="mt-4 p-3 bg-surface-200 rounded border border-surface-300">
                <p className="text-xs font-mono text-surface-600">Exit @ 58¢</p>
                <p className="text-xs font-mono text-green-400">Profit: +$1.24/share</p>
                <p className="text-xs font-mono text-surface-600">Hold: 2.5 hours</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ── One Trade Explained ────────────────────────────────────────── */}
      <section className="py-20 bg-surface-50 border-t border-surface-300">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12">One Trade, Explained</h2>

          <Card className="max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-surface-600 font-mono">MOMENTUM TRADE</p>
                <p className="text-lg font-bold text-white mt-1">
                  &quot;Will Russia capture Rodyanske by March 31?&quot;
                </p>
              </div>
              <Badge variant="success">CLOSED +41.5%</Badge>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between p-3 bg-surface-200 rounded border border-surface-300">
                <span className="text-sm text-surface-700">Volume Surge Detected</span>
                <span className="text-sm font-mono text-amber-400">8.3x baseline</span>
              </div>
              <div className="flex justify-between p-3 bg-surface-200 rounded border border-surface-300">
                <span className="text-sm text-surface-700">Entry Price</span>
                <span className="text-sm font-mono text-white">41¢</span>
              </div>
              <div className="flex justify-between p-3 bg-surface-200 rounded border border-surface-300">
                <span className="text-sm text-surface-700">Direction</span>
                <span className="text-sm font-mono text-green-400">BUY (momentum up)</span>
              </div>
              <div className="flex justify-between p-3 bg-surface-200 rounded border border-surface-300">
                <span className="text-sm text-surface-700">Exit Price</span>
                <span className="text-sm font-mono text-white">58¢</span>
              </div>
              <div className="flex justify-between p-3 bg-surface-200 rounded border border-surface-300">
                <span className="text-sm text-surface-700">Hold Time</span>
                <span className="text-sm font-mono text-surface-800">2 hours 34 minutes</span>
              </div>
              <div className="flex justify-between p-3 bg-green-500/10 rounded border border-green-500/20">
                <span className="text-sm font-medium text-green-400">Profit per $1 risked</span>
                <span className="text-sm font-mono font-bold text-green-400">+$0.41</span>
              </div>
            </div>

            <p className="text-xs text-surface-600">
              Breaking news caused a volume spike. Bot detected the surge within 2 minutes,
              entered at 41¢, and exited at 58¢ when volume returned to 3x baseline.
            </p>
          </Card>
        </div>
      </section>

      {/* ── What To Expect ─────────────────────────────────────────────── */}
      <section className="py-20 border-t border-surface-300">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">What $100 Could Become</h2>
          <p className="text-surface-700 mb-12">
            Hypothetical scenarios based on backtest data. Actual results will vary.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-blue-500/20">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Conservative</h3>
              </div>
              <p className="text-3xl font-mono font-bold text-white mb-1">$120 — $145</p>
              <div className="w-full bg-surface-300 rounded-full h-2 mb-4">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "35%" }} />
              </div>
              <div className="space-y-2 text-sm text-surface-700">
                <p>3-5 trades per week</p>
                <p>Only 10x+ volume surges</p>
                <p>Tight stop-losses</p>
              </div>
            </Card>

            <Card className="p-6 border-2 border-brand-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-brand-400" />
                  <h3 className="text-lg font-bold text-white">Moderate</h3>
                </div>
                <Badge variant="default">POPULAR</Badge>
              </div>
              <p className="text-3xl font-mono font-bold text-white mb-1">$160 — $230</p>
              <div className="w-full bg-surface-300 rounded-full h-2 mb-4">
                <div className="bg-brand-500 h-2 rounded-full" style={{ width: "65%" }} />
              </div>
              <div className="space-y-2 text-sm text-surface-700">
                <p>8-12 trades per week</p>
                <p>5x+ volume threshold</p>
                <p>Balanced risk controls</p>
              </div>
            </Card>

            <Card className="p-6 border-amber-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Aggressive</h3>
              </div>
              <p className="text-3xl font-mono font-bold text-white mb-1">$250 — $500+</p>
              <div className="w-full bg-surface-300 rounded-full h-2 mb-4">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: "90%" }} />
              </div>
              <div className="space-y-2 text-sm text-surface-700">
                <p>15+ trades per week</p>
                <p>3x+ volume threshold</p>
                <p>Higher drawdown tolerance</p>
              </div>
            </Card>
          </div>

          <p className="text-xs text-surface-600 mt-6">
            Hypothetical returns based on backtest simulations. Not a guarantee.
            Actual results depend on market conditions, liquidity, and timing.
          </p>
        </div>
      </section>

      {/* ── Key Stats ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-surface-50 border-t border-surface-300">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12">The Numbers</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Win Rate", value: "64%", sub: "Backtest (2024)" },
              { label: "30-Day Return", value: "+26.8%", sub: "$100 → $126.80", color: "text-green-400" },
              { label: "Max Drawdown", value: "-9.2%", sub: "Worst peak-to-trough", color: "text-red-400" },
              { label: "Trades / Month", value: "45", sub: "Avg 1.5/day" },
            ].map((stat) => (
              <Card key={stat.label} className="p-6 text-center">
                <p className={`text-4xl lg:text-5xl font-mono font-bold ${stat.color || "text-white"}`}>
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-surface-800 mt-2">{stat.label}</p>
                <p className="text-xs text-surface-600 mt-1">{stat.sub}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Risk ──────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-surface-300">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Risk Profile</h2>

          <div className="flex items-center gap-3 mb-8">
            <span className="text-sm text-surface-700">Lower Risk</span>
            <div className="flex-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded ${i <= 4 ? "bg-amber-500" : "bg-surface-400"}`}
                />
              ))}
            </div>
            <span className="text-sm text-surface-700">Higher Risk</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">What Can Go Wrong</h3>
              </div>
              <ul className="space-y-3 text-sm text-surface-800">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#x2022;</span>
                  <span><strong>False breakouts</strong> — volume spike with no follow-through. Price reverses after entry.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#x2022;</span>
                  <span><strong>Whipsaws</strong> — rapid reversals in volatile markets. Can hit stop-loss multiple times.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#x2022;</span>
                  <span><strong>Late entry</strong> — by the time volume is confirmed, the move may be mostly done.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">&#x2022;</span>
                  <span><strong>Slippage</strong> — fast-moving markets may fill at worse prices than expected.</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-bold text-white">How the Bot Handles It</h3>
              </div>
              <ul className="space-y-3 text-sm text-surface-800">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">&#x2022;</span>
                  <span><strong>Volume + price confirmation</strong> — requires both to trigger, not volume alone.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">&#x2022;</span>
                  <span><strong>Trailing stop-loss</strong> — locks in profits as price moves favorably. Exits on reversal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">&#x2022;</span>
                  <span><strong>Volume fade exit</strong> — automatically exits when volume drops below 3x baseline.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">&#x2022;</span>
                  <span><strong>Max loss per trade</strong> — hard cap at 5% of bankroll per position. No exceptions.</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-surface-50 border-t border-surface-300">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Catch the Surge
          </h2>
          <p className="text-surface-700 mb-8">
            Start paper trading Momentum Surge. Watch it detect volume spikes and ride
            the momentum — with zero risk.
          </p>
          <Link href="/signup">
            <Button size="xl">
              Paper Trade Momentum Surge
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Disclaimer ────────────────────────────────────────────────── */}
      <section className="py-8 border-t border-surface-300">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs text-surface-600 text-center max-w-2xl mx-auto">
            Momentum Surge is a higher-risk strategy. Past performance — simulated or live — does
            not guarantee future results. Paper trade first to understand the strategy before
            deploying real capital. This is not financial advice.
          </p>
        </div>
      </section>
    </div>
  );
}

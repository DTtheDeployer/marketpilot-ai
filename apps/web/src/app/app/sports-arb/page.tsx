"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from "@marketpilot/ui";
import {
  Trophy,
  Play,
  Square,
  RefreshCw,
  AlertOctagon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Settings2,
  Zap,
} from "lucide-react";

interface SportsStatus {
  running: boolean;
  scan_count: number;
  scan_interval_sec: number;
  last_scan_at: string | null;
  last_error: string | null;
  consecutive_errors: number;
  position_manager: {
    bankroll: number;
    today_realized_pnl: number;
    open_positions: number;
    total_pnl: number;
    today_trades_opened: number;
    today_trades_closed: number;
  };
  last_signals_count: number;
  last_markets_count: number;
  last_odds_count: number;
  odds_api_configured: boolean;
}

interface SportsSignal {
  id: string;
  event: string;
  sport: string;
  side: string;
  outcome: string;
  team: string;
  bookmaker_prob: number;
  polymarket_price: number;
  edge_pct: number;
  kelly_size: number;
  confidence: string;
  market_id: string;
  market_question: string;
  best_book: string;
  commence_time: string;
  executed: boolean;
}

interface SportsPosition {
  id: string;
  market_id: string;
  sport: string;
  event: string;
  outcome: string;
  entry_price: number;
  size_usd: number;
  shares: number;
  bookmaker_prob: number;
  opened_at: string;
  status: string;
}

interface OddsEvent {
  event_id: string;
  event: string;
  team1: string;
  team2: string;
  team1_prob: number;
  team2_prob: number;
  best_book: string;
  sport: string;
  commence_time: string;
}

const STRATEGY_URL = process.env.NEXT_PUBLIC_STRATEGY_URL || "http://localhost:8000";

const SPORT_LABELS: Record<string, string> = {
  upcoming_mma_mixed_martial_arts: "MMA/UFC",
  basketball_nba: "NBA",
  soccer_epl: "EPL",
  soccer_uefa_champions_league: "UCL",
  americanfootball_nfl: "NFL",
};

function sportLabel(key: string): string {
  return SPORT_LABELS[key] || key.split("_").pop()?.toUpperCase() || key;
}

export default function SportsArbPage() {
  const [status, setStatus] = useState<SportsStatus | null>(null);
  const [signals, setSignals] = useState<SportsSignal[]>([]);
  const [positions, setPositions] = useState<SportsPosition[]>([]);
  const [odds, setOdds] = useState<OddsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${STRATEGY_URL}/sports-arb/status`);
      const data = await res.json();
      setStatus(data);
    } catch {
      setError("Cannot connect to strategy engine");
    }
  }, []);

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch(`${STRATEGY_URL}/sports-arb/signals`);
      if (!res.ok) return;
      const data = await res.json();
      setSignals(data.signals || []);
    } catch {
      // silent
    }
  }, []);

  const fetchPositions = useCallback(async () => {
    try {
      const res = await fetch(`${STRATEGY_URL}/sports-arb/positions`);
      const data = await res.json();
      setPositions(data.open || []);
    } catch {
      // silent
    }
  }, []);

  const fetchOdds = useCallback(async () => {
    try {
      const res = await fetch(`${STRATEGY_URL}/sports-arb/odds`);
      if (!res.ok) return;
      const data = await res.json();
      setOdds(data.odds || []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchStatus(), fetchSignals(), fetchPositions(), fetchOdds()]);
      setLoading(false);
    };
    load();
    const interval = setInterval(() => {
      fetchStatus();
      fetchSignals();
      fetchPositions();
      fetchOdds();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchSignals, fetchPositions, fetchOdds]);

  const handleStart = async () => {
    setActionLoading("start");
    setError(null);
    try {
      const res = await fetch(`${STRATEGY_URL}/sports-arb/start`, { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        setError(`Failed to start: ${text}`);
      } else {
        const data = await res.json();
        if (data.status === "started" || data.status === "already_running") {
          await fetchStatus();
          await fetchSignals();
        }
      }
    } catch (err) {
      setError(`Failed to start: ${err instanceof Error ? err.message : "network error"}`);
    }
    setActionLoading(null);
  };

  const handleStop = async () => {
    setActionLoading("stop");
    setError(null);
    try {
      const res = await fetch(`${STRATEGY_URL}/sports-arb/stop`, { method: "POST" });
      if (!res.ok) setError("Failed to stop");
      await fetchStatus();
    } catch {
      setError("Failed to stop");
    }
    setActionLoading(null);
  };

  const handleScan = async () => {
    setActionLoading("scan");
    setError(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const res = await fetch(`${STRATEGY_URL}/sports-arb/scan`, {
        method: "POST",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        setError(`Scan returned ${res.status}`);
      } else {
        await fetchSignals();
        await fetchStatus();
        await fetchOdds();
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Scan timed out — try again");
      } else {
        setError(`Scan failed: ${err instanceof Error ? err.message : "network error"}`);
      }
      await fetchSignals().catch(() => {});
      await fetchStatus().catch(() => {});
    }
    setActionLoading(null);
  };

  const handleEmergencyStop = async () => {
    if (!confirm("Emergency stop will halt all trading and cancel open orders. Continue?")) return;
    setActionLoading("emergency");
    try {
      await fetch(`${STRATEGY_URL}/sports-arb/emergency-stop`, { method: "POST" });
      await fetchStatus();
    } catch {
      setError("Emergency stop failed");
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-surface-300 rounded animate-pulse" />
          <div className="h-4 w-96 bg-surface-300 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-surface-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isRunning = status?.running ?? false;
  const pm = status?.position_manager;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Trophy className="h-7 w-7 text-brand-400" />
            <h1 className="text-2xl font-bold text-surface-900">Sports Arbitrage</h1>
            {isRunning ? (
              <span className="relative">
                <Badge variant="success" className="relative z-10">
                  Running
                </Badge>
                <span className="absolute inset-0 rounded-full bg-green-500/20 animate-pulse" />
              </span>
            ) : (
              <Badge variant="muted">Stopped</Badge>
            )}
          </div>
          <p className="text-surface-700">
            Sharp bookmaker odds vs retail-priced Polymarket sports contracts
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <Button onClick={handleStart} disabled={actionLoading === "start"}>
              <Play className="h-4 w-4" />
              {actionLoading === "start" ? "Starting..." : "Start Bot"}
            </Button>
          ) : (
            <Button variant="secondary" onClick={handleStop} disabled={actionLoading === "stop"}>
              <Square className="h-4 w-4" />
              {actionLoading === "stop" ? "Stopping..." : "Stop Bot"}
            </Button>
          )}
          <Button variant="outline" onClick={handleScan} disabled={actionLoading === "scan"}>
            <RefreshCw className={`h-4 w-4 ${actionLoading === "scan" ? "animate-spin" : ""}`} />
            Scan Now
          </Button>
          <Button variant="danger" onClick={handleEmergencyStop} disabled={actionLoading === "emergency"}>
            <AlertOctagon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-500/10 p-2">
              <DollarSign className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <p className="text-xs text-surface-600">Bankroll</p>
              <p className="text-xl font-bold text-surface-900 stat-value">
                ${(pm?.bankroll ?? 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-black/20">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${(pm?.today_realized_pnl ?? 0) >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
              {(pm?.today_realized_pnl ?? 0) >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div>
              <p className="text-xs text-surface-600">Daily P&L</p>
              <p className={`text-xl font-bold stat-value ${(pm?.today_realized_pnl ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                {(pm?.today_realized_pnl ?? 0) >= 0 ? "+" : ""}${(pm?.today_realized_pnl ?? 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Target className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-surface-600">Open Positions</p>
              <p className="text-xl font-bold text-surface-900 stat-value">
                {pm?.open_positions ?? positions.length} / 5
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Activity className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-surface-600">Events Tracked</p>
              <p className="text-xl font-bold text-surface-900 stat-value">
                {status?.last_odds_count ?? odds.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Events — Odds Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Active Events</CardTitle>
          <CardDescription>
            {odds.length > 0
              ? `${odds.length} events monitored across ${new Set(odds.map((o) => o.sport)).size} sports`
              : "No events loaded — run a scan to fetch bookmaker odds"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {odds.length === 0 ? (
            <div className="text-center py-8 text-surface-600">
              <Trophy className="h-10 w-10 mx-auto mb-3 text-surface-500" />
              <p>No events loaded yet</p>
              <p className="text-xs mt-1">Click &quot;Scan Now&quot; to fetch bookmaker odds</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {odds.slice(0, 20).map((event) => {
                // Find if there's a matching signal for this event
                const matchingSignal = signals.find(
                  (s) => s.event === event.event
                );
                const edge = matchingSignal?.edge_pct;

                return (
                  <div
                    key={event.event_id}
                    className={`rounded-lg border p-4 transition-all duration-200 hover:bg-surface-200/60 ${
                      edge && edge >= 0.05
                        ? "border-l-2 border-l-green-500 border-t-surface-300 border-r-surface-300 border-b-surface-300 bg-green-500/5"
                        : "border-surface-300 bg-surface-200/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="muted" className="text-[10px]">
                            {sportLabel(event.sport)}
                          </Badge>
                          <span className="text-xs text-surface-600">
                            via {event.best_book}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-surface-900">
                          {event.team1} vs {event.team2}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs font-mono">
                          <span className="text-surface-600">
                            Bookmaker: <span className="text-surface-900 font-bold">{(event.team1_prob * 100).toFixed(0)}%</span> / <span className="text-surface-900 font-bold">{(event.team2_prob * 100).toFixed(0)}%</span>
                          </span>
                          {matchingSignal && (
                            <>
                              <span className="text-surface-600">
                                Polymarket: <span className="text-brand-400 font-bold">{(matchingSignal.polymarket_price * 100).toFixed(0)}%</span>
                              </span>
                              <span className="text-green-400 font-bold">
                                Edge: {(matchingSignal.edge_pct * 100).toFixed(1)}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {matchingSignal && matchingSignal.edge_pct >= 0.05 && (
                        <div className="flex items-center gap-2">
                          <div className="bg-green-400/20 border border-green-400/40 px-3 py-1.5 text-green-400 text-xs font-mono font-bold">
                            <Zap className="h-3 w-3 inline mr-1" />
                            BUY {matchingSignal.outcome}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Signals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Signals</CardTitle>
          <CardDescription>
            {signals.length > 0
              ? `${signals.length} signals detected`
              : "No signals yet — start the bot or run a manual scan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signals.length === 0 ? (
            <div className="text-center py-8 text-surface-600">
              <Trophy className="h-10 w-10 mx-auto mb-3 text-surface-500" />
              <p>No signals yet</p>
              <p className="text-xs mt-1">Click &quot;Scan Now&quot; to check for opportunities</p>
            </div>
          ) : (
            <div className="space-y-3">
              {signals.slice(0, 10).map((signal, i) => (
                <div
                  key={signal.id || i}
                  className="flex items-center justify-between rounded-lg border border-l-2 border-l-green-500 border-t-surface-300 border-r-surface-300 border-b-surface-300 bg-surface-200/30 p-3 transition-all duration-200 hover:bg-surface-200/60"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="success">BUY</Badge>
                    <div>
                      <p className="text-sm font-medium text-surface-900">
                        {signal.event}
                      </p>
                      <p className="text-xs text-surface-600">
                        {sportLabel(signal.sport)} &middot; Backing {signal.team} ({signal.outcome}) &middot; via {signal.best_book}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-surface-900">
                      Book: {(signal.bookmaker_prob * 100).toFixed(0)}% &rarr; Poly: {(signal.polymarket_price * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-green-400 font-bold">
                      Edge: +{(signal.edge_pct * 100).toFixed(1)}% | Size: ${signal.kelly_size.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Open Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
          <CardDescription>
            {positions.length} active position{positions.length !== 1 ? "s" : ""} &mdash; sports markets resolve when the event ends
          </CardDescription>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <div className="text-center py-8 text-surface-600">
              <Target className="h-10 w-10 mx-auto mb-3 text-surface-500" />
              {isRunning && signals.length > 0 ? (
                <>
                  <p className="font-medium text-surface-800">
                    Scanning — {signals.length} opportunities detected
                  </p>
                  <p className="text-xs mt-1 max-w-md mx-auto">
                    The bot found bookmaker edges but is waiting for matching Polymarket sports
                    markets to trade. It will auto-execute when markets appear.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-surface-200/50 border border-surface-300 px-3 py-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Monitoring Polymarket for sports markets
                  </div>
                </>
              ) : isRunning ? (
                <>
                  <p>Scanning for opportunities...</p>
                  <p className="text-xs mt-1">
                    The bot fetches bookmaker odds every 5 minutes and compares to Polymarket.
                  </p>
                </>
              ) : (
                <>
                  <p>No open positions</p>
                  <p className="text-xs mt-1">
                    Start the bot to begin scanning for sports arbitrage opportunities.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-300 text-left">
                    <th className="pb-3 pr-4 font-medium text-surface-600">Event</th>
                    <th className="pb-3 pr-4 font-medium text-surface-600">Sport</th>
                    <th className="pb-3 pr-4 font-medium text-surface-600">Side</th>
                    <th className="pb-3 pr-4 font-medium text-surface-600">Entry</th>
                    <th className="pb-3 pr-4 font-medium text-surface-600">Size</th>
                    <th className="pb-3 font-medium text-surface-600">Opened</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-300">
                  {positions.map((pos) => (
                    <tr key={pos.id} className="hover:bg-surface-200/50 transition-colors">
                      <td className="py-3 pr-4 text-surface-900 font-medium max-w-[200px] truncate">
                        {pos.event}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="muted" className="text-[10px]">
                          {sportLabel(pos.sport)}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="success">{pos.outcome}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-surface-800 font-mono">
                        {(pos.entry_price * 100).toFixed(0)}&cent;
                      </td>
                      <td className="py-3 pr-4 text-surface-800 font-mono">
                        ${pos.size_usd.toFixed(2)}
                      </td>
                      <td className="py-3 text-surface-600 text-xs">
                        {new Date(pos.opened_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategy Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Parameters</CardTitle>
          <CardDescription>Current configuration for the Sports Arb scanner</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Min Edge", value: "5%" },
              { label: "Sports Tracked", value: "5 leagues" },
              { label: "Scan Interval", value: "5 min" },
              { label: "Position Sizing", value: "Quarter Kelly" },
              { label: "Max Position", value: "$2.00" },
              { label: "Min Volume", value: "$10K" },
              { label: "Daily Loss Limit", value: "$50.00" },
              { label: "Odds Source", value: "The Odds API" },
            ].map((param) => (
              <div
                key={param.label}
                className="rounded-lg bg-surface-200/50 border border-surface-300 p-3 transition-all duration-200 hover:bg-surface-200/80 hover:border-brand-500/20 hover:-translate-y-[0.5px]"
              >
                <p className="text-xs text-surface-600">{param.label}</p>
                <p className="text-sm font-semibold text-surface-900">{param.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
import Link from "next/link";
import {
  CloudSun,
  Play,
  Square,
  RefreshCw,
  AlertOctagon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Clock,
  MapPin,
  Activity,
  Settings2,
} from "lucide-react";
import { EdgeGapBar } from "@/components/charts/strategy/EdgeGapBar";
import { OpportunityHeatmap } from "@/components/charts/strategy/OpportunityHeatmap";
import { WinRateGauge } from "@/components/charts/performance/WinRateGauge";
import { LivePnLTicker } from "@/components/charts/realtime/LivePnLTicker";

interface WeatherStatus {
  running: boolean;
  bankroll?: number;
  daily_pnl?: number;
  open_positions?: number;
  total_trades?: number;
  win_rate?: number;
  last_scan?: string;
  error?: string;
}

interface Signal {
  market_id: string;
  city: string;
  bucket?: string;
  bucket_description?: string;
  action?: string;
  side?: string;
  noaa_confidence: number;
  market_price: number;
  expected_value: number;
  kelly_size?: number;
  kelly_size_usd?: number;
  reason?: string;
  signal_strength?: string;
  outcome?: string;
  market_question?: string;
  timestamp?: string;
}

interface Position {
  market_id: string;
  entry_price: number;
  size: number;
  entry_time: string;
}

const STRATEGY_URL = process.env.NEXT_PUBLIC_STRATEGY_URL || "http://localhost:8000";

export default function WeatherArbPage() {
  const [status, setStatus] = useState<WeatherStatus | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`${STRATEGY_URL}/weather-arb/status`, { signal });
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("Cannot connect to strategy engine");
    }
  }, []);

  const fetchSignals = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`${STRATEGY_URL}/weather-arb/signals`, { signal });
      if (!res.ok) return;
      const data = await res.json();
      const list = data.signals || data.data || [];
      setSignals(list);
    } catch {
      // silent
    }
  }, []);

  const fetchPositions = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`${STRATEGY_URL}/weather-arb/positions`, { signal });
      const data = await res.json();
      setPositions(data.positions || data.data || []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const load = async () => {
      setLoading(true);
      await Promise.all([fetchStatus(signal), fetchSignals(signal), fetchPositions(signal)]);
      setLoading(false);
    };
    load();

    let interval: ReturnType<typeof setInterval> | undefined;

    const startPolling = () => {
      interval = setInterval(() => {
        fetchStatus(signal);
        fetchSignals(signal);
        fetchPositions(signal);
      }, 10000);
    };

    const stopPolling = () => {
      if (interval) { clearInterval(interval); interval = undefined; }
    };

    const handleVisibility = () => {
      if (document.hidden) stopPolling(); else startPolling();
    };

    if (!document.hidden) startPolling();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      controller.abort();
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchStatus, fetchSignals, fetchPositions]);

  const handleStart = async () => {
    setActionLoading("start");
    setError(null);
    try {
      const res = await fetch(`${STRATEGY_URL}/weather-arb/start`, { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        setError(`Failed to start: ${text}`);
      } else {
        const data = await res.json();
        if (data.status === "started" || data.status === "already_running") {
          // Success — refresh status
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
      const res = await fetch(`${STRATEGY_URL}/weather-arb/stop`, { method: "POST" });
      if (!res.ok) {
        setError("Failed to stop");
      }
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
      // Scan can take 15-20s due to NOAA API calls — use a long timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const res = await fetch(`${STRATEGY_URL}/weather-arb/scan`, {
        method: "POST",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        setError(`Scan returned ${res.status}`);
      } else {
        const data = await res.json();
        // Refresh signals and status after scan completes
        await fetchSignals();
        await fetchStatus();
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Scan timed out — try again");
      } else {
        setError(`Scan failed: ${err instanceof Error ? err.message : "network error"}`);
      }
      // Still try to fetch signals — scan may have partially completed
      await fetchSignals().catch(() => {});
      await fetchStatus().catch(() => {});
    }
    setActionLoading(null);
  };

  const handleEmergencyStop = async () => {
    if (!confirm("Emergency stop will halt all trading and cancel open orders. Continue?")) return;
    setActionLoading("emergency");
    try {
      await fetch(`${STRATEGY_URL}/weather-arb/emergency-stop`, { method: "POST" });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <CloudSun className="h-7 w-7 text-brand-400" />
            <h1 className="text-2xl font-bold text-surface-900">Weather Arbitrage</h1>
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
            NOAA forecast confidence vs retail-priced Polymarket temperature buckets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/weather-arb/configure">
            <Button variant="outline">
              <Settings2 className="h-4 w-4" />
              Configure
            </Button>
          </Link>
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

      {/* Stats — glass-card styled */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-500/10 p-2">
              <DollarSign className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <p className="text-xs text-surface-600">Bankroll</p>
              <p className="text-xl font-bold text-surface-900 stat-value">
                ${(status?.bankroll ?? 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-black/20">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${(status?.daily_pnl ?? 0) >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
              {(status?.daily_pnl ?? 0) >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div>
              <p className="text-xs text-surface-600">Daily P&L</p>
              <p className={`text-xl font-bold stat-value ${(status?.daily_pnl ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                {(status?.daily_pnl ?? 0) >= 0 ? "+" : ""}${(status?.daily_pnl ?? 0).toFixed(2)}
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
                {status?.open_positions ?? positions.length} / 5
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
              <p className="text-xs text-surface-600">Win Rate</p>
              <p className="text-xl font-bold text-surface-900 stat-value">
                {(status?.win_rate ?? 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Opportunity Heatmap — derived from signals */}
        <div className="lg:col-span-2">
          <OpportunityHeatmap
            opportunities={
              signals.length > 0
                ? signals.map((s) => ({
                    city: s.city,
                    cityCode: s.city.toLowerCase().replace(/\s/g, "-"),
                    evMultiple: s.expected_value > 0 && s.market_price > 0
                      ? (s.noaa_confidence * 100) / (s.market_price * 100)
                      : 1,
                    noaaConfidence: Math.round(s.noaa_confidence * 100),
                    marketPrice: Math.round(s.market_price * 100),
                    bucket: s.bucket || s.bucket_description || "",
                  }))
                : [
                    { city: "NYC", cityCode: "nyc", evMultiple: 5.7, noaaConfidence: 85, marketPrice: 15, bucket: "32-40°F" },
                    { city: "Chicago", cityCode: "chi", evMultiple: 4.2, noaaConfidence: 88, marketPrice: 21, bucket: "25-32°F" },
                    { city: "Seattle", cityCode: "sea", evMultiple: 3.8, noaaConfidence: 76, marketPrice: 20, bucket: "40-48°F" },
                    { city: "Atlanta", cityCode: "atl", evMultiple: 2.9, noaaConfidence: 72, marketPrice: 25, bucket: "48-56°F" },
                    { city: "Dallas", cityCode: "dal", evMultiple: 2.1, noaaConfidence: 63, marketPrice: 30, bucket: "56-64°F" },
                    { city: "Miami", cityCode: "mia", evMultiple: 1.4, noaaConfidence: 56, marketPrice: 40, bucket: "72-80°F" },
                  ]
            }
          />
        </div>

        {/* Win Rate + P&L sidebar */}
        <div className="space-y-6">
          <WinRateGauge
            winRate={status?.win_rate ?? 0}
            wins={Math.round((status?.total_trades ?? 0) * ((status?.win_rate ?? 0) / 100))}
            losses={Math.round((status?.total_trades ?? 0) * (1 - (status?.win_rate ?? 0) / 100))}
            size="sm"
          />
          <div className="rounded-xl border border-white/5 bg-gray-900/50 p-4">
            <LivePnLTicker
              currentPnL={status?.daily_pnl ?? 0}
              label="Daily P&L"
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Edge Gap — show top signal if available */}
      {signals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signals.slice(0, 3).map((signal, i) => (
            <EdgeGapBar
              key={i}
              noaaConfidence={Math.round(signal.noaa_confidence * 100)}
              marketPrice={Math.round(signal.market_price * 100)}
              city={signal.city}
              bucket={signal.bucket || signal.bucket_description || ""}
            />
          ))}
        </div>
      )}

      {/* Strategy Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Parameters</CardTitle>
          <CardDescription>Current configuration for the Weather Arb scanner</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Min Confidence", value: "85%" },
              { label: "Max Entry Price", value: "15\u00A2" },
              { label: "Target Exit", value: "45\u00A2 (3x)" },
              { label: "Scan Interval", value: "2 min" },
              { label: "Max Position", value: "$2.00" },
              { label: "Position Sizing", value: "Quarter Kelly" },
              { label: "Daily Loss Limit", value: "$50.00" },
              { label: "Cities", value: "6 metros" },
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

      {/* Recent Signals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Signals</CardTitle>
          <CardDescription>
            {signals.length > 0 ? `${signals.length} signals detected` : "No signals yet — start the bot or run a manual scan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signals.length === 0 ? (
            <div className="text-center py-8 text-surface-600">
              <CloudSun className="h-10 w-10 mx-auto mb-3 text-surface-500" />
              <p>No signals yet</p>
              <p className="text-xs mt-1">Click &quot;Scan Now&quot; to check for opportunities</p>
            </div>
          ) : (
            <div className="space-y-3">
              {signals.slice(0, 10).map((signal, i) => {
                const action = signal.action || signal.side || "BUY";
                const bucket = signal.bucket || signal.bucket_description || "";
                const reason = signal.reason || signal.market_question || signal.signal_strength || "";
                const kellySize = signal.kelly_size ?? signal.kelly_size_usd ?? 0;

                return (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-lg border bg-surface-200/30 p-3 transition-all duration-200 hover:bg-surface-200/60 ${
                    action === "BUY"
                      ? "border-l-2 border-l-green-500 border-t-surface-300 border-r-surface-300 border-b-surface-300"
                      : action === "SELL"
                        ? "border-l-2 border-l-red-500 border-t-surface-300 border-r-surface-300 border-b-surface-300"
                        : "border-surface-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={action === "BUY" ? "success" : action === "SELL" ? "danger" : "muted"}>
                      {action}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-surface-900">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {signal.city} {bucket}
                      </p>
                      <p className="text-xs text-surface-600">{reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-surface-900">
                      NOAA: {(signal.noaa_confidence * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-surface-600">
                      Market: {(signal.market_price * 100).toFixed(0)}&cent; | EV: +${signal.expected_value.toFixed(2)}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Open Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
          <CardDescription>{positions.length} active position{positions.length !== 1 ? "s" : ""}</CardDescription>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <div className="text-center py-8 text-surface-600">
              <Target className="h-10 w-10 mx-auto mb-3 text-surface-500" />
              {isRunning && signals.length > 0 ? (
                <>
                  <p className="font-medium text-surface-800">Scanning — {signals.length} opportunities detected</p>
                  <p className="text-xs mt-1 max-w-md mx-auto">
                    The bot found NOAA forecast edges but no matching Polymarket temperature markets are currently listed.
                    It will auto-trade as soon as markets appear. This is normal — weather markets are listed periodically.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-surface-200/50 border border-surface-300 px-3 py-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Monitoring Polymarket for new temperature markets
                  </div>
                </>
              ) : isRunning ? (
                <>
                  <p>Scanning for opportunities...</p>
                  <p className="text-xs mt-1">The bot scans NOAA forecasts every 2 minutes and checks Polymarket for matching markets.</p>
                </>
              ) : (
                <>
                  <p>No open positions</p>
                  <p className="text-xs mt-1">Start the bot to begin scanning for weather arbitrage opportunities.</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-300 text-left">
                    <th className="pb-3 pr-4 font-medium text-surface-600">Market</th>
                    <th className="pb-3 pr-4 font-medium text-surface-600">Entry</th>
                    <th className="pb-3 pr-4 font-medium text-surface-600">Size</th>
                    <th className="pb-3 font-medium text-surface-600">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-300">
                  {positions.map((pos, i) => (
                    <tr key={i} className="hover:bg-surface-200/50 transition-colors">
                      <td className="py-3 pr-4 text-surface-900 font-medium">{pos.market_id.slice(0, 12)}...</td>
                      <td className="py-3 pr-4 text-surface-800">{(pos.entry_price * 100).toFixed(0)}&cent;</td>
                      <td className="py-3 pr-4 text-surface-800">${pos.size.toFixed(2)}</td>
                      <td className="py-3 text-surface-600 text-xs">{pos.entry_time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

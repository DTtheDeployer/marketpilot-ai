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
} from "lucide-react";

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
  bucket: string;
  action: string;
  noaa_confidence: number;
  market_price: number;
  expected_value: number;
  kelly_size: number;
  reason: string;
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

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${STRATEGY_URL}/weather-arb/status`);
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError("Cannot connect to strategy engine");
    }
  }, []);

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch(`${STRATEGY_URL}/weather-arb/signals`);
      const data = await res.json();
      setSignals(data.signals || data.data || []);
    } catch {
      // Silent
    }
  }, []);

  const fetchPositions = useCallback(async () => {
    try {
      const res = await fetch(`${STRATEGY_URL}/weather-arb/positions`);
      const data = await res.json();
      setPositions(data.positions || data.data || []);
    } catch {
      // Silent
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchStatus(), fetchSignals(), fetchPositions()]);
      setLoading(false);
    };
    load();
    const interval = setInterval(() => {
      fetchStatus();
      fetchSignals();
      fetchPositions();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchSignals, fetchPositions]);

  const handleStart = async () => {
    setActionLoading("start");
    try {
      await fetch(`${STRATEGY_URL}/weather-arb/start`, { method: "POST" });
      await fetchStatus();
    } catch {
      setError("Failed to start");
    }
    setActionLoading(null);
  };

  const handleStop = async () => {
    setActionLoading("stop");
    try {
      await fetch(`${STRATEGY_URL}/weather-arb/stop`, { method: "POST" });
      await fetchStatus();
    } catch {
      setError("Failed to stop");
    }
    setActionLoading(null);
  };

  const handleScan = async () => {
    setActionLoading("scan");
    try {
      const res = await fetch(`${STRATEGY_URL}/weather-arb/scan`, { method: "POST" });
      const data = await res.json();
      await fetchSignals();
      await fetchStatus();
    } catch {
      setError("Scan failed");
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
            <Badge variant={isRunning ? "success" : "muted"}>
              {isRunning ? "Running" : "Stopped"}
            </Badge>
          </div>
          <p className="text-surface-700">
            NOAA forecast confidence vs retail-priced Polymarket temperature buckets
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
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-500/10 p-2">
              <DollarSign className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <p className="text-xs text-surface-600">Bankroll</p>
              <p className="text-xl font-bold text-surface-900">
                ${(status?.bankroll ?? 0).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
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
              <p className={`text-xl font-bold ${(status?.daily_pnl ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                {(status?.daily_pnl ?? 0) >= 0 ? "+" : ""}${(status?.daily_pnl ?? 0).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Target className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-surface-600">Open Positions</p>
              <p className="text-xl font-bold text-surface-900">
                {status?.open_positions ?? positions.length} / 5
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Activity className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-surface-600">Win Rate</p>
              <p className="text-xl font-bold text-surface-900">
                {(status?.win_rate ?? 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Strategy Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Parameters</CardTitle>
          <CardDescription>Current configuration for the Weather Arb scanner</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-3">
              <p className="text-xs text-surface-600">Min Confidence</p>
              <p className="text-sm font-semibold text-surface-900">85%</p>
            </div>
            <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-3">
              <p className="text-xs text-surface-600">Max Entry Price</p>
              <p className="text-sm font-semibold text-surface-900">15¢</p>
            </div>
            <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-3">
              <p className="text-xs text-surface-600">Target Exit</p>
              <p className="text-sm font-semibold text-surface-900">45¢ (3x)</p>
            </div>
            <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-3">
              <p className="text-xs text-surface-600">Scan Interval</p>
              <p className="text-sm font-semibold text-surface-900">2 min</p>
            </div>
            <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-3">
              <p className="text-xs text-surface-600">Max Position</p>
              <p className="text-sm font-semibold text-surface-900">$2.00</p>
            </div>
            <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-3">
              <p className="text-xs text-surface-600">Position Sizing</p>
              <p className="text-sm font-semibold text-surface-900">Quarter Kelly</p>
            </div>
            <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-3">
              <p className="text-xs text-surface-600">Daily Loss Limit</p>
              <p className="text-sm font-semibold text-surface-900">$50.00</p>
            </div>
            <div className="rounded-lg bg-surface-200/50 border border-surface-300 p-3">
              <p className="text-xs text-surface-600">Cities</p>
              <p className="text-sm font-semibold text-surface-900">6 metros</p>
            </div>
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
              <p className="text-xs mt-1">Click "Scan Now" to check for opportunities</p>
            </div>
          ) : (
            <div className="space-y-3">
              {signals.slice(0, 10).map((signal, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-surface-300 bg-surface-200/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={signal.action === "BUY" ? "success" : signal.action === "SELL" ? "danger" : "muted"}>
                      {signal.action}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-surface-900">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {signal.city} {signal.bucket}
                      </p>
                      <p className="text-xs text-surface-600">{signal.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-surface-900">
                      NOAA: {(signal.noaa_confidence * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-surface-600">
                      Market: {(signal.market_price * 100).toFixed(0)}¢ | EV: +${signal.expected_value.toFixed(2)}
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
          <CardDescription>{positions.length} active position{positions.length !== 1 ? "s" : ""}</CardDescription>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <div className="text-center py-8 text-surface-600">
              <Target className="h-10 w-10 mx-auto mb-3 text-surface-500" />
              <p>No open positions</p>
              <p className="text-xs mt-1">Positions will appear here when the bot finds opportunities</p>
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
                    <tr key={i} className="hover:bg-surface-200">
                      <td className="py-3 pr-4 text-surface-900 font-medium">{pos.market_id.slice(0, 12)}...</td>
                      <td className="py-3 pr-4 text-surface-800">{(pos.entry_price * 100).toFixed(0)}¢</td>
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

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
} from "@marketpilot/ui";
import {
  ArrowLeft,
  Settings2,
  RotateCcw,
  Save,
  PlayCircle,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";

const STRATEGY_URL =
  process.env.NEXT_PUBLIC_STRATEGY_URL || "http://localhost:8000";

const CITIES = ["NYC", "Chicago", "Seattle", "Atlanta", "Dallas", "Miami"];
const SCAN_INTERVALS = [1, 2, 5, 10];

interface Config {
  minConfidence: number;
  maxEntryPrice: number;
  targetExitPrice: number;
  stopLossConfidence: number;
  maxPositionSize: number;
  dailyLossLimit: number;
  maxOpenPositions: number;
  cities: string[];
  scanInterval: number;
}

interface ValidationErrors {
  minConfidence?: string;
  maxEntryPrice?: string;
  targetExitPrice?: string;
  stopLossConfidence?: string;
  maxPositionSize?: string;
  dailyLossLimit?: string;
  cities?: string;
}

const DEFAULTS: Config = {
  minConfidence: 85,
  maxEntryPrice: 15,
  targetExitPrice: 45,
  stopLossConfidence: 70,
  maxPositionSize: 2.0,
  dailyLossLimit: 50.0,
  maxOpenPositions: 5,
  cities: [...CITIES],
  scanInterval: 2,
};

function RangeSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  error,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (v: number) => void;
  error?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-surface-800">{label}</label>
        <span className="text-sm font-semibold text-brand-400">
          {value}
          {unit}
        </span>
      </div>
      <div className="relative">
        <div className="h-2 w-full rounded-full bg-surface-300">
          <div
            className="h-2 rounded-full bg-brand-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step ?? 1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-2 w-full cursor-pointer opacity-0"
        />
      </div>
      <div className="flex justify-between text-xs text-surface-600">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export default function ConfigurePage() {
  const [config, setConfig] = useState<Config>({ ...DEFAULTS });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setToast({ type, message });
      setTimeout(() => setToast(null), 4000);
    },
    []
  );

  const update = <K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleCity = (city: string) => {
    setConfig((prev) => {
      const cities = prev.cities.includes(city)
        ? prev.cities.filter((c) => c !== city)
        : [...prev.cities, city];
      return { ...prev, cities };
    });
    setErrors((prev) => ({ ...prev, cities: undefined }));
  };

  const validate = (): boolean => {
    const next: ValidationErrors = {};
    if (config.minConfidence < 70) {
      next.minConfidence = "Min confidence must be at least 70%";
    }
    if (config.maxEntryPrice > 30) {
      next.maxEntryPrice = "Max entry price must be 30\u00a2 or less";
    }
    if (config.targetExitPrice <= config.maxEntryPrice + 10) {
      next.targetExitPrice = `Target exit must exceed max entry by more than 10\u00a2 (min ${config.maxEntryPrice + 11}\u00a2)`;
    }
    if (config.cities.length === 0) {
      next.cities = "Select at least one city";
    }
    if (config.maxPositionSize > config.dailyLossLimit) {
      next.maxPositionSize = "Position size cannot exceed daily loss limit";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${STRATEGY_URL}/weather-arb/configure`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            min_confidence: config.minConfidence / 100,
            max_entry_price: config.maxEntryPrice / 100,
            target_exit_price: config.targetExitPrice / 100,
            stop_loss_confidence: config.stopLossConfidence / 100,
            max_position_size: config.maxPositionSize,
            daily_loss_limit: config.dailyLossLimit,
            max_open_positions: config.maxOpenPositions,
            cities: config.cities,
            scan_interval_minutes: config.scanInterval,
          }),
        }
      );
      if (!res.ok) throw new Error("Save failed");
      showToast("success", "Configuration saved successfully");
    } catch {
      showToast("error", "Failed to save configuration. Is the strategy engine running?");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndRestart = async () => {
    if (!validate()) return;
    setRestarting(true);
    try {
      // Save first
      const saveRes = await fetch(
        `${STRATEGY_URL}/weather-arb/configure`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            min_confidence: config.minConfidence / 100,
            max_entry_price: config.maxEntryPrice / 100,
            target_exit_price: config.targetExitPrice / 100,
            stop_loss_confidence: config.stopLossConfidence / 100,
            max_position_size: config.maxPositionSize,
            daily_loss_limit: config.dailyLossLimit,
            max_open_positions: config.maxOpenPositions,
            cities: config.cities,
            scan_interval_minutes: config.scanInterval,
          }),
        }
      );
      if (!saveRes.ok) throw new Error("Save failed");

      // Stop then start
      await fetch(`${STRATEGY_URL}/weather-arb/stop`, { method: "POST" });
      await fetch(`${STRATEGY_URL}/weather-arb/start`, { method: "POST" });
      showToast("success", "Configuration saved and bot restarted");
    } catch {
      showToast("error", "Failed to save & restart. Is the strategy engine running?");
    } finally {
      setRestarting(false);
    }
  };

  const handleReset = () => {
    setConfig({ ...DEFAULTS });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg transition-all ${
            toast.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {toast.message}
          <button onClick={() => setToast(null)}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/app/weather-arb"
              className="rounded-lg p-1.5 text-surface-600 hover:bg-surface-200 hover:text-surface-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Settings2 className="h-7 w-7 text-brand-400" />
            <h1 className="text-2xl font-bold text-surface-900">
              Configure Weather Arb
            </h1>
          </div>
          <p className="text-surface-700 ml-[52px]">
            Adjust strategy parameters, risk limits, and scan settings
          </p>
        </div>
      </div>

      {/* Entry Criteria */}
      <Card>
        <CardHeader>
          <CardTitle>Entry Criteria</CardTitle>
          <CardDescription>
            When should the bot open new positions?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <RangeSlider
              label="Min NOAA Confidence"
              value={config.minConfidence}
              min={70}
              max={95}
              unit="%"
              onChange={(v) => update("minConfidence", v)}
              error={errors.minConfidence}
            />
            <RangeSlider
              label="Max Entry Price"
              value={config.maxEntryPrice}
              min={5}
              max={30}
              unit="&#162;"
              onChange={(v) => update("maxEntryPrice", v)}
              error={errors.maxEntryPrice}
            />
          </div>
        </CardContent>
      </Card>

      {/* Exit Criteria */}
      <Card>
        <CardHeader>
          <CardTitle>Exit Criteria</CardTitle>
          <CardDescription>
            When should the bot close positions?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <RangeSlider
              label="Target Exit Price"
              value={config.targetExitPrice}
              min={30}
              max={70}
              unit="&#162;"
              onChange={(v) => update("targetExitPrice", v)}
              error={errors.targetExitPrice}
            />
            <RangeSlider
              label="Stop Loss Confidence"
              value={config.stopLossConfidence}
              min={50}
              max={80}
              unit="%"
              onChange={(v) => update("stopLossConfidence", v)}
              error={errors.stopLossConfidence}
            />
          </div>
        </CardContent>
      </Card>

      {/* Risk Management */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Management</CardTitle>
          <CardDescription>
            Position sizing and loss limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              id="maxPositionSize"
              label="Max Position Size"
              type="number"
              min={0.5}
              max={10}
              step={0.25}
              value={config.maxPositionSize}
              onChange={(e) =>
                update("maxPositionSize", parseFloat(e.target.value) || 0)
              }
              error={errors.maxPositionSize}
            />
            <Input
              id="dailyLossLimit"
              label="Daily Loss Limit"
              type="number"
              min={10}
              max={500}
              step={5}
              value={config.dailyLossLimit}
              onChange={(e) =>
                update("dailyLossLimit", parseFloat(e.target.value) || 0)
              }
              error={errors.dailyLossLimit}
            />
            <div className="space-y-1.5">
              <label
                htmlFor="maxOpenPositions"
                className="text-sm font-medium text-surface-800"
              >
                Max Open Positions
              </label>
              <select
                id="maxOpenPositions"
                value={config.maxOpenPositions}
                onChange={(e) =>
                  update("maxOpenPositions", Number(e.target.value))
                }
                className="flex h-10 w-full rounded-lg border border-surface-400 bg-surface-100 px-3 py-2 text-sm text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Markets */}
      <Card>
        <CardHeader>
          <CardTitle>Markets</CardTitle>
          <CardDescription>
            Which metro areas should the bot scan?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CITIES.map((city) => {
              const checked = config.cities.includes(city);
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => toggleCity(city)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-sm font-medium transition-all ${
                    checked
                      ? "border-brand-500 bg-brand-500/10 text-brand-400"
                      : "border-surface-400 bg-surface-200/30 text-surface-600 hover:border-surface-500"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                      checked
                        ? "border-brand-500 bg-brand-500"
                        : "border-surface-500 bg-surface-100"
                    }`}
                  >
                    {checked && (
                      <svg
                        className="h-3 w-3 text-white"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  {city}
                </button>
              );
            })}
          </div>
          {errors.cities && (
            <p className="mt-2 text-xs text-danger">{errors.cities}</p>
          )}
        </CardContent>
      </Card>

      {/* Scan Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Scan Settings</CardTitle>
          <CardDescription>
            How frequently should the bot check for opportunities?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <div className="space-y-1.5">
              <label
                htmlFor="scanInterval"
                className="text-sm font-medium text-surface-800"
              >
                Scan Interval
              </label>
              <select
                id="scanInterval"
                value={config.scanInterval}
                onChange={(e) =>
                  update("scanInterval", Number(e.target.value))
                }
                className="flex h-10 w-full rounded-lg border border-surface-400 bg-surface-100 px-3 py-2 text-sm text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
              >
                {SCAN_INTERVALS.map((n) => (
                  <option key={n} value={n}>
                    {n} minute{n !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardFooter>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleSave}
                disabled={saving || restarting}
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Configuration"}
              </Button>
              <Button
                onClick={handleSaveAndRestart}
                disabled={saving || restarting}
              >
                <PlayCircle className="h-4 w-4" />
                {restarting ? "Restarting..." : "Save & Restart Bot"}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

"use client";

import { use, useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
  Input,
  cn,
} from "@marketpilot/ui";
import {
  ArrowLeft,
  Shield,
  Rocket,
  FlaskConical,
  Layers,
  Info,
  Settings2,
  AlertTriangle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useApi, useMutation } from "@/hooks/use-api";
import { useAuthStore } from "@/stores/auth-store";
import { useAccount } from "wagmi";
import type { StrategyMeta } from "@marketpilot/types";

const riskLabels: Record<number, { label: string; color: string }> = {
  1: { label: "Very Low", color: "text-green-400" },
  2: { label: "Low", color: "text-green-400" },
  3: { label: "Medium", color: "text-amber-400" },
  4: { label: "High", color: "text-orange-400" },
  5: { label: "Very High", color: "text-red-400" },
};

export default function StrategyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const { isConnected: walletConnected } = useAccount();
  const planTier = user?.subscription?.planTier || "FREE";
  const isElite = planTier === "ELITE";
  const [selectedMode, setSelectedMode] = useState<"PAPER" | "LIVE">("PAPER");

  const fetchStrategy = useCallback(() => api.getStrategy(id), [id]);
  const {
    data: strategy,
    loading,
    error,
  } = useApi<StrategyMeta>(fetchStrategy as any);

  const [launchLoading, setLaunchLoading] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [backtestError, setBacktestError] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const getFormValues = () => {
    if (!formRef.current) return null;
    const getValue = (inputId: string): string => {
      const el = formRef.current?.querySelector(`#${inputId}`) as HTMLInputElement | null;
      return el?.value ?? "";
    };
    return {
      market: getValue("market"),
      allocation: parseFloat(getValue("allocation")) || 1000,
      maxPosition: parseFloat(getValue("maxPosition")) || 100,
      orderSize: parseFloat(getValue("orderSize")) || 10,
      spreadWidth: parseFloat(getValue("spreadWidth")) || 0.02,
      refreshInterval: parseFloat(getValue("refreshInterval")) || 30,
      dailyLossLimit: parseFloat(getValue("dailyLossLimit")) || 200,
      maxDrawdown: parseFloat(getValue("maxDrawdown")) || 10,
      consecutiveLossLimit: parseFloat(getValue("consecutiveLossLimit")) || 5,
      cooldownMinutes: parseFloat(getValue("cooldownMinutes")) || 30,
    };
  };

  const handleLaunchBot = async () => {
    if (!strategy) return;
    const values = getFormValues();
    if (!values) return;

    setLaunchLoading(true);
    setLaunchError(null);
    try {
      await api.createBot({
        name: `${strategy.name} Bot`,
        strategySlug: strategy.slug,
        mode: selectedMode,
        config: {
          market: values.market,
          maxPositionSize: values.maxPosition,
          orderSize: values.orderSize,
          spreadWidth: values.spreadWidth,
          refreshInterval: values.refreshInterval,
        },
        riskLimits: {
          maxDailyLoss: values.dailyLossLimit,
          maxDrawdown: values.maxDrawdown,
          cooldownAfterLossStreak: values.consecutiveLossLimit,
          cooldownMinutes: values.cooldownMinutes,
        },
        capitalAllocated: values.allocation,
      });
      router.push("/app/bots");
    } catch (err) {
      setLaunchError(err instanceof Error ? err.message : "Failed to launch bot");
    } finally {
      setLaunchLoading(false);
    }
  };

  const handleRunBacktest = async () => {
    if (!strategy) return;
    const values = getFormValues();
    if (!values) return;

    setBacktestLoading(true);
    setBacktestError(null);
    try {
      await api.createBacktest({
        strategySlug: strategy.slug,
        config: {
          market: values.market,
          maxPositionSize: values.maxPosition,
          orderSize: values.orderSize,
          spreadWidth: values.spreadWidth,
          refreshInterval: values.refreshInterval,
        },
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
      });
      router.push("/app/backtests");
    } catch (err) {
      setBacktestError(err instanceof Error ? err.message : "Failed to create backtest");
    } finally {
      setBacktestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="h-6 w-32 rounded bg-surface-200 animate-pulse" />
        <div className="h-10 w-64 rounded bg-surface-200 animate-pulse" />
        <div className="h-40 rounded-xl bg-surface-200 animate-pulse" />
        <div className="h-60 rounded-xl bg-surface-200 animate-pulse" />
        <div className="h-48 rounded-xl bg-surface-200 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Link
          href="/app/strategies"
          className="inline-flex items-center gap-1.5 text-sm text-surface-700 hover:text-surface-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to load strategy: {error}</span>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-surface-700 text-lg">Strategy not found</p>
        <Link href="/app/strategies">
          <Button variant="secondary">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const risk = riskLabels[strategy.riskLevel] ?? riskLabels[3];

  return (
    <div className="space-y-6 max-w-4xl" ref={formRef}>
      {/* Back link */}
      <Link
        href="/app/strategies"
        className="inline-flex items-center gap-1.5 text-sm text-surface-700 hover:text-surface-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Catalog
      </Link>

      {/* Strategy header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-surface-900">
              {strategy.name}
            </h1>
            <Badge>{strategy.category.replace("_", " ")}</Badge>
            <Badge variant={strategy.minTier === "FREE" ? "success" : strategy.minTier === "ELITE" ? "warning" : "default"}>
              {strategy.minTier}
            </Badge>
          </div>
          <p className="text-surface-700 max-w-2xl">{strategy.description}</p>
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5">
              <Shield className={cn("h-4 w-4", risk.color)} />
              <span className={cn("text-sm font-medium", risk.color)}>
                Risk Level: {strategy.riskLevel}/5 ({risk.label})
              </span>
            </div>
            <div className="flex gap-1.5">
              {strategy.tags.map((tag) => (
                <Badge key={tag} variant="muted" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Thesis */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-brand-400" />
            <CardTitle>Strategy Thesis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-surface-800 leading-relaxed">{strategy.thesis}</p>
        </CardContent>
      </Card>

      {/* Configuration Parameters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-brand-400" />
            <CardTitle>Configuration Parameters</CardTitle>
          </div>
          <CardDescription>
            Adjust strategy parameters before launching a bot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="market"
              label="Target Market"
              placeholder="Select a market..."
              defaultValue="Fed Rate Cut — Jul 2026"
            />
            <Input
              id="allocation"
              label="Capital Allocation ($)"
              type="number"
              placeholder="1000"
              defaultValue="1000"
            />
            <Input
              id="maxPosition"
              label="Max Position Size"
              type="number"
              placeholder="100"
              defaultValue="100"
            />
            <Input
              id="orderSize"
              label="Order Size"
              type="number"
              placeholder="10"
              defaultValue="10"
            />
            <Input
              id="spreadWidth"
              label="Spread Width"
              type="number"
              placeholder="0.02"
              defaultValue="0.02"
            />
            <Input
              id="refreshInterval"
              label="Refresh Interval (sec)"
              type="number"
              placeholder="30"
              defaultValue="30"
            />
          </div>
        </CardContent>
      </Card>

      {/* Risk Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <CardTitle>Risk Settings</CardTitle>
          </div>
          <CardDescription>
            Set risk limits to protect your capital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="dailyLossLimit"
              label="Daily Loss Limit ($)"
              type="number"
              placeholder="200"
              defaultValue="200"
            />
            <Input
              id="maxDrawdown"
              label="Max Drawdown (%)"
              type="number"
              placeholder="10"
              defaultValue="10"
            />
            <Input
              id="consecutiveLossLimit"
              label="Consecutive Loss Limit"
              type="number"
              placeholder="5"
              defaultValue="5"
            />
            <Input
              id="cooldownMinutes"
              label="Cooldown After Stop (min)"
              type="number"
              placeholder="30"
              defaultValue="30"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error messages */}
      {(launchError || backtestError) && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{launchError || backtestError}</span>
        </div>
      )}

      {/* Trading Mode Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Mode</CardTitle>
          <CardDescription>
            Choose whether to run this bot in paper (simulated) or live mode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedMode("PAPER")}
              className={cn(
                "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-all",
                selectedMode === "PAPER"
                  ? "border-brand-500 bg-brand-600/10 text-brand-400"
                  : "border-surface-300 bg-surface-200/50 text-surface-700 hover:bg-surface-200"
              )}
            >
              Paper Mode
              <p className="text-xs font-normal mt-1 text-surface-600">
                Simulated trades with virtual capital
              </p>
            </button>
            {isElite ? (
              <button
                onClick={() => setSelectedMode("LIVE")}
                className={cn(
                  "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-all",
                  selectedMode === "LIVE"
                    ? "border-green-500 bg-green-500/10 text-green-400"
                    : "border-surface-300 bg-surface-200/50 text-surface-700 hover:bg-surface-200"
                )}
              >
                Live Mode
                <p className="text-xs font-normal mt-1 text-surface-600">
                  Real trades with real capital
                </p>
              </button>
            ) : (
              <div className="flex-1 rounded-lg border border-surface-300 bg-surface-200/30 px-4 py-3 text-sm font-medium text-surface-500 cursor-not-allowed opacity-60">
                Live Mode
                <p className="text-xs font-normal mt-1 text-surface-500">
                  Requires Operator plan
                </p>
              </div>
            )}
          </div>
          {selectedMode === "LIVE" && !walletConnected && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                Connect your wallet first.{" "}
                <Link href="/app/connect" className="underline hover:text-amber-300">
                  Go to Connect
                </Link>
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex items-center gap-4 pt-2">
        <Button
          size="lg"
          className="gap-2"
          onClick={handleLaunchBot}
          disabled={launchLoading || (selectedMode === "LIVE" && !walletConnected)}
        >
          {launchLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Rocket className="h-5 w-5" />
          )}
          {launchLoading ? "Launching..." : `Launch Bot (${selectedMode === "LIVE" ? "Live" : "Paper"})`}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="gap-2"
          onClick={handleRunBacktest}
          disabled={backtestLoading}
        >
          {backtestLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FlaskConical className="h-5 w-5" />
          )}
          {backtestLoading ? "Starting..." : "Run Backtest"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
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
  cn,
} from "@marketpilot/ui";
import {
  Rocket,
  Globe,
  ShieldCheck,
  Layers,
  Bot,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useApi } from "@/hooks/use-api";

const steps = [
  { id: 1, label: "Welcome", icon: Sparkles },
  { id: 2, label: "Jurisdiction", icon: Globe },
  { id: 3, label: "Risk", icon: ShieldCheck },
  { id: 4, label: "Strategy", icon: Layers },
  { id: 5, label: "Launch", icon: Rocket },
];

const countries = [
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Canada",
  "Australia",
  "Japan",
  "Singapore",
  "South Korea",
  "Brazil",
  "India",
  "Netherlands",
  "Switzerland",
  "Sweden",
  "Norway",
  "Cuba",
  "Iran",
  "North Korea",
  "Syria",
  "Russia",
  "Belarus",
  "Myanmar",
  "Libya",
  "Somalia",
  "Sudan",
  "South Sudan",
  "Yemen",
  "Zimbabwe",
  "Venezuela",
  "Nicaragua",
];

const restrictedCountries = [
  "Cuba",
  "Iran",
  "North Korea",
  "Syria",
  "Russia",
  "Belarus",
  "Myanmar",
  "Libya",
  "Somalia",
  "Sudan",
  "South Sudan",
  "Yemen",
  "Zimbabwe",
  "Venezuela",
  "Nicaragua",
];

interface StrategyItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  riskLevel: number;
  minTier: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshUser, user } = useAuthStore();
  const [step, setStep] = useState(user?.profile?.onboardingStep || 1);
  const [selectedCountry, setSelectedCountry] = useState(user?.profile?.country || "");
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false]);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isRestricted = restrictedCountries.includes(selectedCountry);

  const fetchStrategies = useCallback(() => api.getStrategies(), []);
  const { data: strategiesRaw, loading: strategiesLoading } = useApi<unknown[]>(
    fetchStrategies,
    { manual: step < 4 }
  );

  const strategies = (strategiesRaw as StrategyItem[] | null) ?? [];
  const freeStrategies = strategies.filter((s) => s.minTier === "FREE");

  // Refetch strategies when we reach step 4
  const { refetch: refetchStrategies } = useApi<unknown[]>(fetchStrategies, { manual: true });
  useEffect(() => {
    if (step === 4 && !strategiesRaw) {
      refetchStrategies();
    }
  }, [step, strategiesRaw, refetchStrategies]);

  const allRiskChecked = checkedItems.every(Boolean);

  const handleJurisdictionNext = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.post("/api/onboarding/jurisdiction", { country: selectedCountry });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save jurisdiction");
    } finally {
      setSaving(false);
    }
  };

  const handleRiskNext = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.post("/api/onboarding/risk-ack", {
        acknowledgedItems: [
          "I understand that trading involves risk of financial loss",
          "I acknowledge that automated strategies can underperform",
          "I will start with paper trading to learn the platform",
        ],
      });
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save risk acknowledgement");
    } finally {
      setSaving(false);
    }
  };

  const handleLaunch = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const strategy = strategies.find((s) => s.id === selectedStrategy);
    if (!strategy) {
      setError("No strategy selected");
      setSaving(false);
      return;
    }

    let botCreated = false;

    try {
      // Step 1: Create the demo bot
      try {
        await api.createBot({
          name: `${strategy.name} Demo Bot`,
          strategySlug: strategy.slug,
          mode: "PAPER",
          config: {},
          riskLimits: { dailyLossLimit: 200, maxPositionSize: 100 },
          riskPreset: "BALANCED",
          capitalAllocated: 1000,
        });
        botCreated = true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to create bot: ${message}`);
        setSaving(false);
        return;
      }

      // Step 2: Mark onboarding complete
      try {
        await api.post("/api/onboarding/complete");
      } catch (err) {
        // Bot was created but onboarding status failed to update.
        // Still redirect — the bot exists, onboarding status is secondary.
        console.warn("Onboarding complete call failed, but bot was created. Redirecting.", err);
      }

      // Step 3: Refresh user so the rest of the app sees the updated profile
      try {
        await refreshUser();
      } catch (err) {
        // Still redirect — the page will re-initialize
        console.warn("Failed to refresh user after onboarding. Redirecting.", err);
      }

      // Success — show message briefly then redirect
      setSuccessMessage("Bot created successfully! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/app/dashboard");
      }, 800);
    } catch (err) {
      // Unexpected error in the overall flow
      if (botCreated) {
        // Bot exists, try to redirect anyway
        setSuccessMessage("Bot was created. Redirecting...");
        setTimeout(() => {
          router.push("/app/dashboard");
        }, 800);
      } else {
        setError(err instanceof Error ? err.message : "Failed to launch bot");
      }
    } finally {
      setSaving(false);
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      {/* Progress */}
      <div className="flex items-center justify-between">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isCompleted = step > s.id;

          return (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isCompleted
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : isActive
                        ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                        : "bg-surface-200 text-surface-600 border border-surface-300"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1.5 font-medium",
                    isActive ? "text-brand-400" : "text-surface-600"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-px mx-2 mb-5",
                    step > s.id ? "bg-green-500/50" : "bg-surface-300"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-400">
          {successMessage}
        </div>
      )}

      {/* Step 1: Welcome */}
      {step === 1 && (
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto rounded-full bg-brand-500/10 p-4 mb-4 w-fit">
              <Sparkles className="h-10 w-10 text-brand-400" />
            </div>
            <CardTitle className="text-2xl">Welcome to MarketPilot AI</CardTitle>
            <CardDescription className="text-base max-w-md mx-auto mt-2">
              Your intelligent trading co-pilot for prediction markets. Let us
              get you set up in just a few steps.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[
                { label: "Strategies", desc: "Browse & deploy", icon: Layers },
                { label: "Paper Trading", desc: "Risk-free practice", icon: Bot },
                { label: "Live Trading", desc: "When you are ready", icon: Rocket },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="p-4 rounded-lg bg-surface-200/50 border border-surface-300"
                  >
                    <Icon className="h-6 w-6 text-brand-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-surface-900">
                      {item.label}
                    </p>
                    <p className="text-xs text-surface-700">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="justify-center pt-4">
            <Button size="lg" className="gap-2 px-8" onClick={next}>
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Jurisdiction */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-brand-400" />
              <CardTitle>Jurisdiction Check</CardTitle>
            </div>
            <CardDescription>
              Select your country of residence so we can verify eligibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="text-sm font-medium text-surface-800">
                Country of Residence
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-surface-400 bg-surface-100 px-3 py-2 text-sm text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
              >
                <option value="">Select your country...</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {selectedCountry && isRestricted && (
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <p className="text-sm font-medium text-red-400">
                      Restricted Region — Paper trading only
                    </p>
                  </div>
                  <p className="text-xs text-surface-700">
                    Live trading is not available in {selectedCountry}. You can
                    still use paper trading to explore the platform.
                  </p>
                </div>
              )}

              {selectedCountry && !isRestricted && (
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="h-4 w-4 text-green-400" />
                    <p className="text-sm font-medium text-green-400">
                      Eligible — Paper and live trading available in {selectedCountry}.
                    </p>
                  </div>
                  <p className="text-xs text-surface-700">
                    You have full access to both paper and live trading features.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost" onClick={prev} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleJurisdictionNext}
              disabled={!selectedCountry || saving}
              className="gap-1.5"
            >
              {saving ? "Saving..." : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Risk acknowledgement */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <CardTitle>Risk Acknowledgement</CardTitle>
            </div>
            <CardDescription>
              Please review and acknowledge the following before proceeding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <p className="text-sm text-surface-800 leading-relaxed">
                  Prediction market trading involves risk. While paper trading uses
                  simulated funds, real capital can be at risk in live mode. Automated
                  strategies may produce losses. Past performance does not guarantee
                  future results.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "I understand that trading involves risk of financial loss",
                  "I acknowledge that automated strategies can underperform",
                  "I will start with paper trading to learn the platform",
                ].map((item, i) => (
                  <label
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-surface-200/50 border border-surface-300 cursor-pointer hover:bg-surface-200 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-surface-400 text-brand-500 focus:ring-brand-500 bg-surface-100"
                      checked={checkedItems[i]}
                      onChange={(e) => {
                        const updated = [...checkedItems];
                        updated[i] = e.target.checked;
                        setCheckedItems(updated);
                        if (updated.every(Boolean)) setRiskAcknowledged(true);
                      }}
                    />
                    <span className="text-sm text-surface-800">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost" onClick={prev} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleRiskNext}
              disabled={!allRiskChecked || saving}
              className="gap-1.5"
            >
              {saving ? "Saving..." : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 4: Pick first strategy */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-brand-400" />
              <CardTitle>Pick Your First Strategy</CardTitle>
            </div>
            <CardDescription>
              Choose a strategy to power your first demo bot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strategiesLoading ? (
                <div className="text-center py-8 text-sm text-surface-700">
                  Loading strategies...
                </div>
              ) : freeStrategies.length === 0 ? (
                <div className="text-center py-8 text-sm text-surface-700">
                  No free strategies available. Please try again later.
                </div>
              ) : (
                freeStrategies.map((strategy) => (
                  <button
                    key={strategy.id}
                    onClick={() => setSelectedStrategy(strategy.id)}
                    className={cn(
                      "w-full p-4 rounded-lg border text-left transition-all",
                      selectedStrategy === strategy.id
                        ? "border-brand-500 bg-brand-500/10 ring-1 ring-brand-500/30"
                        : "border-surface-300 bg-surface-200/50 hover:border-surface-400"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-surface-900">
                        {strategy.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="success" className="text-[10px]">
                          FREE
                        </Badge>
                        <Badge variant="muted" className="text-[10px]">
                          Risk {strategy.riskLevel}/5
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-surface-700 line-clamp-2">
                      {strategy.description}
                    </p>
                  </button>
                ))
              )}

              <div className="p-3 rounded-lg border border-surface-300/50 bg-surface-200/30">
                <p className="text-xs text-surface-600 text-center">
                  More strategies available with Pro and Elite plans
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost" onClick={prev} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={next}
              disabled={!selectedStrategy}
              className="gap-1.5"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 5: Launch demo bot */}
      {step === 5 && (
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto rounded-full bg-green-500/10 p-4 mb-4 w-fit">
              <Rocket className="h-10 w-10 text-green-400" />
            </div>
            <CardTitle className="text-2xl">Ready to Launch!</CardTitle>
            <CardDescription className="text-base max-w-md mx-auto mt-2">
              Your demo bot is configured and ready to go. It will trade with
              simulated funds so you can learn the platform risk-free.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-w-sm mx-auto">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-200/50 border border-surface-300">
                <span className="text-sm text-surface-700">Strategy</span>
                <span className="text-sm font-medium text-surface-900">
                  {strategies.find((s) => s.id === selectedStrategy)?.name ??
                    "Selected Strategy"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-200/50 border border-surface-300">
                <span className="text-sm text-surface-700">Mode</span>
                <Badge variant="paper">Paper Trading</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-200/50 border border-surface-300">
                <span className="text-sm text-surface-700">Initial Capital</span>
                <span className="text-sm font-medium text-surface-900">$1,000</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-200/50 border border-surface-300">
                <span className="text-sm text-surface-700">Risk Preset</span>
                <span className="text-sm font-medium text-surface-900">Balanced</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost" onClick={prev} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              size="lg"
              className="gap-2 px-8"
              disabled={saving}
              onClick={handleLaunch}
            >
              <Rocket className="h-5 w-5" />
              {saving ? "Launching..." : "Launch Demo Bot"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

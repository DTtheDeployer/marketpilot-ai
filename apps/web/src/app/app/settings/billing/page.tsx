"use client";

import { useState, useCallback } from "react";
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
import { CreditCard, Zap, Check, ArrowRight, BarChart3, Bot, FlaskConical } from "lucide-react";
import { api } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";

interface Subscription {
  planTier: string;
  planName: string;
  status: string;
  priceMonthly: number;
  currentPeriodEnd: string;
  limits?: {
    maxBots: number;
    maxStrategies: number;
    maxBacktests: number;
  };
  usage?: {
    activeBots: number;
    activeStrategies: number;
    backtestsThisMonth: number;
  };
}

interface Plan {
  tier: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits: Record<string, unknown>;
}

export default function BillingPage() {
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const fetchSubscription = useCallback(() => api.getSubscription(), []);
  const fetchPlans = useCallback(() => api.getPlans(), []);

  const { data: subscription, loading: subLoading } = useApi<Subscription>(fetchSubscription as any);
  const { data: plansRaw, loading: plansLoading } = useApi<Plan[]>(fetchPlans as any);

  const plans = (plansRaw ?? []) as Plan[];
  const currentTier = subscription?.planTier ?? "FREE";
  const currentPrice = subscription?.priceMonthly ?? 0;

  const usageStats = [
    {
      label: "Active Bots",
      used: subscription?.usage?.activeBots ?? 0,
      max: subscription?.limits?.maxBots ?? 1,
      icon: Bot,
    },
    {
      label: "Strategies",
      used: subscription?.usage?.activeStrategies ?? 0,
      max: subscription?.limits?.maxStrategies ?? 1,
      icon: Zap,
    },
    {
      label: "Backtests This Month",
      used: subscription?.usage?.backtestsThisMonth ?? 0,
      max: subscription?.limits?.maxBacktests ?? 5,
      icon: FlaskConical,
    },
  ];

  const handleUpgrade = async (tier: string) => {
    setCheckoutLoading(tier);
    try {
      const res = await api.createCheckout(tier, "monthly");
      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      }
    } catch (err) {
      // Could show error toast here
      console.error("Checkout error:", err);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const res = await api.createBillingPortal();
      if (res.data.portalUrl) {
        window.location.href = res.data.portalUrl;
      }
    } catch (err) {
      console.error("Billing portal error:", err);
    }
  };

  const nextBillingDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  if (subLoading || plansLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Billing</h1>
          <p className="text-sm text-surface-700 mt-1">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Billing</h1>
        <p className="text-sm text-surface-700 mt-1">
          Manage your subscription and review usage
        </p>
      </div>

      {/* Current plan */}
      <Card className="border-brand-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-400" />
              <CardTitle>Current Plan</CardTitle>
            </div>
            <Badge variant="default" className="text-sm px-3 py-1">
              {subscription?.planName ?? "Explorer"} ({currentTier})
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-4xl font-bold text-surface-900">${currentPrice}</span>
            <span className="text-surface-700">/month</span>
          </div>
          <p className="text-sm text-surface-700 mb-4">
            {subscription?.status === "ACTIVE" && nextBillingDate
              ? <>Your next billing date is <span className="text-surface-900 font-medium">{nextBillingDate}</span>.</>
              : currentTier === "FREE"
                ? "You are on the free plan. Upgrade to unlock more features."
                : `Subscription status: ${subscription?.status ?? "Unknown"}`}
          </p>
          {currentTier !== "FREE" && (
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={handleManageBilling}>
                Manage Payment Method
              </Button>
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                Cancel Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand-400" />
            <CardTitle>Usage This Period</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {usageStats.map((stat) => {
              const max = stat.max === -1 ? Infinity : stat.max;
              const percent = max === Infinity ? 0 : (stat.used / max) * 100;
              const Icon = stat.icon;
              return (
                <div key={stat.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-surface-700" />
                      <span className="text-sm font-medium text-surface-900">
                        {stat.label}
                      </span>
                    </div>
                    <span className="text-sm text-surface-700">
                      {stat.used} / {stat.max === -1 ? "Unlimited" : stat.max}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-300 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        percent > 80
                          ? "bg-amber-500"
                          : "bg-brand-500"
                      )}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade options */}
      <div>
        <h2 className="text-lg font-semibold text-surface-900 mb-4">
          Available Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.tier === currentTier;
            const isUpgrade = plan.priceMonthly > currentPrice;
            const isDowngrade = plan.priceMonthly < currentPrice;

            return (
              <Card
                key={plan.tier}
                className={cn(
                  "flex flex-col",
                  isCurrent && "border-brand-500/50 ring-1 ring-brand-500/20"
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    {isCurrent && (
                      <Badge variant="default" className="text-[10px]">Current</Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-3xl font-bold text-surface-900">
                      ${plan.priceMonthly}
                    </span>
                    <span className="text-surface-700">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-surface-800">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrent ? (
                    <Button variant="secondary" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : isUpgrade ? (
                    <Button
                      className="w-full gap-2"
                      disabled={checkoutLoading === plan.tier}
                      onClick={() => handleUpgrade(plan.tier)}
                    >
                      {checkoutLoading === plan.tier ? "Redirecting..." : "Upgrade"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleUpgrade(plan.tier)}
                      disabled={checkoutLoading === plan.tier}
                    >
                      {checkoutLoading === plan.tier ? "Redirecting..." : "Downgrade"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

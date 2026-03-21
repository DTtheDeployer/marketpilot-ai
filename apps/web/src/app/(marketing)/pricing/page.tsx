"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  cn,
} from "@marketpilot/ui";
import { Check, ArrowRight, AlertTriangle } from "lucide-react";
import { demoPlans } from "@/lib/demo-data";

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Badge variant="default" className="mb-6">
            Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-900">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-6 text-lg text-surface-700 max-w-2xl mx-auto">
            Start for free with paper trading. Upgrade when you need advanced
            analytics or live execution capabilities.
          </p>

          {/* ── Toggle ─────────────────────────────────────────────────── */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <span
              className={cn(
                "text-sm font-medium",
                !annual ? "text-surface-900" : "text-surface-600"
              )}
            >
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              onClick={() => setAnnual(!annual)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                annual ? "bg-brand-600" : "bg-surface-400"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
                  annual ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <span
              className={cn(
                "text-sm font-medium",
                annual ? "text-surface-900" : "text-surface-600"
              )}
            >
              Yearly
            </span>
            {annual && (
              <Badge variant="success" className="ml-2 text-[10px]">
                Save 20%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* ── Plans ─────────────────────────────────────────────────────── */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {demoPlans.map((plan) => {
              const isPopular = plan.tier === "PRO";
              const price = annual ? plan.priceYearly / 12 : plan.priceMonthly;
              const rawYearly = plan.priceYearly;

              return (
                <Card
                  key={plan.tier}
                  className={cn(
                    "flex flex-col relative",
                    isPopular && "border-brand-500 ring-1 ring-brand-500/20"
                  )}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="default">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base text-surface-600 font-medium">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-surface-900">
                        ${Math.round(price)}
                      </span>
                      {plan.priceMonthly > 0 && (
                        <span className="text-surface-600 text-sm ml-1">
                          /month
                        </span>
                      )}
                    </div>
                    {annual && plan.priceYearly > 0 && (
                      <p className="text-xs text-surface-600 mt-1">
                        ${rawYearly} billed annually
                      </p>
                    )}
                    <CardDescription className="mt-3">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
                          <span className="text-sm text-surface-700">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/signup" className="mt-8 block">
                      <Button
                        variant={isPopular ? "default" : "outline"}
                        className="w-full"
                        size="lg"
                      >
                        {plan.priceMonthly === 0
                          ? "Get Started Free"
                          : "Start Free Trial"}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ-like Section ──────────────────────────────────────────── */}
      <section className="border-t border-surface-300 py-20 bg-surface-50">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-surface-900 text-center mb-12">
            Common Questions About Pricing
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-surface-900">
                Can I try everything before paying?
              </h3>
              <p className="mt-2 text-sm text-surface-700">
                Yes. The Explorer plan is completely free and includes paper
                trading with one active strategy. You can simulate indefinitely
                before deciding to upgrade.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">
                Does MarketPilot take a fee on my trades?
              </h3>
              <p className="mt-2 text-sm text-surface-700">
                No. MarketPilot charges a flat subscription fee. We do not take
                a percentage of your profits or add markups to trades. Standard
                prediction market platform fees still apply.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">
                Can I downgrade or cancel anytime?
              </h3>
              <p className="mt-2 text-sm text-surface-700">
                Yes. You can change plans or cancel at any time. If you cancel a
                paid plan, you retain access until the end of your billing
                period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ────────────────────────────────────────────────── */}
      <section className="border-t border-surface-300 py-8">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="flex items-start gap-3 text-surface-600">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Live trading is available only on the Operator plan and requires
              passing an eligibility check. Subscription fees are for platform
              access only and do not guarantee trading profits. All trading
              involves risk.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

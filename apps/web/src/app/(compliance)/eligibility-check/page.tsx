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
  Input,
  Badge,
} from "@marketpilot/ui";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

type Status = "idle" | "checking" | "eligible" | "restricted";

export default function EligibilityCheckPage() {
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("checking");
    // Simulate eligibility check
    setTimeout(() => {
      setStatus("eligible");
    }, 2000);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <ShieldCheck className="h-6 w-6 text-brand-400" />
        <h1 className="text-3xl font-bold text-surface-900">
          Eligibility Check
        </h1>
      </div>
      <p className="text-surface-700 mb-8">
        Live trading on MarketPilot requires a jurisdictional eligibility check.
        This process verifies that prediction market trading is permitted in your
        region.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Verify Your Eligibility</CardTitle>
            <CardDescription>
              Provide your country of residence to check if live trading is
              available in your jurisdiction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === "idle" || status === "checking" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="country"
                  label="Country of Residence"
                  placeholder="e.g., United States, United Kingdom"
                  required
                />
                <Input
                  id="state"
                  label="State / Province (if applicable)"
                  placeholder="e.g., California, Ontario"
                />
                <div>
                  <label className="flex items-start gap-2 text-sm text-surface-700">
                    <input
                      type="checkbox"
                      required
                      className="h-4 w-4 rounded border-surface-400 bg-surface-100 text-brand-600 focus:ring-brand-500 mt-0.5"
                    />
                    <span>
                      I confirm that the information I provide is accurate
                      and that I have read the{" "}
                      <Link
                        href="/risk-disclosure"
                        className="text-brand-400 hover:text-brand-500 underline"
                      >
                        Risk Disclosure
                      </Link>
                    </span>
                  </label>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={status === "checking"}
                >
                  {status === "checking" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Check Eligibility"
                  )}
                </Button>
              </form>
            ) : status === "eligible" ? (
              <div className="py-6 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900">
                  You Are Eligible
                </h3>
                <p className="mt-2 text-sm text-surface-700">
                  Your jurisdiction is eligible for live trading on MarketPilot.
                  You can enable live trading from your dashboard after
                  subscribing to the Operator plan.
                </p>
                <div className="mt-6">
                  <Link href="/pricing">
                    <Button size="lg">View Plans</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900">
                  Region Restricted
                </h3>
                <p className="mt-2 text-sm text-surface-700">
                  Live trading is not available in your jurisdiction. You can
                  still use paper trading and backtesting features.
                </p>
                <div className="mt-6">
                  <Link href="/restricted">
                    <Button variant="outline" size="lg">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-surface-300 bg-surface-100 p-6">
            <h3 className="font-semibold text-surface-900 mb-3">
              Why is this required?
            </h3>
            <p className="text-sm text-surface-700 leading-relaxed">
              Prediction market regulations differ by jurisdiction. Some regions
              restrict or prohibit participation in prediction markets.
              MarketPilot performs eligibility checks to ensure compliance with
              local regulations and to protect users from engaging in activities
              that may be restricted in their area.
            </p>
          </div>

          <div className="rounded-xl border border-surface-300 bg-surface-100 p-6">
            <h3 className="font-semibold text-surface-900 mb-3">
              What if I am not eligible?
            </h3>
            <ul className="text-sm text-surface-700 space-y-2">
              <li>
                You can still create an account and access educational content.
              </li>
              <li>
                Paper trading may be available depending on your specific
                jurisdiction.
              </li>
              <li>
                Eligibility is re-evaluated if regulations change.
              </li>
              <li>
                Contact support if you believe the determination is incorrect.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-surface-700 leading-relaxed">
                Providing false information about your jurisdiction may result
                in account termination. MarketPilot may use additional
                verification methods to confirm eligibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

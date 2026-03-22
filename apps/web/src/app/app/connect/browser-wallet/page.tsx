"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  cn,
} from "@marketpilot/ui";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Download,
  Globe,
  Coins,
  FileCheck,
  Rocket,
  ExternalLink,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const steps = [
  { id: 1, label: "Install MetaMask", icon: Download },
  { id: 2, label: "Polygon Network", icon: Globe },
  { id: 3, label: "Get USDC.e", icon: Coins },
  { id: 4, label: "Approve Contracts", icon: FileCheck },
  { id: 5, label: "Start Trading", icon: Rocket },
];

export default function BrowserWalletPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [approving, setApproving] = useState(false);

  const toggleCheck = (key: string) =>
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));

  const canContinue = (step: number) => {
    switch (step) {
      case 1:
        return checks["metamask-installed"];
      case 2:
        return checks["polygon-network"];
      case 3:
        return checks["has-usdc"];
      case 4:
        return checks["contracts-approved"];
      default:
        return true;
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Back link */}
      <Link
        href="/app/connect"
        className="inline-flex items-center gap-1.5 text-sm text-surface-600 hover:text-surface-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to connection options
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">
          Browser Wallet Setup
        </h1>
        <p className="text-surface-600 mt-1">
          Connect your MetaMask wallet for manual trade approval.
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 transition-colors",
                currentStep > step.id
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : currentStep === step.id
                    ? "bg-brand-600/20 text-brand-400 border border-brand-500/30"
                    : "bg-surface-200 text-surface-500 border border-surface-300"
              )}
            >
              {currentStep > step.id ? (
                <Check className="h-4 w-4" />
              ) : (
                step.id
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 rounded-full",
                  currentStep > step.id ? "bg-green-500/40" : "bg-surface-300"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex justify-between text-xs text-surface-500 -mt-2 px-1">
        {steps.map((step) => (
          <span
            key={step.id}
            className={cn(
              "text-center",
              currentStep === step.id && "text-brand-400 font-medium"
            )}
          >
            {step.label}
          </span>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          {/* Step 1: Install MetaMask */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20">
                  <span className="text-2xl font-bold text-orange-400">
                    M
                  </span>
                </div>
                <div>
                  <CardTitle>Install MetaMask</CardTitle>
                  <p className="text-sm text-surface-600 mt-1">
                    MetaMask is a browser extension that acts as your crypto
                    wallet.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-surface-200/50 border border-surface-300/50 p-4 space-y-3">
                <p className="text-sm text-surface-700">
                  If you don&apos;t have MetaMask, install it from{" "}
                  <a
                    href="https://metamask.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:underline inline-flex items-center gap-1"
                  >
                    metamask.io
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
                <p className="text-sm text-surface-600">
                  MetaMask is available for Chrome, Firefox, Brave, and Edge. It
                  takes about 1 minute to install and set up.
                </p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checks["metamask-installed"] || false}
                  onChange={() => toggleCheck("metamask-installed")}
                  className="h-5 w-5 rounded border-surface-400 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-sm text-surface-700 group-hover:text-surface-900 transition-colors">
                  I have MetaMask installed
                </span>
              </label>
            </div>
          )}

          {/* Step 2: Switch to Polygon Network */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20">
                  <Globe className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <CardTitle>Switch to Polygon Network</CardTitle>
                  <p className="text-sm text-surface-600 mt-1">
                    Polymarket runs on the Polygon blockchain.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-surface-200/50 border border-surface-300/50 p-4">
                <p className="text-sm font-medium text-surface-800 mb-3">
                  Instructions:
                </p>
                <ol className="space-y-3 text-sm text-surface-600">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600/10 text-brand-400 text-xs font-bold shrink-0">
                      1
                    </span>
                    Open MetaMask (click the fox icon in your browser toolbar)
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600/10 text-brand-400 text-xs font-bold shrink-0">
                      2
                    </span>
                    Click the network dropdown at the top of the window
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600/10 text-brand-400 text-xs font-bold shrink-0">
                      3
                    </span>
                    <span>
                      Select <strong>&quot;Polygon&quot;</strong> from the list
                    </span>
                  </li>
                </ol>
              </div>

              <div className="rounded-lg bg-surface-200/50 border border-surface-300/50 p-4">
                <p className="text-sm font-medium text-surface-800 mb-2">
                  Don&apos;t see Polygon? Add it manually:
                </p>
                <div className="space-y-1 text-sm text-surface-600 font-mono">
                  <p>
                    Network Name:{" "}
                    <span className="text-surface-800">Polygon</span>
                  </p>
                  <p>
                    Chain ID: <span className="text-surface-800">137</span>
                  </p>
                  <p>
                    RPC URL:{" "}
                    <span className="text-surface-800">
                      https://polygon-rpc.com
                    </span>
                  </p>
                  <p>
                    Currency Symbol:{" "}
                    <span className="text-surface-800">POL</span>
                  </p>
                  <p>
                    Block Explorer:{" "}
                    <span className="text-surface-800">
                      https://polygonscan.com
                    </span>
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checks["polygon-network"] || false}
                  onChange={() => toggleCheck("polygon-network")}
                  className="h-5 w-5 rounded border-surface-400 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-sm text-surface-700 group-hover:text-surface-900 transition-colors">
                  I&apos;m on Polygon network
                </span>
              </label>
            </div>
          )}

          {/* Step 3: Get USDC.e */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
                  <Coins className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <CardTitle>Get USDC.e</CardTitle>
                  <p className="text-sm text-surface-600 mt-1">
                    You need USDC.e (bridged USDC) on Polygon to trade.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-surface-200/50 border border-surface-300/50 p-4">
                <p className="text-sm font-medium text-surface-800 mb-3">
                  Instructions:
                </p>
                <ol className="space-y-3 text-sm text-surface-600">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600/10 text-brand-400 text-xs font-bold shrink-0">
                      1
                    </span>
                    Buy USDC on any exchange (Coinbase, Binance, Kraken)
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600/10 text-brand-400 text-xs font-bold shrink-0">
                      2
                    </span>
                    Send it to your Polygon wallet address (from MetaMask)
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600/10 text-brand-400 text-xs font-bold shrink-0">
                      3
                    </span>
                    <span>
                      If you receive USDC (not USDC.e), swap in MetaMask:{" "}
                      <strong>Swap &rarr; USDC to USDC.e</strong>
                    </span>
                  </li>
                </ol>
              </div>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-400 mb-1">
                      Important
                    </p>
                    <p className="text-amber-400/80">
                      MarketPilot uses USDC.e (bridged) on Polygon. Contract:{" "}
                      <code className="text-xs bg-amber-500/10 px-1 py-0.5 rounded">
                        0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
                      </code>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 rounded-lg bg-surface-200/50 border border-surface-300/50 p-3 text-center">
                  <p className="text-xs text-surface-500 mb-1">Minimum</p>
                  <p className="text-lg font-bold text-surface-900">$10</p>
                </div>
                <div className="flex-1 rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-center">
                  <p className="text-xs text-green-400 mb-1">Recommended</p>
                  <p className="text-lg font-bold text-green-400">$100</p>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checks["has-usdc"] || false}
                  onChange={() => toggleCheck("has-usdc")}
                  className="h-5 w-5 rounded border-surface-400 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-sm text-surface-700 group-hover:text-surface-900 transition-colors">
                  I have USDC.e in my wallet
                </span>
              </label>
            </div>
          )}

          {/* Step 4: Approve Contracts */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/20">
                  <FileCheck className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <CardTitle>Approve Contracts</CardTitle>
                  <p className="text-sm text-surface-600 mt-1">
                    Your wallet needs to approve Polymarket&apos;s exchange
                    contracts to trade. This is a one-time setup.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: "USDC.e spending",
                    target: "CTF Exchange",
                    desc: "Allows the exchange to spend USDC.e for buying shares",
                  },
                  {
                    label: "USDC.e spending",
                    target: "Neg Risk Exchange",
                    desc: "Allows the neg-risk exchange to spend USDC.e",
                  },
                  {
                    label: "CTF tokens",
                    target: "Exchange (for selling)",
                    desc: "Allows the exchange to transfer your outcome tokens",
                  },
                ].map((approval, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-surface-200/50 border border-surface-300/50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-surface-800">
                          {approval.label} &rarr; {approval.target}
                        </p>
                        <p className="text-xs text-surface-500 mt-0.5">
                          {approval.desc}
                        </p>
                      </div>
                      <Badge
                        variant="muted"
                        className="text-xs text-surface-500"
                      >
                        ~$0.01 gas
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-sm text-amber-400/80">
                    <p>
                      Each approval costs ~$0.01 in POL gas. You need a tiny
                      amount of POL for gas. Buy $0.50 worth.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  setApproving(true);
                  // Simulated approval flow
                  setTimeout(() => {
                    setApproving(false);
                    setChecks((prev) => ({
                      ...prev,
                      "contracts-approved": true,
                    }));
                  }, 2000);
                }}
                disabled={approving || checks["contracts-approved"]}
              >
                {approving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving Contracts...
                  </>
                ) : checks["contracts-approved"] ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Contracts Approved
                  </>
                ) : (
                  "Approve All Contracts"
                )}
              </Button>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checks["contracts-approved"] || false}
                  onChange={() => toggleCheck("contracts-approved")}
                  className="h-5 w-5 rounded border-surface-400 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-sm text-surface-700 group-hover:text-surface-900 transition-colors">
                  Contracts approved
                </span>
              </label>
            </div>
          )}

          {/* Step 5: Start Trading */}
          {currentStep === 5 && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border-2 border-green-500/30">
                  <Check className="h-10 w-10 text-green-400" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl">
                  You&apos;re Connected!
                </CardTitle>
                <p className="text-surface-600 mt-2">
                  Your bot can now submit trades to Polymarket.
                </p>
              </div>

              <div className="rounded-lg bg-surface-200/50 border border-surface-300/50 p-4">
                <p className="text-sm text-surface-600">
                  When the bot finds an opportunity, you&apos;ll see a MetaMask
                  popup to approve the trade. Simply review the details and click
                  &quot;Confirm&quot; to execute.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/app/weather-arb" className="flex-1">
                  <Button className="w-full" size="lg">
                    Go to Weather Arb
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/app/bots" className="flex-1">
                  <Button variant="outline" className="w-full" size="lg">
                    Manage Bots
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      {currentStep < 5 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
            disabled={!canContinue(currentStep)}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

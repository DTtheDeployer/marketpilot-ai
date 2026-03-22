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
  ClipboardList,
  Key,
  FileCheck,
  Rocket,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Server,
  RotateCcw,
  Wallet,
} from "lucide-react";

const steps = [
  { id: 1, label: "Prerequisites", icon: ClipboardList },
  { id: 2, label: "Export Key", icon: Key },
  { id: 3, label: "Enter Key", icon: Lock },
  { id: 4, label: "Approve Contracts", icon: FileCheck },
  { id: 5, label: "Verify & Launch", icon: Rocket },
];

export default function ApiKeyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [privateKey, setPrivateKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalProgress, setApprovalProgress] = useState<number>(0);

  const toggleCheck = (key: string) =>
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));

  const isValidKey =
    privateKey.startsWith("0x") && privateKey.length === 66;

  const canContinue = (step: number) => {
    switch (step) {
      case 1:
        return (
          checks["prereq-metamask"] &&
          checks["prereq-usdc"] &&
          checks["prereq-pol"]
        );
      case 2:
        return true;
      case 3:
        return saved;
      case 4:
        return checks["contracts-approved"];
      default:
        return true;
    }
  };

  const handleSaveKey = async () => {
    if (!isValidKey) return;
    setSaving(true);
    // Simulated API call
    await new Promise((r) => setTimeout(r, 1500));
    setSaving(false);
    setSaved(true);
  };

  const handleApproveAll = async () => {
    setApproving(true);
    setApprovalProgress(0);
    // Simulate 3 approvals
    await new Promise((r) => setTimeout(r, 1000));
    setApprovalProgress(1);
    await new Promise((r) => setTimeout(r, 1000));
    setApprovalProgress(2);
    await new Promise((r) => setTimeout(r, 1000));
    setApprovalProgress(3);
    setApproving(false);
    setChecks((prev) => ({ ...prev, "contracts-approved": true }));
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
          API Key Setup
        </h1>
        <p className="text-surface-600 mt-1">
          Set up fully automated 24/7 trading with your private key.
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
          {/* Step 1: Prerequisites */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <CardTitle>Prerequisites</CardTitle>
                <p className="text-sm text-surface-600 mt-1">
                  Make sure you have everything ready before continuing.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group rounded-lg bg-surface-200/50 border border-surface-300/50 p-4">
                  <input
                    type="checkbox"
                    checked={checks["prereq-metamask"] || false}
                    onChange={() => toggleCheck("prereq-metamask")}
                    className="h-5 w-5 rounded border-surface-400 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <div>
                    <p className="text-sm font-medium text-surface-800 group-hover:text-surface-900 transition-colors">
                      MetaMask installed with Polygon network
                    </p>
                    <p className="text-xs text-surface-500 mt-0.5">
                      Browser extension configured for Polygon (Chain ID 137)
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group rounded-lg bg-surface-200/50 border border-surface-300/50 p-4">
                  <input
                    type="checkbox"
                    checked={checks["prereq-usdc"] || false}
                    onChange={() => toggleCheck("prereq-usdc")}
                    className="h-5 w-5 rounded border-surface-400 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <div>
                    <p className="text-sm font-medium text-surface-800 group-hover:text-surface-900 transition-colors">
                      USDC.e in your wallet ($10+ recommended)
                    </p>
                    <p className="text-xs text-surface-500 mt-0.5">
                      Bridged USDC on Polygon for placing trades
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group rounded-lg bg-surface-200/50 border border-surface-300/50 p-4">
                  <input
                    type="checkbox"
                    checked={checks["prereq-pol"] || false}
                    onChange={() => toggleCheck("prereq-pol")}
                    className="h-5 w-5 rounded border-surface-400 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <div>
                    <p className="text-sm font-medium text-surface-800 group-hover:text-surface-900 transition-colors">
                      A small amount of POL for gas (~$0.50)
                    </p>
                    <p className="text-xs text-surface-500 mt-0.5">
                      Required for contract approvals and transactions
                    </p>
                  </div>
                </label>
              </div>

              <div className="rounded-lg bg-surface-200/50 border border-surface-300/50 p-4">
                <p className="text-sm text-surface-600">
                  Already done the{" "}
                  <Link
                    href="/app/connect/browser-wallet"
                    className="text-brand-400 hover:underline"
                  >
                    Browser Wallet setup
                  </Link>
                  ? Skip to Step 3.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setChecks((prev) => ({
                      ...prev,
                      "prereq-metamask": true,
                      "prereq-usdc": true,
                      "prereq-pol": true,
                    }));
                    setCurrentStep(3);
                  }}
                >
                  Skip to Step 3
                  <ArrowRight className="ml-1.5 h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Export Your Private Key */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20">
                  <Key className="h-8 w-8 text-amber-400" />
                </div>
                <div>
                  <CardTitle>Export Your Private Key</CardTitle>
                  <p className="text-sm text-surface-600 mt-1">
                    You&apos;ll need your wallet&apos;s private key for
                    automated signing.
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-400 mb-1">
                      Security Warning
                    </p>
                    <p className="text-amber-400/80">
                      Your private key gives full access to your wallet. Never
                      share it with anyone. MarketPilot encrypts and stores it
                      securely on our servers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step-by-step */}
              <div className="rounded-lg bg-surface-200/50 border border-surface-300/50 p-4">
                <p className="text-sm font-medium text-surface-800 mb-3">
                  Step-by-step instructions:
                </p>
                <ol className="space-y-4 text-sm text-surface-600">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600/10 text-brand-400 text-xs font-bold shrink-0">
                      1
                    </span>
                    <span>
                      Open MetaMask (click the fox icon in your browser toolbar)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600/10 text-brand-400 text-xs font-bold shrink-0">
                      2
                    </span>
                    <span>
                      Click the <strong>three dots</strong> (&#8942;) next to
                      your account name in the top-right
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600/10 text-brand-400 text-xs font-bold shrink-0">
                      3
                    </span>
                    <span>
                      Click <strong>&quot;Account details&quot;</strong>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600/10 text-brand-400 text-xs font-bold shrink-0">
                      4
                    </span>
                    <span>
                      Click <strong>&quot;Show private key&quot;</strong>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600/10 text-brand-400 text-xs font-bold shrink-0">
                      5
                    </span>
                    <span>Enter your MetaMask password when prompted</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600/10 text-brand-400 text-xs font-bold shrink-0">
                      6
                    </span>
                    <span>
                      Copy the key (it starts with{" "}
                      <code className="bg-surface-300/50 px-1 py-0.5 rounded text-xs">
                        0x
                      </code>
                      )
                    </span>
                  </li>
                </ol>
              </div>

              {/* Visual guide */}
              <div className="rounded-lg bg-surface-200/50 border border-surface-300/50 p-4">
                <p className="text-xs text-surface-500 mb-2 uppercase tracking-wide font-medium">
                  Where to find each button in MetaMask
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs text-surface-600">
                  <div className="rounded bg-surface-300/50 p-2">
                    <p className="font-medium text-surface-700">Top-right</p>
                    <p>Three dots menu (&#8942;)</p>
                  </div>
                  <div className="rounded bg-surface-300/50 p-2">
                    <p className="font-medium text-surface-700">In menu</p>
                    <p>&quot;Account details&quot;</p>
                  </div>
                  <div className="rounded bg-surface-300/50 p-2">
                    <p className="font-medium text-surface-700">In details</p>
                    <p>&quot;Show private key&quot;</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Enter Your Private Key */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-indigo-500/20 border border-brand-500/20">
                  <Lock className="h-8 w-8 text-brand-400" />
                </div>
                <div>
                  <CardTitle>Enter Your Private Key</CardTitle>
                  <p className="text-sm text-surface-600 mt-1">
                    Paste your Polygon wallet private key below.
                  </p>
                </div>
              </div>

              {/* Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-700">
                  Polygon Wallet Private Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={privateKey}
                    onChange={(e) => {
                      setPrivateKey(e.target.value);
                      setSaved(false);
                    }}
                    placeholder="0x..."
                    disabled={saved}
                    className={cn(
                      "w-full rounded-lg border bg-surface-100 px-4 py-3 pr-12 text-sm font-mono text-surface-900 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors",
                      saved
                        ? "border-green-500/30 bg-green-500/5"
                        : isValidKey || privateKey.length === 0
                          ? "border-surface-300"
                          : "border-red-500/30"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-700 transition-colors"
                  >
                    {showKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {privateKey.length > 0 && !isValidKey && (
                  <p className="text-xs text-red-400">
                    Private key must start with 0x and be 66 characters long.
                  </p>
                )}
                {saved && (
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Key verified and encrypted successfully.
                  </p>
                )}
              </div>

              <p className="text-xs text-surface-500">
                Your key is encrypted before storage. It is never exposed in the
                browser or logs.
              </p>

              {/* Security badges */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="muted"
                  className="text-xs flex items-center gap-1.5"
                >
                  <Shield className="h-3 w-3 text-green-400" />
                  AES-256 Encrypted
                </Badge>
                <Badge
                  variant="muted"
                  className="text-xs flex items-center gap-1.5"
                >
                  <Server className="h-3 w-3 text-green-400" />
                  Server-side only
                </Badge>
                <Badge
                  variant="muted"
                  className="text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3 w-3 text-green-400" />
                  Revoke anytime
                </Badge>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSaveKey}
                disabled={!isValidKey || saving || saved}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying & Encrypting...
                  </>
                ) : saved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Saved & Verified
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Save & Verify
                  </>
                )}
              </Button>
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
                    We&apos;ll approve the Polymarket contracts using your key.
                    This is a one-time setup.
                  </p>
                </div>
              </div>

              {/* Approval items with progress */}
              <div className="space-y-3">
                {[
                  {
                    label: "Approving CTF Exchange...",
                    desc: "USDC.e spending approval for the CTF Exchange",
                  },
                  {
                    label: "Approving Neg Risk Exchange...",
                    desc: "USDC.e spending approval for Neg Risk markets",
                  },
                  {
                    label: "Approving CTF Tokens...",
                    desc: "CTF token transfer approval for selling positions",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-lg border p-4 transition-colors",
                      approvalProgress > i
                        ? "bg-green-500/5 border-green-500/20"
                        : approving && approvalProgress === i
                          ? "bg-brand-600/5 border-brand-500/20"
                          : "bg-surface-200/50 border-surface-300/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-surface-800">
                          {item.label}
                        </p>
                        <p className="text-xs text-surface-500 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                      {approvalProgress > i ? (
                        <Check className="h-5 w-5 text-green-400" />
                      ) : approving && approvalProgress === i ? (
                        <Loader2 className="h-5 w-5 text-brand-400 animate-spin" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-surface-400" />
                      )}
                    </div>
                    {approvalProgress > i && (
                      <p className="text-xs text-surface-500 mt-2 font-mono">
                        tx: 0x{Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}...
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleApproveAll}
                disabled={approving || checks["contracts-approved"]}
              >
                {approving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving Contracts ({approvalProgress}/3)...
                  </>
                ) : checks["contracts-approved"] ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    All Contracts Approved
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

          {/* Step 5: Verify & Launch */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border-2 border-green-500/30">
                    <Check className="h-10 w-10 text-green-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Ready to Launch</CardTitle>
                <p className="text-surface-600 mt-2">
                  Your wallet is connected and ready for automated trading.
                </p>
              </div>

              {/* Status summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-green-500/5 border border-green-500/20 p-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-surface-700">
                      Wallet Address
                    </span>
                  </div>
                  <span className="text-sm font-mono text-green-400">
                    0x...connected
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-green-500/5 border border-green-500/20 p-3">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-surface-700">
                      USDC.e Balance
                    </span>
                  </div>
                  <span className="text-sm font-mono text-green-400">
                    Available
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-green-500/5 border border-green-500/20 p-3">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-surface-700">
                      Contract Approvals
                    </span>
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                    3/3 Approved
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg bg-surface-200/50 border border-surface-300/50 p-4">
                <p className="text-sm text-surface-600">
                  The bot will sign and submit orders automatically. All risk
                  controls are enforced — position limits, stop losses, and
                  Kelly sizing remain active at all times.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/app/weather-arb" className="flex-1">
                  <Button className="w-full" size="lg">
                    Launch Weather Arb Bot
                    <Rocket className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/app/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full" size="lg">
                    Go to Dashboard
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

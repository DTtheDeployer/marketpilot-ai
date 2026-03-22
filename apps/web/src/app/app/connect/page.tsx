"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  cn,
} from "@marketpilot/ui";
import {
  Wallet,
  Key,
  Check,
  X,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Plug,
} from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Is my private key safe?",
    answer:
      "Your private key is encrypted with AES-256 before storage and is only held server-side. It is never exposed in the browser, in logs, or to any third party. You can revoke access at any time from Settings, which immediately deletes the stored key.",
  },
  {
    question: "Can I switch between modes?",
    answer:
      "Yes, you can switch between Browser Wallet and API Key mode at any time. Go to Settings > Wallet to change your connection method. Switching does not affect your open positions or order history.",
  },
  {
    question: "What if I lose connection in Browser Wallet mode?",
    answer:
      "If you go offline or close the tab, the bot pauses automatically. No trades will be submitted without your explicit approval. When you reconnect, the bot resumes scanning for opportunities.",
  },
  {
    question: "How much USDC do I need?",
    answer:
      "A minimum of $10 USDC.e is required to place a trade. We recommend at least $100 for proper Kelly Criterion position sizing, which allows the bot to diversify across multiple markets and manage risk effectively.",
  },
];

const comparisonRows = [
  { feature: "Setup time", browser: "2 minutes", api: "5 minutes" },
  { feature: "Requires approval per trade", browser: "Yes", api: "No" },
  { feature: "24/7 automated", browser: "No", api: "Yes" },
  {
    feature: "Private key leaves wallet",
    browser: "No",
    api: "Yes (encrypted)",
  },
  {
    feature: "Best for",
    browser: "Testing, small amounts",
    api: "Serious automation",
  },
];

export default function ConnectPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-5xl space-y-10 p-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <Plug className="h-6 w-6 text-brand-400" />
          <h1 className="text-3xl font-bold text-surface-900">
            Connect to Polymarket
          </h1>
        </div>
        <p className="text-surface-600 text-lg">
          Choose how you want to trade. Both paths take less than 5 minutes.
        </p>
      </div>

      {/* Two path cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Path A — Browser Wallet */}
        <Card className="relative border-brand-500/30">
          <div className="absolute -top-3 left-4">
            <Badge className="bg-brand-600 text-white border-0 shadow-lg shadow-brand-600/20">
              Recommended
            </Badge>
          </div>
          <CardHeader className="pt-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600/10 border border-brand-500/20">
                <Wallet className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <Badge variant="muted" className="mb-1 text-xs">
                  Quick Start
                </Badge>
                <CardTitle className="text-xl">Browser Wallet</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Meta */}
            <div className="flex gap-4 text-sm text-surface-600">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> 2 minutes
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Maximum security
              </span>
            </div>

            <p className="text-sm text-surface-600">
              <span className="font-medium text-surface-800">Best for:</span>{" "}
              Manual trade approval, maximum security
            </p>
            <p className="text-sm text-surface-600">
              <span className="font-medium text-surface-800">
                What you need:
              </span>{" "}
              MetaMask or any Web3 wallet
            </p>

            {/* How it works */}
            <div>
              <p className="text-sm font-medium text-surface-800 mb-2">
                How it works:
              </p>
              <ul className="space-y-1.5 text-sm text-surface-600">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  Connect your wallet on this page
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  When the bot finds a trade, you approve it in MetaMask
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  You stay in full control of every transaction
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  Your private key never leaves your wallet
                </li>
              </ul>
            </div>

            {/* Limitations */}
            <div>
              <p className="text-sm font-medium text-surface-800 mb-2">
                Limitations:
              </p>
              <ul className="space-y-1.5 text-sm text-surface-600">
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 text-surface-500 mt-0.5 shrink-0" />
                  You need to be online to approve trades
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 text-surface-500 mt-0.5 shrink-0" />
                  Bot pauses if you don&apos;t approve within 5 minutes
                </li>
              </ul>
            </div>

            <Link href="/app/connect/browser-wallet">
              <Button className="w-full mt-2" size="lg">
                Connect Wallet
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Path B — API Key Mode */}
        <Card>
          <CardHeader className="pt-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-200 border border-surface-300">
                <Key className="h-5 w-5 text-surface-700" />
              </div>
              <div>
                <Badge variant="muted" className="mb-1 text-xs">
                  Full Automation
                </Badge>
                <CardTitle className="text-xl">API Key Mode</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Meta */}
            <div className="flex gap-4 text-sm text-surface-600">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> 5 minutes
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Set-and-forget
              </span>
            </div>

            <p className="text-sm text-surface-600">
              <span className="font-medium text-surface-800">Best for:</span>{" "}
              24/7 automated trading, set-and-forget
            </p>
            <p className="text-sm text-surface-600">
              <span className="font-medium text-surface-800">
                What you need:
              </span>{" "}
              MetaMask + your private key
            </p>

            {/* How it works */}
            <div>
              <p className="text-sm font-medium text-surface-800 mb-2">
                How it works:
              </p>
              <ul className="space-y-1.5 text-sm text-surface-600">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  Export your private key from MetaMask
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  Paste it securely into your MarketPilot settings
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  Bot trades automatically 24/7 without approvals
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  All risk controls still enforced
                </li>
              </ul>
            </div>

            {/* Security */}
            <div>
              <p className="text-sm font-medium text-surface-800 mb-2">
                Security:
              </p>
              <ul className="space-y-1.5 text-sm text-surface-600">
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  Key is encrypted and stored server-side
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  Never exposed in the browser
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  You can revoke access anytime
                </li>
              </ul>
            </div>

            <Link href="/app/connect/api-key">
              <Button variant="outline" className="w-full mt-2" size="lg">
                Set Up Automation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-300">
                  <th className="text-left py-3 px-4 font-medium text-surface-600">
                    Feature
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-brand-400">
                    Browser Wallet
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-surface-700">
                    API Key Mode
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-surface-300/50"
                  >
                    <td className="py-3 px-4 text-surface-700">
                      {row.feature}
                    </td>
                    <td className="py-3 px-4 text-surface-600">
                      {row.browser}
                    </td>
                    <td className="py-3 px-4 text-surface-600">{row.api}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <div>
        <h2 className="text-xl font-bold text-surface-900 mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <Card key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-surface-800">
                  {faq.question}
                </span>
                {openFaq === i ? (
                  <ChevronUp className="h-4 w-4 text-surface-500 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-surface-500 shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-surface-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

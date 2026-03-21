"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, cn } from "@marketpilot/ui";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "What is MarketPilot?",
    answer:
      "MarketPilot is an automation platform for prediction markets. It provides a curated library of trading strategies, paper trading simulation, backtesting, and live execution with institutional-grade risk controls. It is a tool for systematic traders — not a financial advisory service.",
  },
  {
    question: "Do I need to deposit funds to use MarketPilot?",
    answer:
      "No. Paper trading and backtesting require no capital. You can simulate strategies with virtual funds against real market data. Live trading requires connecting your own wallet, but MarketPilot never holds your funds — our architecture is fully non-custodial.",
  },
  {
    question: "What prediction markets does MarketPilot support?",
    answer:
      "MarketPilot currently integrates with major prediction market platforms that offer programmatic access. Specific supported markets are listed in your dashboard after you create an account.",
  },
  {
    question: "How is paper trading different from live trading?",
    answer:
      "Paper trading simulates order execution against real-time market data using virtual capital. It tracks all the same metrics — P&L, win rate, drawdown — but no real money is at risk. Live trading uses your connected wallet to place real orders on prediction market platforms.",
  },
  {
    question: "What risk controls are available?",
    answer:
      "Every strategy supports configurable stop-losses, take-profit thresholds, daily drawdown limits, maximum position sizes, and consecutive loss circuit breakers. These controls are enforced server-side and apply to both paper and live trading.",
  },
  {
    question: "Can I lose money using MarketPilot?",
    answer:
      "Yes. Prediction market trading involves significant risk. Strategies can and do lose money, even with risk controls in place. Past performance — whether simulated or live — does not guarantee future results. You should only trade with capital you can afford to lose.",
  },
  {
    question: "Is live trading available everywhere?",
    answer:
      "No. Live trading is subject to jurisdictional eligibility requirements. Users from restricted regions cannot access live trading features. You must pass an automated eligibility check and acknowledge our risk disclosure before live trading is enabled.",
  },
  {
    question: "How does the non-custodial architecture work?",
    answer:
      "MarketPilot connects to your wallet to submit transactions to prediction market smart contracts. Your funds remain in your wallet at all times. MarketPilot cannot withdraw, transfer, or access your funds outside of the specific trade operations you authorize.",
  },
  {
    question: "What happens if a strategy hits its risk limits?",
    answer:
      "If a strategy exceeds any configured risk parameter — daily loss limit, consecutive losses, or maximum drawdown — it is automatically paused. All open orders are cancelled, and you receive an alert. You must manually review and restart the strategy.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes. All subscriptions can be cancelled at any time. You retain access to your current plan until the end of your billing period. Active bots will continue to run until you manually stop them or your subscription expires.",
  },
  {
    question: "Does MarketPilot provide financial advice?",
    answer:
      "No. MarketPilot provides tools, strategies, and automation infrastructure. It does not provide financial advice, trading recommendations, or guarantees of profitability. All trading decisions are your own responsibility.",
  },
  {
    question: "How do I get support?",
    answer:
      "Free plan users have access to community support. Pro (Strategist) plan includes email support. Elite (Operator) plan includes priority support with faster response times. You can reach us at support@marketpilot.ai.",
  },
];

function AccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-surface-300">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="font-medium text-surface-900 pr-4">
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-surface-600 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          open ? "max-h-96 pb-5" : "max-h-0"
        )}
      >
        <p className="text-sm text-surface-700 leading-relaxed pr-8">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Badge variant="default" className="mb-6">
            FAQ
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-900">
            Frequently Asked Questions
          </h1>
          <p className="mt-6 text-lg text-surface-700 max-w-2xl mx-auto">
            Answers to common questions about MarketPilot, paper trading, live
            execution, and risk management.
          </p>
        </div>
      </section>

      {/* ── Accordion ─────────────────────────────────────────────────── */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="border-t border-surface-300">
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} item={faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact CTA ───────────────────────────────────────────────── */}
      <section className="border-t border-surface-300 py-16 bg-surface-50">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-surface-900">
            Still have questions?
          </h2>
          <p className="mt-3 text-surface-700">
            Reach out to our team and we will get back to you promptly.
          </p>
          <div className="mt-6">
            <Link href="/contact">
              <span className="text-brand-400 hover:text-brand-500 font-medium underline">
                Contact Support
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

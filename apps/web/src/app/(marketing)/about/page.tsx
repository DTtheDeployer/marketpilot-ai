import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from "@marketpilot/ui";
import {
  Target,
  ShieldCheck,
  Eye,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

const values = [
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Every strategy has a published thesis. Every risk control is documented. No black boxes, no hidden logic, no proprietary signals sold as certainties.",
  },
  {
    icon: ShieldCheck,
    title: "Risk-First Design",
    description:
      "Risk controls are not an add-on — they are foundational to every feature. Stop-losses, circuit breakers, and position limits are mandatory, not optional.",
  },
  {
    icon: Target,
    title: "Tools, Not Advice",
    description:
      "We build automation infrastructure. We do not sell predictions, promise returns, or encourage reckless trading. Users make their own decisions with full information.",
  },
  {
    icon: Lightbulb,
    title: "Simulation First",
    description:
      "We believe every strategy should be tested before deployment. Paper trading is a first-class feature, not an afterthought.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Badge variant="default" className="mb-6">
            About
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-900">
            About MarketPilot
          </h1>
          <p className="mt-6 text-lg text-surface-700 max-w-2xl mx-auto">
            Professional-grade automation tools for prediction market
            participants who value discipline, transparency, and risk management.
          </p>
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────────────────── */}
      <section className="pb-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-surface-900 mb-6">
            Our Mission
          </h2>
          <div className="space-y-4 text-surface-700 leading-relaxed">
            <p>
              Prediction markets are one of the most efficient mechanisms for
              aggregating information and forecasting outcomes. But participating
              systematically — with defined strategies, proper risk management,
              and automated execution — has historically required significant
              technical infrastructure.
            </p>
            <p>
              MarketPilot exists to provide that infrastructure. We give
              systematic traders the tools to research, simulate, and execute
              prediction market strategies with the same rigor applied in
              traditional quantitative trading.
            </p>
            <p>
              We do not sell predictions. We do not promise profits. We build
              tools that help disciplined traders operate more effectively in
              prediction markets.
            </p>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────── */}
      <section className="border-t border-surface-300 py-20 bg-surface-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-surface-900 text-center mb-12">
            Our Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value) => (
              <Card key={value.title}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center shrink-0">
                      <value.icon className="h-5 w-5 text-brand-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {value.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {value.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How We're Different ────────────────────────────────────────── */}
      <section className="border-t border-surface-300 py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-surface-900 mb-6">
            How We Are Different
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-surface-900">
                Non-Custodial
              </h3>
              <p className="mt-1 text-sm text-surface-700">
                Your funds stay in your wallet. MarketPilot never takes custody
                of user capital. Every transaction is authorized by you and
                executed through public smart contracts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">
                No Performance Fees
              </h3>
              <p className="mt-1 text-sm text-surface-700">
                We charge a flat subscription fee. We do not take a percentage
                of profits, add hidden markups, or benefit from your trading
                activity.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">
                Paper Trading as a First-Class Feature
              </h3>
              <p className="mt-1 text-sm text-surface-700">
                Most platforms treat simulation as an afterthought. At
                MarketPilot, paper trading uses the same infrastructure as live
                trading. We encourage you to simulate extensively before
                deploying real capital.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">
                Mandatory Risk Controls
              </h3>
              <p className="mt-1 text-sm text-surface-700">
                Risk controls are not optional. Every strategy deployment
                requires defined stop-losses and position limits. We believe
                this protects users and promotes responsible trading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="border-t border-surface-300 py-20 bg-surface-50">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-surface-900">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-surface-700">
            Create a free account and start paper trading today. No credit card
            required.
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button size="lg">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

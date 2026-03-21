import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function RiskDisclosurePage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <AlertTriangle className="h-6 w-6 text-amber-400" />
        <h1 className="text-3xl font-bold text-surface-900">
          Risk Disclosure Statement
        </h1>
      </div>

      <div className="prose prose-invert max-w-none space-y-8 text-surface-700">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 mb-8">
          <p className="text-sm leading-relaxed text-surface-800 font-medium">
            Please read this risk disclosure carefully before using MarketPilot.
            By creating an account or using any MarketPilot services, you
            acknowledge that you have read, understood, and accept these risks.
          </p>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-surface-900 mb-3">
            1. Trading Risk
          </h2>
          <p className="leading-relaxed">
            Prediction market trading involves substantial risk of loss. The
            value of positions can fluctuate significantly and may result in a
            total loss of invested capital. You should not participate in
            prediction market trading with funds you cannot afford to lose.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-surface-900 mb-3">
            2. No Guarantee of Performance
          </h2>
          <p className="leading-relaxed">
            Past performance of any strategy — whether in paper trading,
            backtesting, or live execution — does not guarantee future results.
            Market conditions change, and strategies that have performed well
            historically may lose money in the future. Simulated performance is
            especially limited because it does not account for all real-world
            factors such as slippage, liquidity constraints, and market impact.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-surface-900 mb-3">
            3. Automated Trading Risks
          </h2>
          <p className="leading-relaxed">
            Automated trading systems, including those provided by MarketPilot,
            are subject to technical risks including software errors, network
            latency, system failures, and connectivity issues. While risk
            controls are designed to limit losses, no system can eliminate all
            risk. Automated systems may execute trades that result in losses
            before manual intervention is possible.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-surface-900 mb-3">
            4. Strategy Risk
          </h2>
          <p className="leading-relaxed">
            Each strategy provided by MarketPilot has different risk
            characteristics. Higher risk levels correspond to greater potential
            for both gains and losses. You should carefully review the thesis,
            risk level, and parameters of any strategy before deploying it with
            real capital.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-surface-900 mb-3">
            5. Market Risk
          </h2>
          <p className="leading-relaxed">
            Prediction markets may experience periods of low liquidity, wide
            spreads, or sudden price movements. These conditions can result in
            orders being filled at unfavorable prices or not being filled at
            all. Market disruptions, platform outages, or contract resolution
            disputes can also affect trading outcomes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-surface-900 mb-3">
            6. Regulatory Risk
          </h2>
          <p className="leading-relaxed">
            The regulatory status of prediction markets varies by jurisdiction
            and is subject to change. Changes in regulation may affect your
            ability to access, trade on, or withdraw funds from prediction
            market platforms. You are responsible for understanding and
            complying with all applicable laws and regulations in your
            jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-surface-900 mb-3">
            7. Smart Contract Risk
          </h2>
          <p className="leading-relaxed">
            Prediction market platforms operate through smart contracts on
            blockchain networks. These contracts may contain vulnerabilities,
            and blockchain networks may experience congestion, forks, or other
            disruptions that can affect transaction execution and settlement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-surface-900 mb-3">
            8. Not Financial Advice
          </h2>
          <p className="leading-relaxed">
            MarketPilot provides tools, infrastructure, and automation for
            prediction market trading. Nothing provided by MarketPilot —
            including strategies, backtests, analytics, or any other content —
            constitutes financial advice, trading recommendations, or an
            invitation to trade. All trading decisions are solely your
            responsibility.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-surface-900 mb-3">
            9. Risk Controls Are Not Risk Elimination
          </h2>
          <p className="leading-relaxed">
            Risk management features such as stop-losses, daily limits, and
            circuit breakers are designed to limit — not eliminate — potential
            losses. In fast-moving or illiquid markets, actual losses may
            exceed configured limits. Risk controls are tools that require
            proper configuration and monitoring.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-surface-900 mb-3">
            10. Acknowledgment
          </h2>
          <p className="leading-relaxed">
            By using MarketPilot services, you acknowledge that you understand
            these risks, that you are trading at your own risk, and that
            MarketPilot is not liable for any losses incurred through the use
            of our platform or strategies.
          </p>
        </section>

        <div className="pt-4 border-t border-surface-300">
          <p className="text-xs text-surface-600">
            Last updated: March 2026. For questions about this disclosure,
            contact{" "}
            <Link
              href="mailto:legal@marketpilot.ai"
              className="text-brand-400 hover:text-brand-500 underline"
            >
              legal@marketpilot.ai
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

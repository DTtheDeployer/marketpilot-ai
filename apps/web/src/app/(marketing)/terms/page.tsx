import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-surface-900 mb-8">
          Terms of Service
        </h1>

        <div className="prose prose-invert max-w-none space-y-6 text-surface-700">
          <p className="text-sm text-surface-600">
            Last updated: March 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-surface-800">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using MarketPilot AI (&quot;the Service&quot;), you agree
              to be bound by these Terms of Service. If you do not agree to these
              terms, please do not use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-surface-800">
              2. Description of Service
            </h2>
            <p>
              MarketPilot AI provides tools for researching, simulating, and
              automating prediction market strategies. The Service includes paper
              trading simulation, backtesting, and optional live trading
              execution. MarketPilot AI does not provide financial advice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-surface-800">
              3. Risk Disclosure
            </h2>
            <p>
              Trading prediction markets involves substantial risk of loss.
              Past performance does not guarantee future results. You are solely
              responsible for any trading decisions made using the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-surface-800">
              4. User Accounts
            </h2>
            <p>
              You are responsible for maintaining the security of your account
              credentials. You agree to notify us immediately of any
              unauthorized access to your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-surface-800">
              5. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, MarketPilot AI shall not
              be liable for any indirect, incidental, special, or consequential
              damages arising from your use of the Service, including but not
              limited to trading losses.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-surface-800">
              6. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these terms at any time. Continued
              use of the Service after changes constitutes acceptance of the
              updated terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-surface-800">
              7. Contact
            </h2>
            <p>
              For questions about these Terms, please contact us at{" "}
              <a
                href="mailto:legal@marketpilot.ai"
                className="text-brand-400 hover:text-brand-300 transition-colors"
              >
                legal@marketpilot.ai
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

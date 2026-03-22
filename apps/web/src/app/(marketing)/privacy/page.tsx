import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-surface-900 mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-invert max-w-none space-y-6 text-surface-700">
          <p className="text-sm text-surface-600">
            Last updated: March 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-surface-800">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly, such as your email
              address and account details. We also collect usage data including
              pages visited, features used, and trading activity within the
              platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-surface-800">
              2. How We Use Your Information
            </h2>
            <p>
              We use your information to provide and improve the Service,
              communicate with you about your account, send relevant
              notifications, and ensure the security of the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-surface-800">
              3. Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your
              data. MarketPilot AI operates on a non-custodial architecture --
              we never hold or have access to your trading funds.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-surface-800">
              4. Third-Party Services
            </h2>
            <p>
              We may use third-party services for analytics, authentication, and
              payment processing. These services have their own privacy policies
              governing their use of your information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-surface-800">
              5. Cookies and Tracking
            </h2>
            <p>
              We use cookies and similar technologies to maintain your session,
              remember your preferences, and analyze usage patterns to improve
              the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-surface-800">
              6. Your Rights
            </h2>
            <p>
              You may request access to, correction of, or deletion of your
              personal data at any time by contacting us. You may also opt out
              of non-essential communications.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-surface-800">
              7. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of significant changes via email or through the
              Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-surface-800">
              8. Contact
            </h2>
            <p>
              For privacy-related inquiries, please contact us at{" "}
              <a
                href="mailto:privacy@marketpilot.ai"
                className="text-brand-400 hover:text-brand-300 transition-colors"
              >
                privacy@marketpilot.ai
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

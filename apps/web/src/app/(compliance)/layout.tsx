import Link from "next/link";

export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-0">
      <div className="border-b border-surface-300 py-4">
        <div className="mx-auto max-w-4xl px-6">
          <Link
            href="/"
            className="text-lg font-bold text-surface-900 tracking-tight"
          >
            Market<span className="text-brand-400">Pilot</span>
          </Link>
        </div>
      </div>
      <main className="mx-auto max-w-4xl px-6 py-12">{children}</main>
      <div className="border-t border-surface-300 py-6">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs text-surface-600">
            MarketPilot AI. All rights reserved. This content is provided for
            informational purposes only and does not constitute financial or
            legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-xl font-bold text-surface-900 tracking-tight"
        >
          Market<span className="text-brand-400">Pilot</span>
        </Link>
      </div>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-xs text-surface-600 text-center max-w-sm">
        By continuing, you agree to MarketPilot&apos;s Terms of Service and
        acknowledge that prediction market trading involves significant risk.
      </p>
    </div>
  );
}

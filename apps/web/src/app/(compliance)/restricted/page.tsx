import Link from "next/link";
import { Button } from "@marketpilot/ui";
import { ShieldOff, ArrowLeft } from "lucide-react";

export default function RestrictedPage() {
  return (
    <div className="py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
        <ShieldOff className="h-8 w-8 text-red-400" />
      </div>
      <h1 className="text-3xl font-bold text-surface-900">
        Region Not Supported
      </h1>
      <p className="mt-4 text-lg text-surface-700 max-w-xl mx-auto">
        Based on your location, you are accessing MarketPilot from a
        jurisdiction where prediction market trading is restricted or
        prohibited.
      </p>
      <div className="mt-8 space-y-4 text-left max-w-lg mx-auto">
        <div className="rounded-xl border border-surface-300 bg-surface-100 p-6">
          <h2 className="font-semibold text-surface-900 mb-3">
            What this means
          </h2>
          <ul className="space-y-2 text-sm text-surface-700">
            <li>
              You may still create an account and access educational content
              about our strategies and platform.
            </li>
            <li>
              Paper trading functionality may be limited or unavailable in your
              region.
            </li>
            <li>
              Live trading is not available from restricted jurisdictions.
            </li>
            <li>
              If you believe this determination is in error, please contact our
              support team.
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
          <h2 className="font-semibold text-surface-900 mb-2">
            Why are some regions restricted?
          </h2>
          <p className="text-sm text-surface-700 leading-relaxed">
            Prediction market regulations vary by jurisdiction. MarketPilot
            restricts access in regions where prediction market participation
            may violate local laws or regulations. This protects both our users
            and the platform.
          </p>
        </div>
      </div>
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/">
          <Button variant="outline" size="lg">
            <ArrowLeft className="h-4 w-4" />
            Return Home
          </Button>
        </Link>
        <Link href="/contact">
          <Button variant="secondary" size="lg">
            Contact Support
          </Button>
        </Link>
      </div>
    </div>
  );
}

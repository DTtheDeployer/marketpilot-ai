import Link from "next/link";
import { BarChart3 } from "lucide-react";

const footerLinks = {
  Product: [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/strategies", label: "Strategies" },
    { href: "/pricing", label: "Pricing" },
    { href: "/paper-trading", label: "Paper Trading" },
    { href: "/live-trading", label: "Live Trading" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/security", label: "Security" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ],
  Legal: [
    { href: "/risk-disclosure", label: "Risk Disclosure" },
    { href: "#", label: "Terms of Service" },
    { href: "#", label: "Privacy Policy" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-surface-300 bg-surface-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-surface-900">
                MarketPilot<span className="text-brand-400"> AI</span>
              </span>
            </Link>
            <p className="text-sm text-surface-700 max-w-xs">
              Prediction-market strategy automation with institutional-grade risk controls.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-surface-800 mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-surface-600 hover:text-surface-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-surface-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-600">
            &copy; {new Date().getFullYear()} MarketPilot AI. All rights reserved.
          </p>
          <p className="text-xs text-surface-600 max-w-lg text-center sm:text-right">
            Trading prediction markets involves risk. Past performance does not guarantee future results.
            This platform provides tools for research and automation — it does not provide financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}

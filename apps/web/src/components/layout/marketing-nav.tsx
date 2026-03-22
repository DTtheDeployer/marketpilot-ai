"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, BarChart3 } from "lucide-react";

const navLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/strategies", label: "Strategies" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
  { href: "/faq", label: "FAQ" },
];

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-surface-900">
              MarketPilot<span className="text-brand-400"> AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-surface-700 hover:text-surface-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-surface-700 hover:text-surface-900 transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20"
            >
              Start Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-surface-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-300 bg-surface-50">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm text-surface-700 hover:text-surface-900"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-surface-300 flex flex-col gap-2">
              <Link href="/login" className="text-sm text-surface-700">
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

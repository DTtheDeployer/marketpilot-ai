"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Lightbulb,
  Bot,
  FlaskConical,
  Briefcase,
  ClipboardList,
  Bell,
  Settings,
  Shield,
  Users,
  ChevronDown,
  CloudSun,
  Plug,
  X,
} from "lucide-react";
import { cn } from "@marketpilot/ui";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

const mainNav = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/weather-arb", label: "Weather Arb", icon: CloudSun },
  { href: "/app/connect", label: "Connect", icon: Plug },
  { href: "/app/strategies", label: "Strategies", icon: Lightbulb },
  { href: "/app/bots", label: "Bots", icon: Bot },
  { href: "/app/backtests", label: "Backtests", icon: FlaskConical },
  { href: "/app/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/app/orders", label: "Orders", icon: ClipboardList },
  { href: "/app/alerts", label: "Alerts", icon: Bell },
];

const settingsNav = [
  { href: "/app/settings", label: "General", icon: Settings },
  { href: "/app/settings/billing", label: "Billing", icon: Settings },
  { href: "/app/settings/security", label: "Security", icon: Shield },
  { href: "/app/settings/referrals", label: "Referrals", icon: Users },
];

const adminNav = [
  { href: "/app/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/app/admin/users", label: "Users", icon: Users },
  { href: "/app/admin/strategies", label: "Strategies", icon: Lightbulb },
  { href: "/app/admin/system", label: "System", icon: Settings },
];

const bottomNav = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/weather-arb", label: "Weather", icon: CloudSun },
  { href: "/app/bots", label: "Bots", icon: Bot },
  { href: "/app/orders", label: "Orders", icon: ClipboardList },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const planTier = user?.subscription?.planTier || "FREE";
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith("/app/settings"));
  const [adminOpen, setAdminOpen] = useState(pathname.startsWith("/app/admin"));

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 w-64 bg-surface-50 border-r border-surface-300 flex flex-col z-50 transition-transform duration-200",
          // Desktop: always visible
          "max-md:-translate-x-full max-md:data-[open=true]:translate-x-0",
          // Desktop always show
          "md:translate-x-0"
        )}
        data-open={open}
      >
        {/* Logo + close button — with subtle gradient behind logo */}
        <div className="relative h-16 flex items-center justify-between px-5 border-b border-surface-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/5 via-brand-500/3 to-transparent pointer-events-none" />
          <Link href="/app/dashboard" className="relative flex items-center gap-2" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-lg shadow-brand-600/20">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-surface-900">
              MarketPilot<span className="text-brand-400"> AI</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="relative md:hidden p-1.5 rounded-lg text-surface-700 hover:bg-surface-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {mainNav.filter((item) => {
            // Only show Connect nav item for ELITE (Operator) users
            if (item.href === "/app/connect" && planTier !== "ELITE") return false;
            return true;
          }).map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-brand-600/10 text-brand-400"
                    : "text-surface-700 hover:bg-surface-200 hover:text-surface-900"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r-full bg-brand-500" />
                )}
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="pt-3 pb-1">
            <div className="h-px bg-gradient-to-r from-surface-300/50 via-surface-300 to-surface-300/50" />
          </div>

          {/* Settings */}
          <div className="pt-1">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-200 transition-colors"
            >
              <span className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                Settings
              </span>
              <ChevronDown
                className={cn("h-3 w-3 transition-transform", settingsOpen && "rotate-180")}
              />
            </button>
            {settingsOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {settingsNav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors",
                        active
                          ? "text-brand-400"
                          : "text-surface-600 hover:text-surface-900"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full bg-brand-500" />
                      )}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin — only for ADMIN / SUPER_ADMIN */}
          {isAdmin && (<>
          {/* Divider */}
          <div className="pt-1 pb-1">
            <div className="h-px bg-gradient-to-r from-surface-300/50 via-surface-300 to-surface-300/50" />
          </div>

          <div className="pt-1">
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-200 transition-colors"
            >
              <span className="flex items-center gap-3">
                <Shield className="h-4 w-4" />
                Admin
              </span>
              <ChevronDown
                className={cn("h-3 w-3 transition-transform", adminOpen && "rotate-180")}
              />
            </button>
            {adminOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {adminNav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors",
                        active
                          ? "text-brand-400"
                          : "text-surface-600 hover:text-surface-900"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full bg-brand-500" />
                      )}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          </>)}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-surface-300">
          <div className="rounded-lg bg-surface-200/80 border border-surface-300/50 p-3">
            <p className="text-xs font-medium text-surface-700">Paper Mode</p>
            <p className="text-xs text-surface-600 mt-0.5">
              All trades are simulated
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface-50/90 backdrop-blur-xl border-t border-surface-300 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14">
          {bottomNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs transition-colors",
                  active ? "text-brand-400" : "text-surface-600"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

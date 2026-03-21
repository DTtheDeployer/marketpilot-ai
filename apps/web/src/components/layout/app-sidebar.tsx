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
} from "lucide-react";
import { cn } from "@marketpilot/ui";
import { useState } from "react";

const mainNav = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
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
];

const adminNav = [
  { href: "/app/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/app/admin/users", label: "Users", icon: Users },
  { href: "/app/admin/strategies", label: "Strategies", icon: Lightbulb },
  { href: "/app/admin/system", label: "System", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith("/app/settings"));
  const [adminOpen, setAdminOpen] = useState(pathname.startsWith("/app/admin"));

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface-50 border-r border-surface-300 flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-surface-300">
        <Link href="/app/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-surface-900">
            MarketPilot<span className="text-brand-400"> AI</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {mainNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-600/10 text-brand-400"
                  : "text-surface-700 hover:bg-surface-200 hover:text-surface-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {/* Settings */}
        <div className="pt-4">
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
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "text-brand-400"
                        : "text-surface-600 hover:text-surface-900"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Admin */}
        <div className="pt-2">
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
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "text-brand-400"
                        : "text-surface-600 hover:text-surface-900"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-surface-300">
        <div className="rounded-lg bg-surface-200 p-3">
          <p className="text-xs font-medium text-surface-700">Paper Mode</p>
          <p className="text-xs text-surface-600 mt-0.5">
            All trades are simulated
          </p>
        </div>
      </div>
    </aside>
  );
}

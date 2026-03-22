"use client";

import { Bell, Search, User, LogOut, Menu, Zap } from "lucide-react";
import { Badge, Button } from "@marketpilot/ui";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAuthStore } from "@/stores/auth-store";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";

export function AppHeader({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const tradingMode = user?.profile?.tradingMode || "PAPER";
  const planTier = user?.subscription?.planTier || "FREE";

  const fetchUnread = useCallback(async () => {
    try {
      const res = await api.getAlerts(true);
      setUnreadCount(res.data.unreadCount);
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  return (
    <header className="relative h-16 bg-surface-50/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6">
      {/* Subtle bottom gradient fade instead of hard border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-surface-300 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-surface-0/5 to-transparent pointer-events-none translate-y-full" />

      {/* Left side: hamburger + search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-2 rounded-lg text-surface-700 hover:bg-surface-200 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-600 transition-colors group-focus-within:text-brand-400" />
          <input
            type="text"
            placeholder="Search markets, strategies, bots..."
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-surface-300 bg-surface-100 text-sm text-surface-900 placeholder:text-surface-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:shadow-lg focus:shadow-brand-500/5 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4">
        <Badge variant={tradingMode === "LIVE" ? "live" : "paper"}>
          <span className="hidden sm:inline">{tradingMode === "LIVE" ? "Live Mode" : "Paper Mode"}</span>
          <span className="sm:hidden">{tradingMode === "LIVE" ? "Live" : "Paper"}</span>
        </Badge>

        {planTier === "ELITE" ? (
          <Badge variant="success">Operator</Badge>
        ) : (
          <Link href="/app/settings/billing">
            <Button size="sm" className="gap-1.5 hidden sm:flex">
              <Zap className="h-3.5 w-3.5" />
              {planTier === "FREE" ? "Upgrade" : "Go Live"}
            </Button>
            <Button size="sm" className="sm:hidden px-2">
              <Zap className="h-3.5 w-3.5" />
            </Button>
          </Link>
        )}

        {planTier === "ELITE" && (
          <div className="hidden sm:block">
            <ConnectButton
              accountStatus="avatar"
              chainStatus="icon"
              showBalance={false}
            />
          </div>
        )}

        <Link
          href="/app/alerts"
          className="relative p-2 rounded-lg text-surface-700 hover:bg-surface-200 hover:text-surface-900 transition-all duration-200"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-500 pulse-dot" />
          )}
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-2 rounded-lg text-surface-700 hover:bg-surface-200 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-brand-600/20 flex items-center justify-center ring-2 ring-brand-500/10">
              <User className="h-4 w-4 text-brand-400" />
            </div>
            {user && (
              <span className="text-sm text-surface-800 hidden lg:block">
                {user.name || user.email}
              </span>
            )}
          </button>

          {showMenu && (
            <div className="absolute right-0 top-12 w-48 rounded-lg border border-surface-300 bg-surface-100/95 backdrop-blur-xl shadow-xl shadow-black/20 py-1 z-50">
              <div className="px-3 py-2 border-b border-surface-300">
                <p className="text-sm font-medium text-surface-900 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-surface-600 truncate">
                  {user?.email}
                </p>
              </div>
              <Link
                href="/app/settings"
                className="block px-3 py-2 text-sm text-surface-700 hover:bg-surface-200 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                Settings
              </Link>
              <Link
                href="/app/settings/billing"
                className="block px-3 py-2 text-sm text-surface-700 hover:bg-surface-200 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                Billing
              </Link>
              <button
                onClick={() => {
                  setShowMenu(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-surface-200 flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

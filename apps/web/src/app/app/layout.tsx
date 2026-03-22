"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Web3Provider } from "@/components/providers/web3-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Web3Provider>
    <div className="flex min-h-screen">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-64">
        <AppHeader onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="p-4 md:p-6 pb-20 md:pb-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
    </Web3Provider>
  );
}

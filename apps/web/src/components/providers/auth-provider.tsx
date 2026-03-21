"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, initialized, initialize } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!initialized) return;

    const isAppRoute = pathname.startsWith("/app");
    const isAuthRoute = pathname === "/login" || pathname === "/signup";

    // Redirect unauthenticated users away from /app
    if (isAppRoute && !user) {
      router.replace("/login");
      return;
    }

    // Redirect authenticated users away from login/signup
    if (isAuthRoute && user) {
      const onboardingComplete = user.profile?.onboardingComplete;
      router.replace(onboardingComplete ? "/app/dashboard" : "/app/onboarding");
      return;
    }

    // Redirect to onboarding if not complete
    if (
      isAppRoute &&
      user &&
      !user.profile?.onboardingComplete &&
      pathname !== "/app/onboarding"
    ) {
      router.replace("/app/onboarding");
    }
  }, [initialized, user, pathname, router]);

  // Show nothing while initializing on protected routes
  if (!initialized && pathname.startsWith("/app")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-0">
        <div className="text-surface-700 animate-pulse">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}

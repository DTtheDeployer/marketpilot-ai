"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
} from "@marketpilot/ui";
import { LogIn } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);

      // After login, check if onboarding is complete
      const user = useAuthStore.getState().user;
      if (user?.profile?.onboardingComplete) {
        router.push("/app/dashboard");
      } else {
        router.push("/app/onboarding");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to access your dashboard and strategies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-surface-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-surface-400 bg-surface-100 text-brand-600 focus:ring-brand-500"
              />
              Remember me
            </label>
            <Link
              href="#"
              className="text-sm text-brand-400 hover:text-brand-500"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
            <LogIn className="h-4 w-4" />
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-surface-700">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-brand-400 hover:text-brand-500 font-medium"
            >
              Create one
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

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
import { UserPlus } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "@/lib/api-client";

export default function SignupPage() {
  const router = useRouter();
  const { signup, loading } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await signup(email, password, name || undefined);
      router.push("/app/onboarding");
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
        <CardTitle className="text-2xl">Create Your Account</CardTitle>
        <CardDescription>
          Start with free paper trading — no credit card required
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
            id="name"
            label="Full Name"
            type="text"
            placeholder="Your name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            placeholder="Create a strong password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            id="confirm-password"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div>
            <label className="flex items-start gap-2 text-sm text-surface-700">
              <input
                type="checkbox"
                required
                className="h-4 w-4 rounded border-surface-400 bg-surface-100 text-brand-600 focus:ring-brand-500 mt-0.5"
              />
              <span>
                I acknowledge that prediction market trading involves risk
                and I have read the{" "}
                <Link
                  href="/risk-disclosure"
                  className="text-brand-400 hover:text-brand-500 underline"
                >
                  Risk Disclosure
                </Link>
              </span>
            </label>
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
            <UserPlus className="h-4 w-4" />
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-surface-700">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-brand-400 hover:text-brand-500 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

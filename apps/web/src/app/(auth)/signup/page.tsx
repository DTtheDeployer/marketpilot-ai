"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Badge,
} from "@marketpilot/ui";
import { UserPlus } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { api, ApiError } from "@/lib/api-client";

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupSkeleton />}>
      <SignupForm />
    </Suspense>
  );
}

function SignupSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="h-8 w-48 mx-auto bg-surface-300 rounded animate-pulse" />
          <div className="h-4 w-64 mx-auto mt-2 bg-surface-300 rounded animate-pulse" />
        </div>
        <div className="bg-surface-100 border border-surface-300 rounded-xl p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-20 bg-surface-300 rounded animate-pulse" />
              <div className="h-10 w-full bg-surface-200 rounded-lg animate-pulse" />
            </div>
          ))}
          <div className="h-10 w-full bg-brand-600/50 rounded-lg animate-pulse mt-4" />
        </div>
      </div>
    </div>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralValid, setReferralValid] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
      api
        .get<{ success: boolean; data: { valid: boolean } }>(
          `/api/referrals/validate/${ref}`
        )
        .then((res) => {
          setReferralValid(res.data.valid);
        })
        .catch(() => {
          setReferralValid(false);
        });
    }
  }, [searchParams]);

  const validatePassword = () => {
    if (password.length > 0 && password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
    } else {
      setPasswordError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await api.post<{
        success: boolean;
        data: { token: string; user: unknown };
      }>("/api/auth/signup", {
        email,
        password,
        name: name || undefined,
        referralCode: referralValid ? referralCode : undefined,
      });

      if (res.success && res.data.token) {
        localStorage.setItem("marketpilot_token", res.data.token);
        localStorage.setItem(
          "marketpilot_user",
          JSON.stringify(res.data.user)
        );
      }

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
          {referralCode && referralValid && (
            <div className="flex items-center justify-center">
              <Badge
                variant="default"
                className="bg-brand-600/10 text-brand-400 border-brand-600/20"
              >
                Referred by: {referralCode}
              </Badge>
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}
          <Input
            id="name"
            label="Full Name"
            type="text"
            placeholder="Your name (optional)"
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
          <div>
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Create a strong password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              onBlur={validatePassword}
            />
            <p className="mt-1 text-xs text-surface-600">Minimum 8 characters</p>
            {passwordError && (
              <p className="mt-1 text-xs text-red-400">{passwordError}</p>
            )}
          </div>
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

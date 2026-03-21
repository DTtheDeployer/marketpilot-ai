"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
  Input,
  cn,
} from "@marketpilot/ui";
import { User, Shield, Clock, Settings } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api-client";

const riskPresets = [
  { id: "CONSERVATIVE", label: "Conservative", desc: "Low risk, slower growth" },
  { id: "MODERATE", label: "Moderate", desc: "Balanced risk/reward" },
  { id: "AGGRESSIVE", label: "Aggressive", desc: "Higher risk, higher potential" },
];

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Singapore",
  "UTC",
];

export default function SettingsPage() {
  const { user, refreshUser } = useAuthStore();

  const [name, setName] = useState(user?.name ?? "");
  const [email] = useState(user?.email ?? "");
  const [timezone, setTimezone] = useState(user?.profile?.timezone ?? "America/New_York");
  const [selectedRisk, setSelectedRisk] = useState(user?.profile?.riskPreset ?? "MODERATE");
  const [saving, setSaving] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync state when user data loads/changes
  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setTimezone(user.profile?.timezone ?? "America/New_York");
      setSelectedRisk(user.profile?.riskPreset ?? "MODERATE");
    }
  }, [user]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const saveProfile = async () => {
    setSaving("profile");
    setError(null);
    try {
      await api.updateProfile({ name });
      await refreshUser();
      showSuccess("Profile saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(null);
    }
  };

  const saveRiskPreset = async () => {
    setSaving("risk");
    setError(null);
    try {
      await api.updateProfile({ riskPreset: selectedRisk });
      await refreshUser();
      showSuccess("Risk preset updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update risk preset");
    } finally {
      setSaving(null);
    }
  };

  const saveTimezone = async () => {
    setSaving("timezone");
    setError(null);
    try {
      await api.updateProfile({ timezone });
      await refreshUser();
      showSuccess("Timezone saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save timezone");
    } finally {
      setSaving(null);
    }
  };

  const tradingMode = user?.profile?.tradingMode ?? "PAPER";
  const planTier = user?.subscription?.planTier ?? "FREE";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
        <p className="text-sm text-surface-700 mt-1">
          Manage your account preferences and trading configuration
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-400">
          {successMsg}
        </div>
      )}

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-brand-400" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="name"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              id="email"
              label="Email Address"
              type="email"
              value={email}
              disabled
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveProfile} disabled={saving === "profile"}>
            {saving === "profile" ? "Saving..." : "Save Profile"}
          </Button>
        </CardFooter>
      </Card>

      {/* Trading mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-brand-400" />
            <CardTitle>Trading Mode</CardTitle>
          </div>
          <CardDescription>
            Your current trading environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-200/50 border border-surface-300">
            <div className="flex-1">
              <p className="text-sm font-medium text-surface-900">Current Mode</p>
              <p className="text-xs text-surface-700 mt-0.5">
                {tradingMode === "PAPER"
                  ? "Paper mode uses simulated capital. Switch to live trading once eligible."
                  : "Live mode is active. Trades execute with real capital."}
              </p>
            </div>
            <Badge
              variant={tradingMode === "PAPER" ? "paper" : "success"}
              className="text-sm px-4 py-1.5"
            >
              {tradingMode === "PAPER" ? "Paper Trading" : "Live Trading"}
            </Badge>
          </div>
          <div className="mt-3 text-xs text-surface-600">
            Plan: <span className="font-medium text-surface-800">{planTier}</span>
          </div>
        </CardContent>
      </Card>

      {/* Risk preset */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-400" />
            <CardTitle>Risk Preset</CardTitle>
          </div>
          <CardDescription>
            Choose a risk profile that matches your tolerance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {riskPresets.map((preset) => {
              const isSelected = selectedRisk === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedRisk(preset.id)}
                  className={cn(
                    "p-4 rounded-lg border text-left transition-all",
                    isSelected
                      ? "border-brand-500 bg-brand-500/10 ring-1 ring-brand-500/30"
                      : "border-surface-300 bg-surface-200/50 hover:border-surface-400"
                  )}
                >
                  <p className="text-sm font-medium text-surface-900">
                    {preset.label}
                  </p>
                  <p className="text-xs text-surface-700 mt-0.5">{preset.desc}</p>
                  {isSelected && (
                    <Badge variant="default" className="mt-2 text-[10px]">
                      Active
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveRiskPreset} disabled={saving === "risk"}>
            {saving === "risk" ? "Saving..." : "Update Risk Preset"}
          </Button>
        </CardFooter>
      </Card>

      {/* Timezone */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-400" />
            <CardTitle>Timezone</CardTitle>
          </div>
          <CardDescription>
            All timestamps will be displayed in your selected timezone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="flex h-10 w-full max-w-xs rounded-lg border border-surface-400 bg-surface-100 px-3 py-2 text-sm text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace("_", " ")}
              </option>
            ))}
          </select>
        </CardContent>
        <CardFooter>
          <Button onClick={saveTimezone} disabled={saving === "timezone"}>
            {saving === "timezone" ? "Saving..." : "Save Timezone"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

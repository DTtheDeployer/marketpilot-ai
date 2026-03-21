"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Input,
} from "@marketpilot/ui";
import { Search, Users, UserCheck, UserX, UserPlus, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";
import type { AdminUserSummary } from "@marketpilot/types";

const statusVariant: Record<string, "success" | "warning" | "danger" | "muted" | "default"> = {
  ACTIVE: "success",
  TRIALING: "default",
  PAST_DUE: "danger",
  CANCELED: "muted",
  UNPAID: "danger",
};

const planVariant: Record<string, "muted" | "default" | "warning"> = {
  FREE: "muted",
  PRO: "default",
  ELITE: "warning",
};

const jurisdictionVariant: Record<string, "success" | "warning" | "danger" | "muted"> = {
  ELIGIBLE: "success",
  RESTRICTED: "danger",
  UNCHECKED: "muted",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(
    () =>
      api.getAdminUsers(
        search.trim() ? { search: search.trim() } : undefined
      ),
    [search]
  );

  const {
    data: usersData,
    loading,
    error,
    refetch,
  } = useApi<AdminUserSummary[]>(fetchUsers as any);

  // Debounced refetch on search change
  useEffect(() => {
    const timer = setTimeout(() => {
      refetch();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, refetch]);

  const allUsers = (usersData ?? []) as AdminUserSummary[];

  // Client-side filter as a fallback if the API doesn't support search params
  const filtered = search.trim()
    ? allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : allUsers;

  const activeCount = allUsers.filter((u) => u.status === "ACTIVE").length;
  const trialCount = allUsers.filter((u) => u.status === "TRIALING").length;
  const issueCount = allUsers.filter(
    (u) => u.status === "PAST_DUE" || u.status === "UNPAID"
  ).length;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">
          User Management
        </h1>
        <p className="mt-1 text-surface-700">
          View and manage platform users, plans, and account status.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to load users: {error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && !usersData && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-surface-200 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-surface-200 animate-pulse" />
        </div>
      )}

      {!loading || usersData ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="p-5 card-hover">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand-500/10 p-2.5">
                  <Users className="h-5 w-5 text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-surface-600">Total Users</p>
                  <p className="text-xl font-bold text-surface-900">
                    {allUsers.length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-5 card-hover">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2.5">
                  <UserCheck className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-surface-600">Active</p>
                  <p className="text-xl font-bold text-surface-900">{activeCount}</p>
                </div>
              </div>
            </Card>
            <Card className="p-5 card-hover">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2.5">
                  <UserPlus className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-surface-600">Trialing</p>
                  <p className="text-xl font-bold text-surface-900">{trialCount}</p>
                </div>
              </div>
            </Card>
            <Card className="p-5 card-hover">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-500/10 p-2.5">
                  <UserX className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-surface-600">Issues</p>
                  <p className="text-xl font-bold text-surface-900">{issueCount}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* User table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    {filtered.length} user{filtered.length !== 1 ? "s" : ""} found
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-600" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-300 text-left">
                      <th className="pb-3 pr-4 font-medium text-surface-600">Name</th>
                      <th className="pb-3 pr-4 font-medium text-surface-600">Email</th>
                      <th className="pb-3 pr-4 font-medium text-surface-600">Plan</th>
                      <th className="pb-3 pr-4 font-medium text-surface-600">Status</th>
                      <th className="pb-3 pr-4 font-medium text-surface-600">Mode</th>
                      <th className="pb-3 pr-4 font-medium text-surface-600">Jurisdiction</th>
                      <th className="pb-3 pr-4 font-medium text-surface-600 text-right">Bots</th>
                      <th className="pb-3 font-medium text-surface-600">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-300">
                    {filtered.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-surface-200"
                      >
                        <td className="py-3.5 pr-4 font-medium text-surface-900">
                          {user.name}
                        </td>
                        <td className="py-3.5 pr-4 text-surface-700">
                          {user.email}
                        </td>
                        <td className="py-3.5 pr-4">
                          <Badge variant={planVariant[user.plan] ?? "muted"}>
                            {user.plan}
                          </Badge>
                        </td>
                        <td className="py-3.5 pr-4">
                          <Badge variant={statusVariant[user.status] ?? "muted"}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 pr-4">
                          <Badge
                            variant={user.mode === "LIVE" ? "live" : "paper"}
                          >
                            {user.mode}
                          </Badge>
                        </td>
                        <td className="py-3.5 pr-4">
                          <Badge
                            variant={
                              jurisdictionVariant[user.jurisdiction] ?? "muted"
                            }
                          >
                            {user.jurisdiction}
                          </Badge>
                        </td>
                        <td className="py-3.5 pr-4 text-right text-surface-800">
                          {user.botsCount}
                        </td>
                        <td className="py-3.5 text-surface-600">{user.createdAt}</td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-8 text-center text-surface-600"
                        >
                          No users match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

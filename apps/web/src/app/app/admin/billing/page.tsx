"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  StatCard,
} from "@marketpilot/ui";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// ── Mock: revenue stats ────────────────────────────────────────────────────
const revenueStats = {
  mrr: 48750,
  mrrChange: 12.3,
  arr: 585000,
  arrChange: 14.1,
  avgRevenuePerUser: 39.09,
  churnRate: 2.1,
  ltv: 468,
  totalCustomers: 1247,
};

// ── Mock: subscription distribution ────────────────────────────────────────
const subscriptionDist = [
  { plan: "Free (Explorer)", count: 743, pct: 59.6, color: "bg-surface-500" },
  { plan: "Pro (Strategist)", count: 389, pct: 31.2, color: "bg-brand-500" },
  { plan: "Elite (Operator)", count: 115, pct: 9.2, color: "bg-amber-500" },
];

// ── Mock: recent billing events ────────────────────────────────────────────
const billingEvents = [
  {
    id: "bill-1",
    event: "Subscription upgraded",
    user: "alice@example.com",
    detail: "Pro -> Elite",
    amount: "+$149.00/mo",
    type: "upgrade" as const,
    timestamp: "12 min ago",
  },
  {
    id: "bill-2",
    event: "Payment succeeded",
    user: "mark@acmecorp.io",
    detail: "Pro monthly renewal",
    amount: "$49.00",
    type: "payment" as const,
    timestamp: "34 min ago",
  },
  {
    id: "bill-3",
    event: "Payment failed",
    user: "carol@example.com",
    detail: "Card declined — retry scheduled",
    amount: "$49.00",
    type: "failure" as const,
    timestamp: "1h ago",
  },
  {
    id: "bill-4",
    event: "New subscription",
    user: "dave@startup.co",
    detail: "Pro monthly",
    amount: "+$49.00/mo",
    type: "new" as const,
    timestamp: "2h ago",
  },
  {
    id: "bill-5",
    event: "Subscription cancelled",
    user: "eve@bigco.com",
    detail: "Elite — effective end of billing cycle",
    amount: "-$149.00/mo",
    type: "churn" as const,
    timestamp: "3h ago",
  },
  {
    id: "bill-6",
    event: "Refund issued",
    user: "frank@mail.com",
    detail: "Pro — prorated refund for downgrade",
    amount: "-$24.50",
    type: "refund" as const,
    timestamp: "5h ago",
  },
  {
    id: "bill-7",
    event: "Payment succeeded",
    user: "grace@design.io",
    detail: "Elite annual renewal",
    amount: "$1,428.00",
    type: "payment" as const,
    timestamp: "6h ago",
  },
];

const eventBadge: Record<string, { variant: "success" | "danger" | "default" | "warning" | "muted"; label: string }> = {
  upgrade: { variant: "success", label: "Upgrade" },
  payment: { variant: "success", label: "Payment" },
  failure: { variant: "danger", label: "Failed" },
  new: { variant: "default", label: "New" },
  churn: { variant: "warning", label: "Churn" },
  refund: { variant: "muted", label: "Refund" },
};

export default function AdminBillingPage() {
  return (
    <div className="space-y-8">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">
          Billing & Revenue
        </h1>
        <p className="mt-1 text-surface-700">
          Revenue metrics, subscription distribution, and billing activity.
        </p>
      </div>

      {/* ── Revenue stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value={`$${revenueStats.mrr.toLocaleString()}`}
          change={`+${revenueStats.mrrChange}% vs last month`}
          changeType="positive"
          icon={DollarSign}
        />
        <StatCard
          title="Annual Run Rate"
          value={`$${revenueStats.arr.toLocaleString()}`}
          change={`+${revenueStats.arrChange}% YoY`}
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Avg Revenue / User"
          value={`$${revenueStats.avgRevenuePerUser}`}
          change="Paid users only"
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          title="Monthly Churn"
          value={`${revenueStats.churnRate}%`}
          change="Target < 3%"
          changeType={revenueStats.churnRate < 3 ? "positive" : "negative"}
          icon={CreditCard}
        />
      </div>

      {/* ── Additional metrics ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Card className="p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2.5">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-surface-600">Customer LTV</p>
              <p className="text-xl font-bold text-surface-900">
                ${revenueStats.ltv}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-500/10 p-2.5">
              <Users className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <p className="text-xs text-surface-600">Total Customers</p>
              <p className="text-xl font-bold text-surface-900">
                {revenueStats.totalCustomers.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2.5">
              <CreditCard className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-surface-600">Paid Conversion</p>
              <p className="text-xl font-bold text-surface-900">40.4%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Subscription distribution ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-surface-600" />
            <div>
              <CardTitle>Subscription Distribution</CardTitle>
              <CardDescription>
                Breakdown by plan tier across{" "}
                {revenueStats.totalCustomers.toLocaleString()} customers
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bar chart placeholder */}
          <div className="space-y-4">
            {subscriptionDist.map((tier) => (
              <div key={tier.plan} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-surface-800">
                    {tier.plan}
                  </span>
                  <span className="text-surface-600">
                    {tier.count.toLocaleString()} users ({tier.pct}%)
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-surface-300">
                  <div
                    className={`h-full rounded-full ${tier.color} transition-all duration-500`}
                    style={{ width: `${tier.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Recent billing events ───────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-surface-600" />
            <div>
              <CardTitle>Recent Billing Events</CardTitle>
              <CardDescription>
                Payments, upgrades, cancellations, and refunds
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {billingEvents.map((evt) => {
              const badge = eventBadge[evt.type];
              const isNegative = evt.type === "failure" || evt.type === "churn" || evt.type === "refund";

              return (
                <div
                  key={evt.id}
                  className="flex flex-col gap-2 rounded-lg border border-surface-300 bg-surface-50 p-3.5 transition-colors hover:bg-surface-200 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-surface-800">
                        {evt.event}
                      </p>
                      <p className="text-xs text-surface-600">
                        {evt.user} — {evt.detail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span
                      className={`flex items-center gap-1 text-sm font-semibold ${
                        isNegative ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {isNegative ? (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      )}
                      {evt.amount}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-surface-500" />
                      <span className="text-xs text-surface-500 whitespace-nowrap">
                        {evt.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

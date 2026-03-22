"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from "@marketpilot/ui";
import { Copy, Share2, Twitter, Users, Gift, CheckCircle } from "lucide-react";
import { api } from "@/lib/api-client";

interface ReferralData {
  referralCode: string | null;
  stats: {
    totalReferred: number;
    converted: number;
    creditsEarned: number;
  };
  referrals: Array<{
    id: string;
    referredId: string;
    status: string;
    creditAmount: number | null;
    createdAt: string;
    convertedAt: string | null;
  }>;
}

const REFERRAL_BASE_URL = "https://marketpilot-six.vercel.app/signup?ref=";

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchReferrals = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: ReferralData }>(
        "/api/referrals"
      );
      setData(res.data);
    } catch {
      // User may not have referral data yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const res = await api.post<{
        success: boolean;
        data: { referralCode: string };
      }>("/api/referrals/generate");
      if (res.data.referralCode) {
        await fetchReferrals();
      }
    } catch {
      // Handle error silently
    } finally {
      setGenerating(false);
    }
  };

  const referralLink = data?.referralCode
    ? `${REFERRAL_BASE_URL}${data.referralCode}`
    : "";

  const copyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const tweet = encodeURIComponent(
      `I'm using MarketPilot AI for prediction market trading. Join me and get started for free! ${referralLink}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweet}`, "_blank");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Referrals</h1>
          <p className="text-surface-600 mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Referrals</h1>
        <p className="text-surface-600 mt-1">
          Invite friends and earn credits when they sign up
        </p>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>
            Share this link with friends to earn referral credits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.referralCode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg bg-surface-100 border border-surface-300 px-4 py-3 text-sm text-surface-800 font-mono truncate">
                  {referralLink}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="muted" className="font-mono">
                  {data.referralCode}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyLink}>
                  <Share2 className="h-4 w-4" />
                  Copy Link
                </Button>
                <Button variant="outline" size="sm" onClick={shareOnTwitter}>
                  <Twitter className="h-4 w-4" />
                  Share on X
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-surface-600 mb-4">
                Generate your referral code to start inviting friends
              </p>
              <Button onClick={generateCode} disabled={generating}>
                {generating ? "Generating..." : "Generate Code"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/10">
                <Users className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <p className="text-sm text-surface-600">People Referred</p>
                <p className="text-2xl font-bold text-surface-900">
                  {data?.stats.totalReferred ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600/10">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-surface-600">Conversions</p>
                <p className="text-2xl font-bold text-surface-900">
                  {data?.stats.converted ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-600/10">
                <Gift className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-surface-600">Credits Earned</p>
                <p className="text-2xl font-bold text-surface-900">
                  ${(data?.stats.creditsEarned ?? 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>
            Track the status of your referrals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.referrals && data.referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-300">
                    <th className="text-left py-3 px-4 text-surface-600 font-medium">
                      Referred User
                    </th>
                    <th className="text-left py-3 px-4 text-surface-600 font-medium">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-surface-600 font-medium">
                      Credit
                    </th>
                    <th className="text-left py-3 px-4 text-surface-600 font-medium">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.referrals.map((referral) => (
                    <tr
                      key={referral.id}
                      className="border-b border-surface-200"
                    >
                      <td className="py-3 px-4 text-surface-800 font-mono text-xs">
                        {referral.referredId.slice(0, 12)}...
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            referral.status === "converted"
                              ? "success"
                              : "muted"
                          }
                          className={
                            referral.status === "converted"
                              ? "bg-green-600/10 text-green-400 border-green-600/20"
                              : referral.status === "pending"
                                ? "bg-yellow-600/10 text-yellow-400 border-yellow-600/20"
                                : "bg-surface-200 text-surface-600"
                          }
                        >
                          {referral.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-surface-800">
                        {referral.creditAmount != null
                          ? `$${referral.creditAmount.toFixed(2)}`
                          : "--"}
                      </td>
                      <td className="py-3 px-4 text-surface-600">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-surface-600">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No referrals yet. Share your link to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

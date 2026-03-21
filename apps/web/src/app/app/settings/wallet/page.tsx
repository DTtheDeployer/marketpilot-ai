"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
} from "@marketpilot/ui";
import {
  Wallet,
  Link as LinkIcon,
  Globe,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function WalletPage() {
  const { user } = useAuthStore();

  const jurisdictionStatus = user?.profile?.jurisdictionStatus ?? "UNCHECKED";
  const country = user?.profile?.country ?? "Not set";

  const jurisdictionBadge = () => {
    switch (jurisdictionStatus) {
      case "ELIGIBLE":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Eligible
          </Badge>
        );
      case "RESTRICTED":
        return <Badge variant="danger" className="gap-1">Restricted</Badge>;
      default:
        return <Badge variant="warning" className="gap-1">Unchecked</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Wallet</h1>
        <p className="text-sm text-surface-700 mt-1">
          Connect your wallet, verify jurisdiction, and acknowledge risk disclosures
        </p>
      </div>

      {/* Connect wallet */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-brand-400" />
            <CardTitle>Connect Wallet</CardTitle>
          </div>
          <CardDescription>
            Required for live trading. Paper trading does not require a wallet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 rounded-lg border-2 border-dashed border-surface-400 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-brand-500/10 p-4 mb-4">
              <LinkIcon className="h-8 w-8 text-brand-400" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900 mb-1">
              No Wallet Connected
            </h3>
            <p className="text-sm text-surface-700 max-w-sm mb-6">
              Connect a supported Polygon wallet to enable live execution on
              prediction markets. You remain in full custody of your funds.
            </p>
            <div className="flex items-center gap-3">
              <Button className="gap-2">
                <Wallet className="h-4 w-4" />
                Connect MetaMask
              </Button>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                WalletConnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jurisdiction */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-brand-400" />
              <CardTitle>Jurisdiction Status</CardTitle>
            </div>
            {jurisdictionBadge()}
          </div>
          <CardDescription>
            Your eligibility status based on jurisdiction verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-200/50 border border-surface-300">
              <div>
                <p className="text-sm font-medium text-surface-900">Country</p>
                <p className="text-xs text-surface-700">{country}</p>
              </div>
              <Badge
                variant={jurisdictionStatus === "ELIGIBLE" ? "success" : "warning"}
                className="text-[10px]"
              >
                {jurisdictionStatus === "ELIGIBLE" ? "Verified" : jurisdictionStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-200/50 border border-surface-300">
              <div>
                <p className="text-sm font-medium text-surface-900">Paper Trading</p>
                <p className="text-xs text-surface-700">Available in all jurisdictions</p>
              </div>
              <Badge variant="success" className="text-[10px]">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-200/50 border border-surface-300">
              <div>
                <p className="text-sm font-medium text-surface-900">Live Trading</p>
                <p className="text-xs text-surface-700">Requires Elite plan + wallet</p>
              </div>
              <Badge variant="warning" className="text-[10px]">Pending</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk acknowledgement */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <CardTitle>Risk Acknowledgement</CardTitle>
          </div>
          <CardDescription>
            Required before enabling live trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <p className="text-sm text-surface-800 leading-relaxed">
                Trading on prediction markets involves significant risk. You may lose
                some or all of your invested capital. Past performance (including
                backtests and paper trading results) does not guarantee future results.
                MarketPilot AI provides automation tools only and does not provide
                financial advice.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "I understand that prediction market trading involves risk of loss",
                "I acknowledge that automated strategies can produce losses",
                "I confirm that I am not using borrowed funds",
                "I have read and agree to the Terms of Service and Risk Disclosure",
              ].map((item, i) => (
                <label
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-surface-200/50 border border-surface-300 cursor-pointer hover:bg-surface-200 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-surface-400 text-brand-500 focus:ring-brand-500 bg-surface-100"
                    defaultChecked={i < 2}
                  />
                  <span className="text-sm text-surface-800">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Submit Acknowledgement
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

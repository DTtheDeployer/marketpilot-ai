import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from "@marketpilot/ui";
import {
  Lock,
  ShieldCheck,
  Eye,
  Server,
  KeyRound,
  FileCheck,
  Fingerprint,
  Globe,
} from "lucide-react";

const practices = [
  {
    icon: Lock,
    title: "Non-Custodial Architecture",
    description:
      "MarketPilot never holds your funds. All trades execute through your connected wallet. You maintain full custody and control of your capital at all times.",
  },
  {
    icon: KeyRound,
    title: "Encryption at Rest and in Transit",
    description:
      "All data is encrypted using AES-256 at rest and TLS 1.3 in transit. API keys and wallet connection tokens are stored in isolated, encrypted vaults.",
  },
  {
    icon: Fingerprint,
    title: "Authentication and Access Control",
    description:
      "Multi-factor authentication support, session management with automatic expiry, and role-based access controls for all platform features.",
  },
  {
    icon: Server,
    title: "Infrastructure Security",
    description:
      "Hosted on SOC 2-compliant cloud infrastructure with network isolation, automated patching, and continuous vulnerability scanning.",
  },
  {
    icon: Eye,
    title: "Audit Logging",
    description:
      "Every action — strategy deployment, configuration change, order execution — is logged with timestamps and immutable audit trails.",
  },
  {
    icon: FileCheck,
    title: "Smart Contract Interaction",
    description:
      "All on-chain interactions use well-audited prediction market contracts. MarketPilot does not deploy custom smart contracts that hold user funds.",
  },
  {
    icon: ShieldCheck,
    title: "Risk Control Enforcement",
    description:
      "Risk limits are enforced server-side. Even if a client-side interface is compromised, backend safeguards prevent unauthorized trades or parameter changes.",
  },
  {
    icon: Globe,
    title: "Jurisdictional Compliance",
    description:
      "Automated eligibility checks ensure users from restricted jurisdictions cannot access live trading features, protecting both users and the platform.",
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Badge variant="default" className="mb-6">
            Security
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-900">
            Security and Data Protection
          </h1>
          <p className="mt-6 text-lg text-surface-700 max-w-2xl mx-auto">
            MarketPilot is built with a security-first architecture. Your funds
            stay in your wallet. Your data is encrypted. Every action is
            auditable.
          </p>
        </div>
      </section>

      {/* ── Practices ─────────────────────────────────────────────────── */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {practices.map((practice) => (
              <Card key={practice.title}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-brand-600/10 flex items-center justify-center shrink-0">
                      <practice.icon className="h-5 w-5 text-brand-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {practice.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {practice.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Responsible Disclosure ─────────────────────────────────────── */}
      <section className="border-t border-surface-300 py-20 bg-surface-50">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-surface-900 mb-4">
            Responsible Disclosure
          </h2>
          <p className="text-surface-700 leading-relaxed">
            If you discover a security vulnerability, please report it
            responsibly to{" "}
            <a
              href="mailto:security@marketpilot.ai"
              className="text-brand-400 hover:text-brand-500 underline"
            >
              security@marketpilot.ai
            </a>
            . We take all reports seriously and will respond within 48 hours. We
            do not pursue legal action against researchers who report
            vulnerabilities in good faith.
          </p>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/auth-provider";
import {
  OrganizationSchema,
  SoftwareApplicationSchema,
} from "@/components/shared/json-ld";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://marketpilot-six.vercel.app"),
  title: {
    default: "MarketPilot AI — Prediction Market Strategy Automation",
    template: "%s | MarketPilot AI",
  },
  description:
    "Research, simulate, and deploy automated prediction-market strategies with institutional-grade risk controls. Paper trading, backtesting, and live execution.",
  keywords: [
    "prediction markets",
    "polymarket",
    "trading bot",
    "automated trading",
    "paper trading",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "MarketPilot AI",
    title: "MarketPilot AI — Prediction Market Strategy Automation",
    description:
      "Research, simulate, and deploy automated prediction-market strategies with institutional-grade risk controls.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MarketPilot AI" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@marketpilotai",
    title: "MarketPilot AI — Prediction Market Strategy Automation",
    description:
      "Research, simulate, and deploy automated prediction-market strategies with institutional-grade risk controls.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#09090b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <OrganizationSchema />
        <SoftwareApplicationSchema />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

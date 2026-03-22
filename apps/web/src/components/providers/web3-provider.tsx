"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { createConfig } from "wagmi";
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useState } from "react";

const config = getDefaultConfig({
  appName: "MarketPilot AI",
  // Get a free project ID at https://cloud.walletconnect.com
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "b1e3f1b3c3e3f1b3c3e3f1b3c3e3f1b3",
  chains: [polygon],
  transports: {
    [polygon.id]: http("https://polygon-bor-rpc.publicnode.com"),
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#6366f1",
            accentColorForeground: "white",
            borderRadius: "medium",
          })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

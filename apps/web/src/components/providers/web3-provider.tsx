"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { metaMask, coinbaseWallet, injected } from "wagmi/connectors";
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const walletConnectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID;

// If a real WalletConnect project ID is configured, use RainbowKit's full
// config which enables QR-code scanning and WalletConnect-compatible wallets.
// Otherwise fall back to direct injected connectors (MetaMask, Coinbase, etc.)
// which work without a WalletConnect project ID.
const config = walletConnectId
  ? getDefaultConfig({
      appName: "MarketPilot AI",
      projectId: walletConnectId,
      chains: [polygon],
      transports: {
        [polygon.id]: http("https://polygon-bor-rpc.publicnode.com"),
      },
      ssr: true,
    })
  : createConfig({
      connectors: [
        metaMask({
          dappMetadata: {
            name: "MarketPilot AI",
            url: typeof window !== "undefined" ? window.location.origin : "",
          },
        }),
        coinbaseWallet({ appName: "MarketPilot AI" }),
        injected(),
      ],
      chains: [polygon],
      transports: {
        [polygon.id]: http("https://polygon-bor-rpc.publicnode.com"),
      },
      ssr: true,
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
          initialChain={polygon}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { createConfig } from "wagmi";
import {
  RainbowKitProvider,
  darkTheme,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
} from "@rainbow-me/rainbowkit/wallets";
import "@rainbow-me/rainbowkit/styles.css";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, walletConnectWallet, coinbaseWallet],
    },
  ],
  {
    appName: "MarketPilot AI",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "marketpilot",
  }
);

const config = createConfig({
  connectors,
  chains: [polygon],
  transports: {
    [polygon.id]: http("https://polygon-bor-rpc.publicnode.com"),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#6366f1",
            accentColorForeground: "white",
            borderRadius: "medium",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

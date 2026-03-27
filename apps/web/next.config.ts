import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@marketpilot/ui", "@marketpilot/types", "@marketpilot/database"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "polymarket.com" },
      { protocol: "https", hostname: "**.polymarket.com" },
    ],
  },
};

export default nextConfig;

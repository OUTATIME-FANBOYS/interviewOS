import type { NextConfig } from "next";

const isCapacitor = process.env.BUILD_TARGET === "capacitor";

const nextConfig: NextConfig = {
  ...(isCapacitor ? { output: "export" } : {}),
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;

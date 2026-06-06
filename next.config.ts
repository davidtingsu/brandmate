import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["weave", "redis"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep heavy / telemetry deps out of webpack vendor chunks (avoids missing @opentelemetry.js in dev)
  serverExternalPackages: [
    "weave",
    "redis",
    "@copilotkit/runtime",
    "@opentelemetry/api",
    "@opentelemetry/sdk-trace-base",
    "@supabase/supabase-js",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;

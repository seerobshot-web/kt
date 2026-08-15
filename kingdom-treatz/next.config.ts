import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained server bundle at .next/standalone/server.js
  // NOTE: Next.js does NOT copy public/ or .next/static into standalone.
  // The `postbuild` script in package.json handles that copy step.
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;

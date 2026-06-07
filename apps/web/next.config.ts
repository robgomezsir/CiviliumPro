import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@civilium/shared"],
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core"],
};

export default nextConfig;

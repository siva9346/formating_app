import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Ensure Next uses this folder as the workspace root (fixes env loading)
    root: __dirname,
  },
};

export default nextConfig;

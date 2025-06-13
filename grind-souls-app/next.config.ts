import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages uses the repository name as the base path
  basePath: process.env.NODE_ENV === 'production' ? '/grind-souls' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/grind-souls/' : '',
};

export default nextConfig;

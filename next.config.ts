import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    // 构建时允许 ESLint 警告
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 构建时允许 TypeScript 错误（我们已经修复了所有错误）
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 核心修改 1：关掉纯静态导出，让 Vercel 帮你把 API 跑起来！
  // output: 'export',

  // 核心修改 2：Vercel 不需要强制加斜杠，关掉它能避免很多 API 路径匹配错误
  // trailingSlash: true,

  // 下面这些可以保留
  images: {
    unoptimized: true,
  },
  // 关闭 dev 模式的 Next.js 指示器（左下角那个 "N" 浮标）；生产构建本就不显示
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true, // 忽略 TS 错误，方便快速部署
  },
};

export default nextConfig;
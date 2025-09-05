/** @type {import('next').NextConfig} */
const nextConfig = {
  // 服务器模式：支持API路由和服务端功能
  // 启用standalone输出以减少Docker镜像大小
  output: 'standalone',
  images: {
    unoptimized: true,
    // 支持外部图片域名
    domains: ['localhost', 'your-domain.com', 'images.unsplash.com'],
    // 支持不同格式
    formats: ['image/webp', 'image/avif'],
  },
  // 禁用 trailingSlash 以避免 admin 界面 301 重定向问题
  trailingSlash: false,
  // 环境变量配置
  env: {
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  },
  // 实验性功能：支持服务器组件
  experimental: {
    serverComponentsExternalPackages: ['sharp']
  }
}

module.exports = nextConfig 
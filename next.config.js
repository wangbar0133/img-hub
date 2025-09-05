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
  // 移除 env 配置，让 API 路由在运行时读取环境变量
  // 实验性功能：支持服务器组件
  experimental: {
    serverComponentsExternalPackages: ['sharp']
  }
}

module.exports = nextConfig 
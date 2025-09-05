/** @type {import('next').NextConfig} */
const nextConfig = {
  // 服务器模式：支持API路由和服务端功能
  // 注释掉静态导出以支持admin API功能
  // ...(process.env.NODE_ENV === 'development' ? {} : { output: 'export' }),
  images: {
    unoptimized: true,
    // 支持外部图片域名
    domains: ['localhost', 'your-domain.com', 'images.unsplash.com'],
    // 支持不同格式
    formats: ['image/webp', 'image/avif'],
  },
  trailingSlash: true,
  // 服务器模式不需要assetPrefix
  // assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // 使用默认构建目录
  // distDir: 'out',
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
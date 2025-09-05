/** @type {import('next').NextConfig} */
const nextConfig = {
  // 条件性配置：开发环境支持服务端功能，生产环境静态导出
  ...(process.env.NODE_ENV === 'development' ? {} : { output: 'export' }),
  images: {
    unoptimized: true,
    // 支持外部图片域名
    domains: ['localhost', 'your-domain.com', 'images.unsplash.com'],
    // 支持不同格式
    formats: ['image/webp', 'image/avif'],
  },
  trailingSlash: true,
  // 修复assetPrefix问题 - 生产环境用相对路径，开发环境为空
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  distDir: 'out',
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
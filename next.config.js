/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
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
  distDir: 'out'
}

module.exports = nextConfig 
/**
 * 智能获取网站的基础URL
 * 支持多种部署环境：开发、预览、生产
 */
export function getBaseUrl(): string {
  // 1. 优先使用环境变量中的配置
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // 2. Vercel 自动检测
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // 3. Netlify 自动检测
  if (process.env.URL) {
    return process.env.URL
  }

  // 4. Railway 自动检测
  if (process.env.RAILWAY_STATIC_URL) {
    return process.env.RAILWAY_STATIC_URL
  }

  // 5. 其他常见平台环境变量
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL
  }

  // 6. 开发环境检测
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.NEXT_PUBLIC_DEV_PORT || process.env.PORT || '3000'
    return `http://localhost:${port}`
  }

  // 7. 生产环境默认使用实际的线上域名
  if (process.env.NODE_ENV === 'production') {
    return 'http://img.neicun.online'
  }

  // 8. 构建时默认值
  return 'http://localhost:3000'
}

/**
 * 获取完整的资源URL
 * @param path 资源路径，如 '/favicon.ico'
 */
export function getAssetUrl(path: string): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * 检查是否为生产环境
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
} 
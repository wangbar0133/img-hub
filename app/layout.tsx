import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getBaseUrl } from '@/lib/metadata'

// 单独的 viewport 配置
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#667eea',
}

export const metadata: Metadata = {
  // 智能获取 metadataBase，支持所有环境
  metadataBase: new URL(getBaseUrl()),
  title: 'ImgHub - 摄影作品集',
  description: '展示精美摄影作品的个人作品集网站',
  keywords: '摄影,作品集,艺术,创意,Portfolio',
  authors: [{ name: 'Your Name' }],
  // 网站图标配置
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  // Web App Manifest
  manifest: '/manifest.json',
  // 其他配置
  other: {
    'msapplication-TileColor': '#667eea',
    'msapplication-TileImage': '/android-chrome-192x192.png',
  },
  openGraph: {
    title: 'ImgHub - 摄影作品集',
    description: '展示精美摄影作品的个人作品集网站',
    type: 'website',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'ImgHub - 摄影作品集',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'ImgHub - 摄影作品集',
    description: '展示精美摄影作品的个人作品集网站',
    images: ['/android-chrome-512x512.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 额外的图标链接（确保兼容性） */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* 移动端 Web App 配置 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ImgHub" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* PWA 相关 */}
        <meta name="application-name" content="ImgHub" />
        <meta name="msapplication-tooltip" content="摄影作品集展示平台" />
        <meta name="msapplication-starturl" content="/" />
        <meta name="msapplication-navbutton-color" content="#667eea" />
        <meta name="msapplication-TileColor" content="#667eea" />
        <meta name="msapplication-TileImage" content="/android-chrome-192x192.png" />
      </head>
      <body className="font-sans">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
} 
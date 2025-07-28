import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'ImgHub - 摄影作品集',
  description: '展示精美摄影作品的个人作品集网站',
  keywords: '摄影,作品集,艺术,创意,Portfolio',
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'ImgHub - 摄影作品集',
    description: '展示精美摄影作品的个人作品集网站',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
} 
'use client'

import { Camera } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (item: any) => {
    if (item.type === 'link') {
      router.push(item.href)
    } else if (item.type === 'scroll') {
      // 如果当前不在首页，先跳转到首页再滚动
      if (pathname !== '/') {
        router.push(`/${item.href}`)
      } else {
        const element = document.querySelector(item.href)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }

  return (
    <footer className="bg-photo-dark text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo and Description */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <Camera className="w-8 h-8" />
              <span className="text-xl font-bold">ImgHub</span>
            </Link>
            <p className="text-gray-300 leading-relaxed text-lg">
              用镜头记录世界的美好
            </p>
            <p className="text-gray-400 mt-2">
              每一张照片都是一个故事，每一个瞬间都值得珍藏
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">探索</h3>
            <ul className="space-y-3">
              {[
                { name: '首页', href: '/', type: 'link' },
                { name: '所有影集', href: '/albums', type: 'link' },
                { name: '旅行摄影', href: '/albums?category=travel', type: 'link' },
                { name: 'Cosplay摄影', href: '/albums?category=cosplay', type: 'link' },
              ].map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleNavigation(link)}
                    className="text-gray-300 hover:text-white transition-colors text-left text-base"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Photo Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-6">作品统计</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">影集数量</span>
                <span className="text-white font-medium">6+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">精美照片</span>
                <span className="text-white font-medium">40+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">摄影分类</span>
                <span className="text-white font-medium">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">持续更新</span>
                <span className="text-green-400 font-medium">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-300">
            <span>© {currentYear} ImgHub</span>
            <span className="mx-2">•</span>
            <span>用心记录每一个美好瞬间</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Powered by Next.js & Docker
          </p>
        </div>
      </div>
    </footer>
  )
} 
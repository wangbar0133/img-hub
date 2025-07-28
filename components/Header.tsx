'use client'

import { useState, useEffect } from 'react'
import { Camera, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: '首页', href: '/', type: 'link' },
    { name: '影集', href: '/albums', type: 'link' },
  ]

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
    setIsMenuOpen(false)
  }

  // 判断是否在影集相关页面
  const isAlbumPage = pathname.startsWith('/albums')

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled || isAlbumPage
          ? 'bg-white shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Camera className={`w-8 h-8 ${isScrolled || isAlbumPage ? 'text-photo-dark' : 'text-white'}`} />
            <span className={`text-xl font-bold ${isScrolled || isAlbumPage ? 'text-photo-dark' : 'text-white'}`}>
              ImgHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item)}
                className={`font-medium transition-colors hover:text-gray-700 ${
                  isScrolled || isAlbumPage ? 'text-photo-dark' : 'text-white'
                } ${
                  (item.type === 'link' && pathname === item.href) ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden ${isScrolled || isAlbumPage ? 'text-photo-dark' : 'text-white'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md rounded-lg p-4 mb-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  className={`text-photo-dark font-medium text-left hover:text-gray-600 transition-colors ${
                    (item.type === 'link' && pathname === item.href) ? 'text-blue-600' : ''
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

// 条件渲染Header的组件
export default function ConditionalHeader() {
  const pathname = usePathname()
  
  // 只在首页显示Header
  if (pathname === '/') {
    return <Header />
  }
  
  return null
} 
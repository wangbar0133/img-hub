'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAllAlbums } from '@/data/albums'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [albums, setAlbums] = useState(getAllAlbums())

  useEffect(() => {
    // 模拟加载时间
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-photo-light">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-photo-dark border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-photo-dark font-medium">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center bg-gradient-to-br from-photo-dark to-photo-gray -mt-16">
        <div className="text-center text-white px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 lg:mb-6 animate-fade-in">
            ImgHub
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-light mb-3 lg:mb-4 animate-fade-in">
            用镜头记录世界的美好
          </p>
          <div className="flex justify-center animate-fade-in px-4">
            <Link 
              href="/albums"
              className="bg-white text-photo-dark px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors text-lg"
            >
              浏览影集
            </Link>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Featured Albums Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-photo-dark mb-4">
            精选影集
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {albums.filter(album => album.featured).map((album, index) => (
              <Link 
                key={album.id}
                href={`/albums/${album.id}`}
                className={`relative group cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 block ${
                  index === 0 ? 'md:col-span-2 h-80' : 'h-60'
                }`}
              >
                <img
                  src={album.coverImage}
                  alt={album.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300">
                  <div className="absolute inset-0 flex items-center justify-center text-center text-white p-6">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-4">{album.title}</h3>
                      <div className="inline-flex items-center space-x-2 text-sm bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <span>{album.photoCount} 张照片</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-12">
            <Link
              href="/albums"
              className="bg-photo-dark text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              查看所有影集
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 bg-photo-light">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-photo-dark mb-2">
                {albums.length}
              </div>
              <div className="text-gray-600 font-medium">影集作品</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-photo-dark mb-2">
                {albums.reduce((total, album) => total + album.photoCount, 0)}
              </div>
              <div className="text-gray-600 font-medium">精美照片</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-photo-dark mb-2">
                6
              </div>
              <div className="text-gray-600 font-medium">摄影分类</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-photo-dark mb-2">
                5+
              </div>
              <div className="text-gray-600 font-medium">拍摄年限</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-photo-dark mb-4">
            摄影分类
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'travel', name: '旅行', count: albums.filter(a => a.category === 'travel').length },
              { id: 'cosplay', name: 'Cosplay', count: albums.filter(a => a.category === 'cosplay').length },
            ].map((category) => (
              <Link
                key={category.id}
                href={`/albums?category=${category.id}`}
                className="group"
              >
                <div className="bg-white rounded-lg p-4 shadow-sm group-hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 bg-photo-light rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-photo-dark font-bold text-sm">
                      {category.id === 'travel' ? '🧳' : '🎭'}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 text-center">{category.name}</h3>
                  <p className="text-xs text-gray-500 text-center mt-1">{category.count} 个影集</p>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-12">
            <Link
              href="/albums"
              className="inline-flex items-center space-x-2 text-photo-dark hover:text-gray-600 transition-colors"
            >
              <span>查看全部分类</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
      
    </>
  )
} 
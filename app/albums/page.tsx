'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AlbumGrid from '@/components/AlbumGrid'
import { getAllAlbums } from '@/data/albums'

export default function AlbumsPage() {
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get('category') || 'all'
  const [albums, setAlbums] = useState(getAllAlbums())

  return (
    <div className="min-h-screen bg-photo-light">
      {/* Breadcrumb and Back Button */}
      <div className="bg-gray-50 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link 
              href="/"
              className="hover:text-photo-dark transition-colors font-medium"
            >
              首页
            </Link>
            <span>/</span>
            <span className="text-photo-dark font-semibold">影集</span>
          </div>
          
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-photo-dark hover:text-gray-700 transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回首页</span>
          </Link>
          
          {/* Page Header */}
          <div className="text-center px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-photo-dark mb-4">
              摄影影集
            </h1>
            <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              用镜头记录世界的美好，每个影集都是一段独特的视觉故事。
              探索不同主题和风格的摄影作品，感受光影艺术的魅力。
            </p>
          </div>
        </div>
      </div>

      {/* Albums Grid */}
      <div className="py-12">
        <AlbumGrid albums={albums} selectedCategory={selectedCategory} />
      </div>
      
      {/* CTA Section */}
      <div className="bg-white py-12 lg:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-photo-dark mb-4">
            想要了解更多？
          </h2>
          <p className="text-gray-600 mb-6 lg:mb-8 text-sm lg:text-base">
            如果您对我的摄影作品有兴趣，或需要专业摄影服务，欢迎与我联系
          </p>
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center px-4">
            <Link
              href="/#about"
              className="bg-photo-dark text-white px-6 lg:px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors text-sm lg:text-base"
            >
              了解摄影师
            </Link>
            <Link
              href="/#contact"
              className="border-2 border-photo-dark text-photo-dark px-6 lg:px-8 py-3 rounded-full font-medium hover:bg-photo-dark hover:text-white transition-colors text-sm lg:text-base"
            >
              联系我们
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 
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
          </div>
        </div>
      </div>

      {/* Albums Grid */}
      <div className="py-12">
        <AlbumGrid albums={albums} selectedCategory={selectedCategory} />
      </div>
    </div>
  )
} 
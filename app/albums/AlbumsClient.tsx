'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AlbumGrid from '@/components/AlbumGrid'
import { Album } from '@/types'

interface AlbumsClientProps {
  initialAlbums: Album[]
}

export default function AlbumsClient({ initialAlbums }: AlbumsClientProps) {
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get('category') || 'all'
  const [albums, setAlbums] = useState<Album[]>(initialAlbums)
  const [loading, setLoading] = useState(false)

  // 动态加载 albums 数据
  useEffect(() => {
    const loadAlbums = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/albums')
        if (response.ok) {
          const data = await response.json()
          setAlbums(data)
        }
      } catch (error) {
        console.error('Failed to load albums:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAlbums()
  }, [])

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
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-photo-dark"></div>
            <span className="ml-3 text-photo-dark">加载影集中...</span>
          </div>
        )}
        <AlbumGrid albums={albums} selectedCategory={selectedCategory} />
      </div>
    </div>
  )
}
'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Image as ImageIcon, Star } from 'lucide-react'
import { Album } from '@/types'
import Link from 'next/link'
import { getAlbumCoverThumbnail, getAlbumPhotoCount, formatAlbumDate } from '@/lib/albumUtils'

interface FeaturedAlbumsSectionProps {
  albums: Album[]
}

export default function FeaturedAlbumsSection({ albums }: FeaturedAlbumsSectionProps) {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  // 图片加载处理
  const handleImageLoad = useCallback((albumId: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [albumId]: true
    }))

    setFailedImages(prev => {
      const newState = { ...prev }
      delete newState[albumId]
      return newState
    })
  }, [])

  const handleImageError = useCallback((albumId: string) => {
    setFailedImages(prev => ({
      ...prev,
      [albumId]: true
    }))
  }, [])

  const retryImageLoad = useCallback((albumId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    setFailedImages(prev => {
      const newState = { ...prev }
      delete newState[albumId]
      return newState
    })

    const imgElement = document.querySelector(`img[data-album-id="${albumId}"]`) as HTMLImageElement
    if (imgElement) {
      const originalSrc = imgElement.src.split('?')[0]
      imgElement.src = `${originalSrc}?t=${Date.now()}`
    }
  }, [])

  if (albums.length === 0) {
    return null
  }

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-yellow-500 mr-2" />
            <h2 className="text-3xl md:text-4xl font-bold text-photo-dark">
              精选影集
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            从众多作品中精心挑选的优秀影集，展现摄影艺术的精华
          </p>
        </div>

        {/* Featured Albums Grid - Masonry Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 lg:gap-8 space-y-6 lg:space-y-8">
          {albums.slice(0, 6).map((album, index) => {
            const isLoaded = loadedImages[album.id]
            const hasFailed = failedImages[album.id]
            const isLoading = !isLoaded && !hasFailed

            return (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group cursor-pointer break-inside-avoid"
              >
                <Link href={`/albums/${album.id}`}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                    {/* Album Cover */}
                    <div className="relative overflow-hidden bg-gray-100">

                      {/* 加载状态 */}
                      {isLoading && (
                        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-500">加载中...</p>
                          </div>
                        </div>
                      )}

                      {/* 失败状态 */}
                      {hasFailed && (
                        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 mb-2">图片加载失败</p>
                            <button
                              onClick={(e) => retryImageLoad(album.id, e)}
                              className="text-xs text-blue-600 hover:text-blue-800 bg-white px-2 py-1 rounded border"
                            >
                              点击重试
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 图片 */}
                      <img
                        data-album-id={album.id}
                        src={getAlbumCoverThumbnail(album)}
                        alt={album.title}
                        ref={(img) => {
                          if (img && img.complete && img.naturalWidth > 0 && !loadedImages[album.id]) {
                            handleImageLoad(album.id)
                          }
                        }}
                        className={`w-full h-auto object-cover transition-all duration-500 group-hover:scale-110 ${
                          isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoad(album.id)}
                        onError={() => handleImageError(album.id)}
                        loading="eager"
                      />

                      {/* Featured Badge */}
                      {isLoaded && (
                        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium z-20 flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          精选
                        </div>
                      )}

                      {/* Overlay */}
                      {isLoaded && (
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                    </div>

                    {/* Album Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-photo-dark mb-2 group-hover:text-gray-600 transition-colors">
                        {album.title}
                      </h3>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <ImageIcon className="w-4 h-4" />
                          <span>{getAlbumPhotoCount(album)} 张照片</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatAlbumDate(album.shot_time)}</span>
                        </div>
                      </div>

                      {/* Category Tag */}
                      <div className="mt-4">
                        <span className="inline-block px-3 py-1 bg-photo-light text-photo-dark text-xs rounded-full font-medium">
                          {album.category === 'travel' && '旅行'}
                          {album.category === 'cosplay' && 'Cosplay'}
                          {album.category !== 'travel' && album.category !== 'cosplay' && album.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href="/albums"
            className="inline-flex items-center space-x-2 bg-photo-dark text-white px-8 py-4 rounded-full font-medium hover:bg-gray-600 transition-colors text-lg"
          >
            <span>查看全部影集</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
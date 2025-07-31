'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Image as ImageIcon } from 'lucide-react'
import { Album } from '@/types'
import Link from 'next/link'

interface AlbumGridProps {
  albums: Album[]
  selectedCategory?: string
}

export default function AlbumGrid({ albums, selectedCategory = 'all' }: AlbumGridProps) {
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>(albums)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const categories = [
    { id: 'all', name: '全部影集', count: albums.length },
    { id: 'travel', name: '旅行', count: albums.filter(a => a.category === 'travel').length },
    { id: 'cosplay', name: 'Cosplay', count: albums.filter(a => a.category === 'cosplay').length },
  ]

  // 过滤影集
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredAlbums(albums)
    } else {
      setFilteredAlbums(albums.filter(album => album.category === selectedCategory))
    }
  }, [selectedCategory, albums])

  // 图片加载处理
  const handleImageLoad = useCallback((albumId: string) => {
    setLoadedImages(prev => {
      if (prev.has(albumId)) return prev
      const newSet = new Set(prev)
      newSet.add(albumId)
      return newSet
    })
    
    setFailedImages(prev => {
      if (!prev.has(albumId)) return prev
      const newSet = new Set(prev)
      newSet.delete(albumId)
      return newSet
    })
  }, [])

  const handleImageError = useCallback((albumId: string) => {
    setFailedImages(prev => {
      if (prev.has(albumId)) return prev
      const newSet = new Set(prev)
      newSet.add(albumId)
      return newSet
    })
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long'
    })
  }

  const retryImageLoad = useCallback((albumId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    setFailedImages(prev => {
      const newSet = new Set(prev)
      newSet.delete(albumId)
      return newSet
    })
    
    const imgElement = document.querySelector(`img[data-album-id="${albumId}"]`) as HTMLImageElement
    if (imgElement) {
      const originalSrc = imgElement.src.split('?')[0]
      imgElement.src = `${originalSrc}?t=${Date.now()}`
    }
  }, [])

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* 分类筛选器 */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-2 lg:gap-4 bg-white rounded-full p-2 shadow-lg">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/albums?category=${category.id}`}
                className={`px-4 lg:px-6 py-2 lg:py-3 rounded-full font-medium transition-all duration-300 text-sm lg:text-base ${
                  selectedCategory === category.id
                    ? 'bg-photo-dark text-white shadow-lg'
                    : 'text-gray-600 hover:text-photo-dark hover:bg-gray-50'
                }`}
              >
                {category.name}
                <span className="ml-2 text-xs opacity-75">({category.count})</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Albums Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredAlbums.map((album, index) => {
            const isLoaded = loadedImages.has(album.id)
            const hasFailed = failedImages.has(album.id)
            const isLoading = !isLoaded && !hasFailed
            
            return (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group cursor-pointer"
              >
                <Link href={`/albums/${album.id}`}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                    {/* Album Cover */}
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      
                      {/* 加载状态 */}
                      {isLoading && (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-500">加载中...</p>
                          </div>
                        </div>
                      )}
                      
                      {/* 失败状态 */}
                      {hasFailed && (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
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
                        src={album.coverImage}
                        alt={album.title}
                        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                          isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoad(album.id)}
                        onError={() => handleImageError(album.id)}
                        loading="eager"
                        style={{
                          minHeight: '100%',
                          minWidth: '100%'
                        }}
                      />
                      
                      {/* Featured Badge */}
                      {album.featured && isLoaded && (
                        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium z-20">
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
                          <span>{album.photoCount} 张照片</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(album.createdAt)}</span>
                        </div>
                      </div>
                      
                      {/* Category Tag */}
                      <div className="mt-4">
                        <span className="inline-block px-3 py-1 bg-photo-light text-photo-dark text-xs rounded-full font-medium">
                          {album.category === 'travel' && '旅行'}
                          {album.category === 'cosplay' && 'Cosplay'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredAlbums.length === 0 && (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无影集</h3>
            <p className="text-gray-500">该分类下还没有影集，敬请期待</p>
          </div>
        )}
      </div>
    </section>
  )
} 
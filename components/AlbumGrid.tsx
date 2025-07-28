'use client'

import { useState, useEffect } from 'react'
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

  const handleImageLoad = (albumId: string) => {
    setLoadedImages(prev => new Set(prev).add(albumId))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long'
    })
  }

  return (
    <section id="albums" className="py-8 px-4 bg-photo-light">
      <div className="max-w-7xl mx-auto">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 mb-8 lg:mb-12 px-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/albums?category=${category.id}`}
              className={`px-4 py-2 lg:px-6 lg:py-3 rounded-full font-medium transition-all hover:shadow-md text-sm lg:text-base ${
                selectedCategory === category.id
                  ? 'bg-photo-dark text-white shadow-lg'
                  : 'bg-white text-photo-dark hover:bg-gray-50'
              }`}
            >
              {category.name}
              {category.count > 0 && (
                <span className="ml-2 text-sm opacity-75">({category.count})</span>
              )}
            </Link>
          ))}
        </div>

        {/* Albums Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredAlbums.map((album, index) => (
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
                  <div className="relative h-64 overflow-hidden">
                    {!loadedImages.has(album.id) && (
                      <div className="absolute inset-0 bg-gray-200 image-loading flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                        loadedImages.has(album.id) ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => handleImageLoad(album.id)}
                      loading="lazy"
                    />
                    
                    {/* Featured Badge */}
                    {album.featured && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        精选
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
          ))}
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
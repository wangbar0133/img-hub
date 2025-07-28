'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Calendar, ImageIcon } from 'lucide-react'
import { Album } from '@/types'

interface AlbumDetailClientProps {
  album: Album
}

export default function AlbumDetailClient({ album }: AlbumDetailClientProps) {
  const params = useParams()
  const albumId = params.albumId as string
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

  // 获取缩略图源（优先使用缩略图，否则使用普通图片）
  const getThumbnailSrc = (photo: any) => {
    return photo.thumbnail || photo.src
  }

  const handleImageLoad = (photoId: number) => {
    setLoadedImages(prev => {
      const newSet = new Set(prev)
      newSet.add(photoId)
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Navigation */}
      <div className="bg-gray-50 shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <Link 
              href="/albums"
              className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors group font-medium"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">返回影集列表</span>
            </Link>
            
            <nav className="text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-800 font-medium">首页</Link>
              <span className="mx-2 text-gray-400">/</span>
              <Link href="/albums" className="hover:text-gray-800 font-medium">影集</Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900 font-semibold">{album.title}</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Album Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 lg:mb-6">
            {album.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8 text-gray-500 text-sm lg:text-base">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>{album.createdAt}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5" />
              <span>{album.photos.length} 张照片</span>
            </div>
          </div>
        </motion.div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {album.photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group cursor-pointer"
            >
              <Link href={`/albums/${albumId}/photos/${photo.id}`}>
                <div className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  {!loadedImages.has(photo.id) && (
                    <div className="absolute inset-0 bg-gray-200 image-loading flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <img
                    src={getThumbnailSrc(photo)}
                    alt={photo.alt}
                    className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                      loadedImages.has(photo.id) ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => handleImageLoad(photo.id)}
                    loading="lazy"
                  />
                  
                  {/* Quality Indicator */}
                  {photo.originalSrc && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      原图可用
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="text-white">
                      <h3 className="font-semibold text-sm truncate">{photo.title}</h3>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {album.photos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">暂无照片</h3>
            <p className="text-gray-500">这个影集还没有添加任何照片</p>
          </motion.div>
        )}
      </div>
    </div>
  )
} 
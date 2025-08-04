'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  Share2,
  Camera,
  Settings,
  Calendar,
  Maximize2,
  Tag,
} from 'lucide-react'
import { Album, Photo } from '@/types'
import FullScreenModal from '@/components/FullScreenModal'

interface PhotoDetailClientProps {
  album: Album
  photo: Photo
}

export default function PhotoDetailClient({ album, photo }: PhotoDetailClientProps) {
  const params = useParams()
  const router = useRouter()
  const albumId = params.albumId as string
  
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false)
  const [infoVisible, setInfoVisible] = useState(false)
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)

  // 获取详情页图片源（优先使用detailSrc 900p不裁切）
  const getDetailImageSrc = (photo: Photo) => {
    return photo.detailSrc || photo.src || photo.thumbnail
  }

  // 获取下载用的图片源（优先使用原始图片）
  const getDownloadImageSrc = (photo: Photo) => {
    return photo.originalSrc || photo.src
  }

  // 初始化当前照片索引
  useEffect(() => {
    const index = album.photos.findIndex(p => p.id === photo.id)
    setCurrentIndex(index)
  }, [album.photos, photo.id])

  const handlePrevPhoto = () => {
    if (currentIndex > 0) {
      const prevPhoto = album.photos[currentIndex - 1]
      router.push(`/albums/${albumId}/photos/${prevPhoto.id}`)
    }
  }

  const handleNextPhoto = () => {
    if (currentIndex < album.photos.length - 1) {
      const nextPhoto = album.photos[currentIndex + 1]
      router.push(`/albums/${albumId}/photos/${nextPhoto.id}`)
    }
  }

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    })
    setIsDragging(false)
    setDragOffset(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.x || !touchStart.y) return
    
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const deltaX = touchStart.x - currentX
    const deltaY = touchStart.y - currentY
    
    // 只处理水平滑动用于切换图片
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY)
    
    if (isHorizontalSwipe && Math.abs(deltaX) > 10) {
      setIsDragging(true)
      setDragOffset(-deltaX)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.x || !touchStart.y) return
    
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const deltaX = touchStart.x - endX
    const deltaY = touchStart.y - endY
    
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY)
    const swipeThreshold = 50
    
    if (isHorizontalSwipe && Math.abs(deltaX) > swipeThreshold) {
      // 水平滑动切换图片
      if (deltaX > 0 && currentIndex < album.photos.length - 1) {
        handleNextPhoto()
      } else if (deltaX < 0 && currentIndex > 0) {
        handlePrevPhoto()
      }
    }
    
    setIsDragging(false)
    setDragOffset(0)
    setTouchStart({ x: 0, y: 0 })
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    // 只在全屏模态框关闭时响应导航键
    if (isFullScreenOpen) return
    
    if (e.key === 'ArrowLeft') handlePrevPhoto()
    if (e.key === 'ArrowRight') handleNextPhoto()
    if (e.key === 'Escape') router.push(`/albums/${albumId}`)
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      setIsFullScreenOpen(true)
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [currentIndex, album, isFullScreenOpen])

  // 检测屏幕尺寸，决定是否使用移动端布局
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleDownload = async () => {
    try {
      const downloadSrc = getDownloadImageSrc(photo)
      const response = await fetch(downloadSrc)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${photo.title}_original.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      const link = document.createElement('a')
      link.href = getDownloadImageSrc(photo)
      link.download = `${photo.title}_original.jpg`
      link.target = '_blank'
      link.click()
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: photo.title,
        text: `欣赏摄影作品《${photo.title}》`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // 当前显示的图片源（使用缩略图）
  const displayImageSrc = getDetailImageSrc(photo)

  return (
    <div className="min-h-screen bg-black">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <Link 
              href={`/albums/${album.id}`}
              className="flex items-center space-x-3 text-white hover:text-gray-300 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm lg:text-base">返回影集</span>
            </Link>
            
            {/* Photo Counter */}
            <div className="text-gray-400 text-sm">
              {currentIndex + 1} / {album.photos.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="pt-14 min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {isMobile ? (
          /* 移动端布局 */
          <div className="relative h-[calc(100vh-3.5rem)] overflow-hidden">
            {/* 图片容器 - 全屏显示 */}
            <div 
              ref={containerRef}
              className="h-full flex items-center justify-center relative bg-black"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'pan-y' }}
            >
              {/* Loading State */}
              {!isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg text-gray-300 font-medium">加载中...</span>
                    <span className="text-sm text-gray-500">900p 详情画质</span>
                  </div>
                </div>
              )}
              
              {/* Main Image */}
              <motion.div 
                className="relative w-full h-full flex items-center justify-center px-4"
                animate={{ x: dragOffset }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <img
                  src={displayImageSrc}
                  alt={photo.alt}
                  className={`max-w-full max-h-full object-contain
                    transition-all duration-500
                    ${isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                  style={{ touchAction: 'manipulation' }}
                  onLoad={() => setIsImageLoaded(true)}
                  onClick={() => setIsFullScreenOpen(true)}
                />
              </motion.div>


              {/* 左右滑动指示 */}
              {isDragging && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                  bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full pointer-events-none">
                  <span className="text-sm">
                    {dragOffset > 0 ? '← 上一张' : '下一张 →'}
                  </span>
                </div>
              )}
            </div>

            {/* 可滑动的信息面板 */}
            <motion.div
              ref={infoRef}
              initial={{ y: "100%" }}
              animate={{ y: infoVisible ? "0%" : "90%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-gray-800
                border-t border-gray-700 rounded-t-3xl min-h-[50vh] max-h-[80vh] overflow-hidden"
              style={{ touchAction: 'pan-y' }}
            >
              {/* 拖拽手柄 */}
              <div 
                className="flex justify-center py-3 cursor-pointer"
                onClick={() => setInfoVisible(!infoVisible)}
              >
                <motion.div 
                  className="w-12 h-1 bg-gray-500 rounded-full"
                  animate={{ rotate: infoVisible ? 180 : 0 }}
                />
              </div>

              {/* 信息内容 */}
              <div className="px-6 pb-6 overflow-y-auto max-h-[calc(80vh-4rem)]">
                {/* Photo Title */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-white mb-2">{photo.title}</h1>
                  <div className="flex items-center justify-center space-x-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">拍摄作品</span>
                  </div>
                </div>

                {/* 其余信息内容保持不变，但适配移动端 */}
                {photo.camera && (
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mb-6">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-blue-600/20 rounded-lg">
                        <Camera className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{photo.camera}</p>
                        <p className="text-gray-400 text-sm">相机设备</p>
                      </div>
                    </div>
                    {photo.settings && (
                      <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-700/50">
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">{photo.settings}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tags */}
                {photo.tags && photo.tags.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm font-medium">标签</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {photo.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full 
                            border border-blue-600/30"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => setIsFullScreenOpen(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 
                      text-white px-6 py-3 rounded-xl font-medium
                      flex items-center justify-center space-x-2"
                  >
                    <Maximize2 className="w-5 h-5" />
                    <span>全屏查看原图</span>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleDownload}
                      className="bg-green-600/20 text-green-300 
                        px-4 py-3 rounded-xl font-medium
                        flex items-center justify-center space-x-2 border border-green-600/30"
                    >
                      <Download className="w-4 h-4" />
                      <span>下载</span>
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="bg-purple-600/20 text-purple-300 
                        px-4 py-3 rounded-xl font-medium
                        flex items-center justify-center space-x-2 border border-purple-600/30"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>分享</span>
                    </button>
                  </div>
                </div>

                {/* 移动端操作提示 */}
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 mt-6">
                  <div className="text-center text-gray-400 text-sm space-y-1">
                    <p>左右滑动切换照片</p>
                    <p>点击拖拽手柄展开/收起详情</p>
                    <p>点击图片查看原图</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          /* 桌面端布局保持不变 */
          <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)]">
            
            {/* Photo Display Area */}
            <div className="flex-1 flex items-center justify-center relative bg-black/50 p-4 lg:p-8">
              <div className="relative w-full h-full flex items-center justify-center">
                
                {/* Loading State */}
                {!isImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-lg text-gray-300 font-medium">加载中...</span>
                      <span className="text-sm text-gray-500">900p 详情画质</span>
                    </div>
                  </div>
                )}
                
                {/* Main Image */}
                <div className="relative group cursor-pointer">
                  <img
                    src={displayImageSrc}
                    alt={photo.alt}
                    className={`max-w-full max-h-[60vh] lg:max-h-[calc(100vh-8rem)] object-contain 
                      transition-all duration-500 rounded-lg shadow-2xl
                      ${isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                      group-hover:shadow-blue-500/20`}
                    style={{ touchAction: 'none' }}
                    onLoad={() => setIsImageLoaded(true)}
                    onClick={() => setIsFullScreenOpen(true)}
                  />
                  
                  {/* Hover Overlay */}
                  {isImageLoaded && (
                    <div 
                      className="absolute inset-0 cursor-pointer flex items-center justify-center 
                        opacity-0 group-hover:opacity-100 transition-all duration-300 
                        bg-gradient-to-t from-black/60 via-transparent to-black/30 rounded-lg"
                      onClick={() => setIsFullScreenOpen(true)}
                    >
                      <div className="bg-blue-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-full 
                        flex items-center space-x-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <Maximize2 className="w-5 h-5" />
                        <span className="text-sm font-medium">查看原图</span>
                      </div>
                    </div>
                  )}
                </div>
                
              </div>
            </div>

          {/* Info Sidebar */}
          <div className="w-full lg:w-96 bg-gradient-to-b from-gray-900 to-black 
            overflow-y-auto h-auto lg:h-full max-h-[40vh] lg:max-h-none
            border-t lg:border-t-0 lg:border-l border-gray-800">
            
            <div className="p-6 space-y-6">
              
              {/* Mobile drag handle */}
              <div className="flex justify-center lg:hidden">
                <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
              </div>
              
              {/* Photo Title */}
              <div className="text-center lg:text-left">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{photo.title}</h1>
                <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">拍摄作品</span>
                </div>
              </div>
              
              {/* Camera Info */}
              {photo.camera && (
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <Camera className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{photo.camera}</p>
                      <p className="text-gray-400 text-sm">相机设备</p>
                    </div>
                  </div>
                  {photo.settings && (
                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-700/50">
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">{photo.settings}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {photo.tags && photo.tags.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm font-medium">标签</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {photo.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full 
                          border border-blue-600/30 hover:bg-blue-600/30 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setIsFullScreenOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                    text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 
                    flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
                >
                  <Maximize2 className="w-5 h-5" />
                  <span>全屏查看原图</span>
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDownload}
                    className="bg-green-600/20 hover:bg-green-600/30 text-green-300 
                      px-4 py-3 rounded-xl font-medium transition-all duration-300 
                      flex items-center justify-center space-x-2 border border-green-600/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>下载</span>
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 
                      px-4 py-3 rounded-xl font-medium transition-all duration-300 
                      flex items-center justify-center space-x-2 border border-purple-600/30"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>分享</span>
                  </button>
                </div>
              </div>
              
              {/* Navigation Hint */}
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <div className="text-center text-gray-400 text-sm space-y-1">
                  <p>使用 ← → 键切换照片</p>
                  <p>按空格键或点击图片查看原图</p>
                </div>
              </div>
              
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      {isFullScreenOpen && (
        <FullScreenModal
          photo={photo}
          isOpen={isFullScreenOpen}
          onClose={() => setIsFullScreenOpen(false)}
        />
      )}
    </div>
  )
} 
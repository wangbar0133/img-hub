'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, ZoomIn, ZoomOut, RotateCw, Share2 } from 'lucide-react'
import { Photo } from '@/types'

interface FullScreenModalProps {
  photo: Photo
  isOpen: boolean
  onClose: () => void
}

export default function FullScreenModal({ photo, isOpen, onClose }: FullScreenModalProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lastTouchDistance, setLastTouchDistance] = useState(0)
  const [isTouchZooming, setIsTouchZooming] = useState(false)

  // 获取原始图片源
  const getOriginalImageSrc = (photo: Photo) => {
    return photo.originalSrc || photo.src
  }

  // 计算两点距离 (用于触摸缩放)
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0
    const touch1 = touches[0]
    const touch2 = touches[1]
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }

  // 重置图片状态
  const resetImage = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setIsImageLoaded(false)
  }

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case '+':
        case '=':
          setZoom(prev => Math.min(prev * 1.2, 5))
          break
        case '-':
          setZoom(prev => Math.max(prev / 1.2, 0.1))
          break
        case '0':
          resetImage()
          break
        case 'r':
        case 'R':
          setRotation(prev => prev + 90)
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, onClose])

  // 鼠标拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // 单指拖拽
      if (zoom > 1) {
        setIsDragging(true)
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
        })
      }
    } else if (e.touches.length === 2) {
      // 双指缩放
      setIsTouchZooming(true)
      setLastTouchDistance(getTouchDistance(e.touches))
    }
  }

  // 触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    
    if (e.touches.length === 1 && isDragging && zoom > 1) {
      // 单指拖拽
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      })
    } else if (e.touches.length === 2 && isTouchZooming) {
      // 双指缩放
      const currentDistance = getTouchDistance(e.touches)
      if (lastTouchDistance > 0) {
        const scale = currentDistance / lastTouchDistance
        const newZoom = Math.max(0.1, Math.min(5, zoom * scale))
        setZoom(newZoom)
        
        if (newZoom <= 1) {
          setPosition({ x: 0, y: 0 })
        }
      }
      setLastTouchDistance(currentDistance)
    }
  }

  // 触摸结束
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsDragging(false)
      setIsTouchZooming(false)
      setLastTouchDistance(0)
      
      // 如果是简单点击且图片在默认状态，关闭模态框
      if (zoom <= 1.1 && rotation % 360 === 0 && !isDragging) {
        onClose()
      }
    } else if (e.touches.length === 1) {
      setIsTouchZooming(false)
      setLastTouchDistance(0)
    }
  }

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.1, Math.min(5, zoom * delta))
    setZoom(newZoom)
    
    // 当缩放变小时，重置位置到中心
    if (newZoom <= 1) {
      setPosition({ x: 0, y: 0 })
    }
  }

  // 处理图片点击 - 只有在默认缩放状态下才关闭
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // 如果图片被放大了，不关闭模态框（避免误操作）
    if (zoom > 1.1) return
    
    // 如果图片被旋转了，不关闭模态框
    if (rotation % 360 !== 0) return
    
    // 否则关闭模态框
    onClose()
  }

  // 下载原图
  const handleDownload = async () => {
    try {
      const downloadSrc = getOriginalImageSrc(photo)
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
      link.href = getOriginalImageSrc(photo)
      link.download = `${photo.title}_original.jpg`
      link.target = '_blank'
      link.click()
    }
  }

  // 分享功能
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

  // 当模态框关闭时重置状态
  useEffect(() => {
    if (!isOpen) {
      resetImage()
    }
  }, [isOpen])

  // 检查是否可以点击关闭（默认状态）
  const canClickToClose = zoom <= 1.1 && rotation % 360 === 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black"
          onClick={onClose}
        >
          {/* 纯净的图片容器 */}
          <div
            className="absolute inset-0 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ 
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : (canClickToClose ? 'pointer' : 'default'),
              touchAction: 'none'
            }}
          >
            {!isImageLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white/80 text-lg">加载中...</p>
              </div>
            )}
            
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onClick={handleImageClick}
            >
              <motion.img
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: isImageLoaded ? 1 : 0,
                  scale: isImageLoaded ? 1 : 0.9
                }}
                transition={{ duration: 0.3 }}
                src={getOriginalImageSrc(photo)}
                alt={photo.alt}
                className="max-w-full max-h-full object-contain"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
                onLoad={() => setIsImageLoaded(true)}
                draggable={false}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 
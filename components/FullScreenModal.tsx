'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, ZoomIn, ZoomOut, RotateCw, Share2, Info } from 'lucide-react'
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
  const [touchCenter, setTouchCenter] = useState({ x: 0, y: 0 })
  const [showControls, setShowControls] = useState(true)
  const [showExitHint, setShowExitHint] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

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

  // 计算两点中心
  const getTouchCenter = (touches: React.TouchList) => {
    if (touches.length < 2) return { x: 0, y: 0 }
    const touch1 = touches[0]
    const touch2 = touches[1]
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }

  // 重置图片状态
  const resetImage = useCallback(() => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setIsImageLoaded(false)
    setIsDragging(false)
    setIsTouchZooming(false)
    setLastTouchDistance(0)
  }, [])

  // 限制位置范围
  const constrainPosition = useCallback((pos: { x: number; y: number }, zoomLevel: number) => {
    if (!containerRef.current || !imageRef.current || zoomLevel <= 1) {
      return { x: 0, y: 0 }
    }

    const containerRect = containerRef.current.getBoundingClientRect()
    const imageRect = imageRef.current.getBoundingClientRect()
    
    const scaledWidth = imageRect.width * zoomLevel
    const scaledHeight = imageRect.height * zoomLevel
    
    const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2)
    const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2)
    
    return {
      x: Math.max(-maxX, Math.min(maxX, pos.x)),
      y: Math.max(-maxY, Math.min(maxY, pos.y))
    }
  }, [])

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
  }, [isOpen, onClose, resetImage])

  // 鼠标拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
    setShowControls(false)
    setShowExitHint(false) // 开始拖拽时隐藏提示
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }
    setPosition(constrainPosition(newPosition, zoom))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setShowControls(true)
  }

  // 触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setShowControls(false)
    setShowExitHint(false) // 开始交互时隐藏提示

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
      setIsDragging(false)
      const distance = getTouchDistance(e.touches)
      const center = getTouchCenter(e.touches)
      setLastTouchDistance(distance)
      setTouchCenter(center)
    }
  }

  // 触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    
    if (e.touches.length === 1 && isDragging && zoom > 1) {
      // 单指拖拽
      const newPosition = {
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      }
      setPosition(constrainPosition(newPosition, zoom))
    } else if (e.touches.length === 2 && isTouchZooming) {
      // 双指缩放
      const currentDistance = getTouchDistance(e.touches)
      const currentCenter = getTouchCenter(e.touches)
      
      if (lastTouchDistance > 0 && currentDistance > 0) {
        const scale = currentDistance / lastTouchDistance
        const newZoom = Math.max(0.5, Math.min(5, zoom * scale))
        
        // 计算以触摸中心为基准的缩放
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect()
          const centerOffsetX = currentCenter.x - containerRect.left - containerRect.width / 2
          const centerOffsetY = currentCenter.y - containerRect.top - containerRect.height / 2
          
          // 根据缩放调整位置
          const zoomDelta = newZoom / zoom
          const newPosition = {
            x: position.x + centerOffsetX * (1 - zoomDelta),
            y: position.y + centerOffsetY * (1 - zoomDelta)
          }
          
          setZoom(newZoom)
          
          if (newZoom <= 1) {
            setPosition({ x: 0, y: 0 })
          } else {
            setPosition(constrainPosition(newPosition, newZoom))
          }
        }
      }
      setLastTouchDistance(currentDistance)
    }
  }

  // 触摸结束
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      const wasDragging = isDragging
      const wasZooming = isTouchZooming
      
      setIsDragging(false)
      setIsTouchZooming(false)
      setLastTouchDistance(0)
      
      // 延迟显示控制按钮
      setTimeout(() => setShowControls(true), 500)
      
      // 简单点击检测 - 在图片容器中且图片在默认状态
      if (zoom <= 1.1 && rotation % 360 === 0 && !wasDragging && !wasZooming && e.target === containerRef.current) {
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
    const newZoom = Math.max(0.5, Math.min(5, zoom * delta))
    setZoom(newZoom)
    
    // 当缩放变小时，重置位置到中心
    if (newZoom <= 1) {
      setPosition({ x: 0, y: 0 })
    }
  }

  // 处理背景点击
  const handleBackgroundClick = (e: React.MouseEvent) => {
    // 只要点击的是背景本身（不是子元素），就可以退出
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // 处理背景触摸
  const handleBackgroundTouch = (e: React.TouchEvent) => {
    // 触摸背景也可以退出
    if (e.target === e.currentTarget && !isDragging && !isTouchZooming) {
      onClose()
    }
  }

  // 处理图片容器点击
  const handleContainerClick = (e: React.MouseEvent) => {
    // 阻止事件冒泡到背景
    e.stopPropagation()
    
    // 如果图片在默认状态且点击的不是图片本身，则退出
    if (zoom <= 1.1 && rotation % 360 === 0 && e.target === e.currentTarget) {
      onClose()
    }
  }

  // 处理图片点击
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // 图片被点击时不做任何操作，防止退出
  }

  // 处理控制按钮区域点击
  const handleControlsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // 控制区域被点击时不退出
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
      setShowExitHint(true)
    }
  }, [isOpen, resetImage])

  // 动态修改 viewport 以允许全屏时缩放
  useEffect(() => {
    if (isOpen) {
      // 全屏时允许缩放
      const viewportMeta = document.querySelector('meta[name="viewport"]')
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover')
      }
    } else {
      // 关闭时恢复原设置
      const viewportMeta = document.querySelector('meta[name="viewport"]')
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover')
      }
    }
  }, [isOpen])

  // 自动隐藏退出提示
  useEffect(() => {
    if (isOpen && showExitHint) {
      const timer = setTimeout(() => {
        setShowExitHint(false)
      }, 3000) // 3秒后隐藏提示
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, showExitHint])

  // 缩放控制函数
  const zoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5))
    setShowExitHint(false) // 使用控制按钮时隐藏提示
  }
  const zoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5))
    setShowExitHint(false) // 使用控制按钮时隐藏提示
  }
  const rotate = () => {
    setRotation(prev => prev + 90)
    setShowExitHint(false) // 使用控制按钮时隐藏提示
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black fullscreen-modal"
          onClick={handleBackgroundClick}
          onTouchEnd={handleBackgroundTouch}
        >
          {/* 控制按钮 */}
          <AnimatePresence>
            {showControls && (
              <>
                {/* 顶部控制栏 */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-0 left-0 right-0 z-60 bg-gradient-to-b from-black/50 to-transparent p-4"
                  onClick={handleControlsClick}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 text-white">
                      <Info className="w-5 h-5" />
                      <div>
                        <h3 className="font-medium">{photo.title}</h3>
                        {photo.camera && (
                          <p className="text-sm text-white/80">{photo.camera} • {photo.settings}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </motion.div>

                {/* 底部控制栏 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-0 left-0 right-0 z-60 bg-gradient-to-t from-black/50 to-transparent p-4"
                  onClick={handleControlsClick}
                >
                  <div className="flex justify-center items-center space-x-4">
                    <button
                      onClick={zoomOut}
                      className="p-3 rounded-full bg-black/20 hover:bg-black/40 transition-colors text-white"
                      disabled={zoom <= 0.5}
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                    <button
                      onClick={zoomIn}
                      className="p-3 rounded-full bg-black/20 hover:bg-black/40 transition-colors text-white"
                      disabled={zoom >= 5}
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <button
                      onClick={rotate}
                      className="p-3 rounded-full bg-black/20 hover:bg-black/40 transition-colors text-white"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-3 rounded-full bg-black/20 hover:bg-black/40 transition-colors text-white"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-3 rounded-full bg-black/20 hover:bg-black/40 transition-colors text-white"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* 图片容器 */}
          <div
            ref={containerRef}
            className="absolute inset-0 flex items-center justify-center p-4"
            onClick={handleContainerClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ 
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
              touchAction: 'none'
            }}
          >
            {!isImageLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white/80 text-lg">加载中...</p>
              </div>
            )}
            
            <motion.img
              ref={imageRef}
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
                transition: isDragging || isTouchZooming ? 'none' : 'transform 0.2s ease-out'
              }}
              onLoad={() => setIsImageLoaded(true)}
              onClick={handleImageClick}
              draggable={false}
            />
          </div>

          {/* 缩放指示器 */}
          {zoom !== 1 && (
            <div className="absolute top-20 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {Math.round(zoom * 100)}%
            </div>
          )}

          {/* 退出提示 */}
          {showControls && showExitHint && zoom <= 1.1 && rotation % 360 === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.7, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm pointer-events-none"
            >
              点击背景或按 ESC 键退出
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
} 
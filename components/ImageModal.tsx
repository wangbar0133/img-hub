'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Download, Heart } from 'lucide-react'

interface Image {
  id: number
  src: string
  alt: string
  category: string
  title: string
  description: string
}

interface ImageModalProps {
  image: Image
  onClose: () => void
}

export default function ImageModal({ image, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = image.src
    link.download = `${image.title}.jpg`
    link.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative max-w-7xl max-h-full w-full"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Action Buttons */}
        <div className="absolute top-4 left-4 z-10 flex space-x-2">
          <button
            onClick={handleDownload}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            title="下载图片"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            title="收藏"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center h-full">
          <img
            src={image.src}
            alt={image.alt}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>

        {/* Image Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">{image.title}</h2>
          <p className="text-gray-200 mb-2">{image.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300 capitalize">
              分类: {image.category === 'landscape' ? '风景' : 
                     image.category === 'portrait' ? '人像' :
                     image.category === 'architecture' ? '建筑' :
                     image.category === 'street' ? '街拍' : image.category}
            </span>
            <span className="text-sm text-gray-300">
              点击ESC键或背景区域关闭
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 
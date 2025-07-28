'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Image {
  id: number
  src: string
  alt: string
  category: string
  title: string
  description: string
}

interface GalleryProps {
  images: Image[]
  onImageClick: (image: Image) => void
}

export default function Gallery({ images, onImageClick }: GalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filteredImages, setFilteredImages] = useState(images)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'landscape', name: '风景' },
    { id: 'portrait', name: '人像' },
    { id: 'architecture', name: '建筑' },
    { id: 'street', name: '街拍' },
  ]

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredImages(images)
    } else {
      setFilteredImages(images.filter(img => img.category === selectedCategory))
    }
  }, [selectedCategory, images])

  const handleImageLoad = (imageId: number) => {
    setLoadedImages(prev => new Set(prev).add(imageId))
  }

  return (
    <section id="gallery" className="py-20 px-4 bg-photo-light">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-photo-dark mb-4">
            摄影作品
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            每一张照片都是一个故事，每一个瞬间都值得被珍藏
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-photo-dark text-white'
                  : 'bg-white text-photo-dark hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="break-inside-avoid group cursor-pointer"
              onClick={() => onImageClick(image)}
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                {!loadedImages.has(image.id) && (
                  <div className="w-full h-64 bg-gray-200 image-loading rounded-lg"></div>
                )}
                <img
                  src={image.src}
                  alt={image.alt}
                  className={`w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105 ${
                    loadedImages.has(image.id) ? 'opacity-100' : 'opacity-0 absolute'
                  }`}
                  onLoad={() => handleImageLoad(image.id)}
                  loading="lazy"
                />
                
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="text-white">
                    <h3 className="font-semibold text-lg mb-1">{image.title}</h3>
                    <p className="text-sm text-gray-200">{image.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">该分类下暂无作品</p>
          </div>
        )}
      </div>
    </section>
  )
} 
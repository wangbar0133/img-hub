// 图片类型定义
export interface Photo {
  id: number
  src: string          // 展示用的压缩图片（中等质量）
  detailSrc?: string   // 详情页面用的900p图片（不裁切）
  originalSrc?: string // 原始高质量图片（全屏查看用）
  thumbnail?: string   // 缩略图（列表展示用，正方形裁切）
  alt: string
  title: string
  description: string
  location?: string
  camera?: string
  settings?: string
  tags?: string[]
}

// 影集类型定义
export interface Album {
  id: string
  title: string
  description: string
  coverImage: string
  coverPhotoId?: number  // 指定哪张照片作为封面
  category: 'travel' | 'cosplay'
  photos: Photo[]
  createdAt: string
  featured: boolean
  location?: string
  photoCount: number
}

// 影集预览类型（用于列表显示）
export interface AlbumPreview {
  id: string
  title: string
  description: string
  coverImage: string
  coverPhotoId?: number
  category: string
  photoCount: number
  featured: boolean
  location?: string
  createdAt: string
} 
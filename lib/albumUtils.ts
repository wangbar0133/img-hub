import { Album } from '@/types'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

/**
 * 获取影集的封面图片URL
 * 使用新后端API的cover字段
 */
export function getAlbumCoverImage(album: Album): string {
  if (album.cover) {
    // 如果cover是完整URL，直接返回
    if (album.cover.startsWith('http')) {
      return album.cover
    }
    // 否则构建完整URL
    return `${BACKEND_URL}/public/${album.cover}`
  }
  
  // 回退到第一张照片的thumbnail
  if (album.photos && album.photos.length > 0) {
    const firstPhoto = album.photos[0]
    return `${BACKEND_URL}/public/${firstPhoto.thumbnail}`
  }
  
  return ''
}

/**
 * 获取影集封面照片的缩略图
 */
export function getAlbumCoverThumbnail(album: Album): string {
  if (album.cover) {
    // 如果cover是完整URL，直接返回
    if (album.cover.startsWith('http')) {
      return album.cover
    }
    // 否则构建完整URL - 假设封面已经是合适的缩略图尺寸
    return `${BACKEND_URL}/public/${album.cover}`
  }
  
  // 回退到第一张照片的缩略图
  if (album.photos && album.photos.length > 0) {
    const firstPhoto = album.photos[0]
    return `${BACKEND_URL}/public/${firstPhoto.thumbnail}`
  }
  
  return ''
}

/**
 * 获取照片的完整URL
 */
export function getPhotoUrl(filename: string): string {
  if (!filename) {
    return ''
  }
  if (filename.startsWith('http')) {
    return filename
  }
  return `${BACKEND_URL}/public/${filename}`
}

/**
 * 计算影集照片数量（与新API结构兼容）
 */
export function getAlbumPhotoCount(album: Album): number {
  return album.photos?.length || 0
}

/**
 * 格式化时间字符串
 */
export function formatAlbumDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long'
    })
  } catch {
    return dateString
  }
}
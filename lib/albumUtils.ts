import { Album } from '@/types'

/**
 * 获取影集的实际封面图片URL
 * 如果指定了 coverPhotoId，则使用对应照片作为封面
 * 否则使用 coverImage 字段
 */
export function getAlbumCoverImage(album: Album): string {
  // 如果有指定的封面照片ID，查找对应的照片
  if (album.coverPhotoId && album.photos && album.photos.length > 0) {
    const coverPhoto = album.photos.find(photo => photo.id === album.coverPhotoId)
    if (coverPhoto) {
      return coverPhoto.src
    }
  }
  
  // 回退到原有的 coverImage 字段
  return album.coverImage || (album.photos && album.photos.length > 0 ? album.photos[0].src : '')
}

/**
 * 获取影集封面照片的缩略图
 */
export function getAlbumCoverThumbnail(album: Album): string {
  if (album.coverPhotoId && album.photos && album.photos.length > 0) {
    const coverPhoto = album.photos.find(photo => photo.id === album.coverPhotoId)
    if (coverPhoto && coverPhoto.thumbnail) {
      return coverPhoto.thumbnail
    }
  }
  
  // 回退到第一张照片的缩略图
  if (album.photos && album.photos.length > 0 && album.photos[0].thumbnail) {
    return album.photos[0].thumbnail
  }
  
  // 最后回退到原有的 coverImage
  return album.coverImage || ''
}

/**
 * 更新影集数据，确保 coverImage 与 coverPhotoId 保持同步
 */
export function updateAlbumCoverImage(album: Album): Album {
  const coverImage = getAlbumCoverImage(album)
  
  return {
    ...album,
    coverImage
  }
}

/**
 * 批量更新多个影集的封面图片
 */
export function updateAlbumsCoverImages(albums: Album[]): Album[] {
  return albums.map(album => updateAlbumCoverImage(album))
}
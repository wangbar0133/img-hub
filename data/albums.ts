import { Album } from '@/types'
import albumsData from './albums.json'

// 从JSON文件导入数据
export const sampleAlbums: Album[] = albumsData as Album[]

// 获取所有影集
export const getAllAlbums = (): Album[] => {
  return sampleAlbums
}

// 根据ID获取影集
export const getAlbumById = (id: string): Album | undefined => {
  return sampleAlbums.find(album => album.id === id)
}

// 获取特色影集
export const getFeaturedAlbums = (): Album[] => {
  return sampleAlbums.filter(album => album.featured)
}

// 根据分类获取影集
export const getAlbumsByCategory = (category: string): Album[] => {
  return sampleAlbums.filter(album => album.category === category)
} 
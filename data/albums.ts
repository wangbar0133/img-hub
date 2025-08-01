import { Album } from '@/types'

// 服务端数据加载函数
export const loadAlbumsFromFile = (): Album[] => {
  try {
    const fs = require('fs')
    const path = require('path')
    const albumsPath = path.join(process.cwd(), 'public', 'albums.json')
    const fileContent = fs.readFileSync(albumsPath, 'utf-8')
    return JSON.parse(fileContent) as Album[]
  } catch (error) {
    console.warn('albums.json not found, using placeholder data')
    // 返回占位数据确保构建通过
    return [
      {
        id: "placeholder",
        title: "占位影集",
        description: "这是构建时的占位数据",
        coverImage: "/placeholder.jpg",
        category: "travel",
        featured: true,
        location: "",
        createdAt: "2025-01-01",
        photoCount: 1,
        photos: [
          {
            id: 1,
            src: "/placeholder.jpg",
            detailSrc: "/placeholder.jpg",
            originalSrc: "/placeholder.jpg",
            thumbnail: "/placeholder.jpg",
            alt: "占位图片",
            title: "占位图片",
            description: "",
            location: "",
            camera: "",
            settings: "",
            tags: []
          }
        ]
      }
    ]
  }
}

// 客户端使用的数据处理函数（不直接读取文件）
// 获取所有影集
export const getAllAlbums = (albums: Album[]): Album[] => {
  return albums
}

// 根据ID获取影集
export const getAlbumById = (albums: Album[], id: string): Album | undefined => {
  return albums.find(album => album.id === id)
}

// 获取精选影集
export const getFeaturedAlbums = (albums: Album[]): Album[] => {
  return albums.filter(album => album.featured)
}

// 根据分类获取影集
export const getAlbumsByCategory = (albums: Album[], category: string): Album[] => {
  return albums.filter(album => album.category === category)
} 
'use client'

import { useState, useEffect } from 'react'
import { Album } from '@/types'
import AlbumsClient from './AlbumsClient'

// 确保页面不被缓存
export const dynamic = 'force-dynamic'

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch(`/api/albums?t=${Date.now()}`, {
          cache: 'no-store',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'If-None-Match': '*', // 强制获取最新数据
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          // 临时调试：记录接收到的封面信息
          console.log('Frontend received albums:', data.albums.map((album: any) => ({
            id: album.id,
            title: album.title,
            coverImage: album.coverImage,
            coverPhotoId: album.coverPhotoId
          })))
          setAlbums(data.albums)
        }
      } catch (err) {
        console.error('Error fetching albums:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAlbums()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <AlbumsClient initialAlbums={albums} />
} 
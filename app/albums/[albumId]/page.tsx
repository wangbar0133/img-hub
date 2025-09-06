'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Album } from '@/types'
import AlbumDetailClient from './AlbumDetailClient'

// 客户端版本的 getAlbumById 函数
function getAlbumById(albums: Album[], id: string): Album | undefined {
  return albums.find(album => album.id === id)
}

export default function AlbumDetailPage() {
  const params = useParams()
  const albumId = params.albumId as string
  const [album, setAlbum] = useState<Album | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const response = await fetch('/api/albums', {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          const foundAlbum = getAlbumById(data.albums, albumId)
          if (foundAlbum) {
            setAlbum(foundAlbum)
          } else {
            setNotFound(true)
          }
        }
      } catch (err) {
        console.error('Error fetching album:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchAlbum()
  }, [albumId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (notFound || !album) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">影集未找到</h1>
          <p className="text-gray-600 mb-8">您访问的影集不存在或已被删除</p>
          <a 
            href="/albums" 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回影集列表
          </a>
        </div>
      </div>
    )
  }

  return <AlbumDetailClient album={album} />
} 
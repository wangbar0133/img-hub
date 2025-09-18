'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Album } from '@/types'
import PhotoDetailClient from './PhotoDetailClient'

export default function PhotoDetailPage() {
  const params = useParams()
  const albumId = params.albumId as string
  const photoId = params.photoId as string
  
  const [album, setAlbum] = useState<Album | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Convert photoId to index
  const photoIndex = parseInt(photoId, 10)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/album/${albumId}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success && data.album) {
          if (photoIndex >= 0 && photoIndex < data.album.photos.length) {
            setAlbum(data.album)
          } else {
            setNotFound(true)
          }
        } else {
          setNotFound(true)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    if (isNaN(photoIndex)) {
      setNotFound(true)
      setLoading(false)
      return
    }

    fetchData()
  }, [albumId, photoId, photoIndex])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (notFound || !album) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">照片未找到</h1>
          <p className="text-gray-300 mb-8">抱歉，您访问的照片不存在或已被删除。请检查URL是否正确，或浏览影集中的其他照片。</p>
          <a 
            href={`/albums/${albumId}`} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回影集
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black">
      <PhotoDetailClient album={album} photoIndex={photoIndex} />
    </div>
  )
} 
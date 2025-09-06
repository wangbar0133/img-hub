'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Album, Photo } from '@/types'
import PhotoDetailClient from './PhotoDetailClient'

// 客户端版本的 getAlbumById 函数
function getAlbumById(albums: Album[], id: string): Album | undefined {
  return albums.find(album => album.id === id)
}

export default function PhotoDetailPage() {
  const params = useParams()
  const albumId = params.albumId as string
  const photoId = params.photoId as string
  
  const [album, setAlbum] = useState<Album | null>(null)
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
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
            const foundPhoto = foundAlbum.photos.find((p: Photo) => p.id.toString() === photoId)
            if (foundPhoto) {
              setAlbum(foundAlbum)
              setPhoto(foundPhoto)
            } else {
              setNotFound(true)
            }
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

    fetchData()
  }, [albumId, photoId])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (notFound || !album || !photo) {
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
      <PhotoDetailClient album={album} photo={photo} />
    </div>
  )
} 
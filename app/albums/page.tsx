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
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
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
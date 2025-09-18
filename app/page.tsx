'use client'

import { useState, useEffect } from 'react'
import { Album } from '@/types'
import HomeClient from './HomeClient'

// 确保页面不被缓存
export const dynamic = 'force-dynamic'

export default function Home() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [featuredAlbums, setFeaturedAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 并行获取所有相册和精选相册
        const [albumsResponse, featuredResponse] = await Promise.all([
          fetch(`/api/albums?t=${Date.now()}`, {
            cache: 'no-store',
            mode: 'cors',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'If-None-Match': '*',
            }
          }),
          fetch(`/api/featured-albums?t=${Date.now()}`, {
            cache: 'no-store',
            mode: 'cors',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'If-None-Match': '*',
            }
          })
        ])

        if (!albumsResponse.ok) {
          throw new Error(`Albums API error! status: ${albumsResponse.status}`)
        }

        if (!featuredResponse.ok) {
          throw new Error(`Featured albums API error! status: ${featuredResponse.status}`)
        }

        const [albumsData, featuredData] = await Promise.all([
          albumsResponse.json(),
          featuredResponse.json()
        ])

        if (albumsData.success) {
          setAlbums(albumsData.albums)
        } else {
          setError('获取相册数据失败')
        }

        if (featuredData.success) {
          setFeaturedAlbums(featuredData.albums)
        }

      } catch (err) {
        setError('网络请求失败')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  return <HomeClient initialAlbums={albums} featuredAlbums={featuredAlbums} />
} 
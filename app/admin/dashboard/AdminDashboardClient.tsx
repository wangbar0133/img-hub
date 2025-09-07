'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Album, Photo } from '@/types'

interface AdminStats {
  total: number
  totalPhotos: number
  albums: Album[]
}

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [editingPhoto, setEditingPhoto] = useState<{ album: Album; photo: Photo } | null>(null)
  const [expandedAlbums, setExpandedAlbums] = useState<Set<string>>(new Set())
  
  const router = useRouter()

  // 检查登录状态并加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 检查登录状态
        const authResponse = await fetch('/api/admin/auth', {
          credentials: 'include'
        })
        if (!authResponse.ok) {
          router.push('/admin')
          return
        }

        // 加载统计数据
        const statsResponse = await fetch('/api/admin/albums', {
          credentials: 'include'
        })
        if (!statsResponse.ok) {
          throw new Error('Failed to load data')
        }

        const data = await statsResponse.json()
        setStats(data)
      } catch (error) {
        setError('加载数据失败')
        console.error('Load data error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE', credentials: 'include' })
      router.push('/admin')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleUpdateAlbum = async (albumId: string, updates: Partial<Album>) => {
    try {
      const response = await fetch('/api/admin/albums', {
        credentials: 'include',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumId, updates })
      })

      if (!response.ok) {
        throw new Error('Update failed')
      }

      // 重新加载数据
      const statsResponse = await fetch('/api/admin/albums', { credentials: 'include' })
      const data = await statsResponse.json()
      setStats(data)
      setEditingAlbum(null)
    } catch (error) {
      alert('更新失败: ' + error)
    }
  }

  const handleUpdateCover = async (albumId: string, coverPhotoId: number) => {
    try {
      const response = await fetch('/api/admin/albums/cover', {
        credentials: 'include',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumId, coverPhotoId })
      })

      if (!response.ok) {
        throw new Error('Cover update failed')
      }

      // 重新加载数据
      const statsResponse = await fetch('/api/admin/albums', { credentials: 'include' })
      const data = await statsResponse.json()
      setStats(data)
    } catch (error) {
      alert('封面更新失败: ' + error)
    }
  }

  const handleDeleteAlbum = async (albumId: string, albumTitle: string) => {
    if (!confirm(`确定要删除影集 "${albumTitle}" 吗？此操作不可撤销！`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/albums', {
        credentials: 'include',
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumId })
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      // 重新加载数据
      const statsResponse = await fetch('/api/admin/albums', { credentials: 'include' })
      const data = await statsResponse.json()
      setStats(data)
    } catch (error) {
      alert('删除失败: ' + error)
    }
  }

  const handleUpdatePhoto = async (albumId: string, photoId: number, updates: Partial<Photo>) => {
    try {
      const response = await fetch('/api/admin/photos', {
        credentials: 'include',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumId, photoId, updates })
      })

      if (!response.ok) {
        throw new Error('Update failed')
      }

      // 重新加载数据
      const statsResponse = await fetch('/api/admin/albums', { credentials: 'include' })
      const data = await statsResponse.json()
      setStats(data)
      setEditingPhoto(null)
    } catch (error) {
      alert('更新失败: ' + error)
    }
  }

  const handleDeletePhoto = async (albumId: string, photoId: number, photoTitle: string) => {
    if (!confirm(`确定要删除照片 "${photoTitle}" 吗？此操作不可撤销！`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/photos', {
        credentials: 'include',
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumId, photoId })
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      // 重新加载数据
      const statsResponse = await fetch('/api/admin/albums', { credentials: 'include' })
      const data = await statsResponse.json()
      setStats(data)
    } catch (error) {
      alert('删除失败: ' + error)
    }
  }

  const toggleAlbumExpansion = (albumId: string) => {
    const newExpanded = new Set(expandedAlbums)
    if (newExpanded.has(albumId)) {
      newExpanded.delete(albumId)
    } else {
      newExpanded.add(albumId)
    }
    setExpandedAlbums(newExpanded)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">ImgHub 管理后台</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                查看网站
              </a>
              <button
                onClick={() => router.push('/admin/create-album')}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
              >
                创建新影集
              </button>
              <button
                onClick={() => router.push('/admin/logs')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                系统日志
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📁</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">影集总数</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.total || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">🖼️</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">照片总数</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.totalPhotos || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">⭐</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">精选影集</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.albums?.filter(album => album.featured).length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 影集列表 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">影集管理</h3>
            
            <div className="space-y-4">
              {stats?.albums?.map((album) => (
                <div key={album.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        {album.coverImage && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={album.coverImage}
                              alt={album.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {album.title}
                            {album.featured && <span className="ml-2 text-yellow-500">⭐</span>}
                          </h4>
                          <p className="text-sm text-gray-600">
                            ID: {album.id} | 分类: {album.category} | {album.photoCount} 张照片
                          </p>
                          <p className="text-sm text-gray-500">{album.description}</p>
                          {album.location && (
                            <p className="text-sm text-gray-500">📍 {album.location}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingAlbum(album)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteAlbum(album.id, album.title)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  
                  {/* 照片列表 */}
                  {album.photos.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-gray-700">照片列表 - 点击设为封面</h5>
                        {album.photos.length > 6 && (
                          <button
                            onClick={() => toggleAlbumExpansion(album.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {expandedAlbums.has(album.id) ? '收起' : `显示全部 ${album.photos.length} 张`}
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {(expandedAlbums.has(album.id) ? album.photos : album.photos.slice(0, 6)).map((photo) => (
                          <div key={photo.id} className="relative group">
                            <div 
                              className={`relative w-full h-20 rounded overflow-hidden cursor-pointer border-2 transition-colors ${
                                photo.id === album.coverPhotoId 
                                  ? 'border-blue-500 ring-2 ring-blue-200' 
                                  : 'border-transparent hover:border-gray-300'
                              }`}
                              onClick={() => handleUpdateCover(album.id, Number(photo.id))}
                            >
                              <Image
                                src={photo.thumbnail || photo.src}
                                alt={photo.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            {photo.id === album.coverPhotoId && (
                              <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded flex items-center">
                                <span className="mr-1">⭐</span>
                                封面
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingPhoto({ album, photo })
                                }}
                                className="text-white text-xs bg-blue-600 px-2 py-1 rounded"
                              >
                                编辑
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeletePhoto(album.id, photo.id, photo.title)
                                }}
                                className="text-white text-xs bg-red-600 px-2 py-1 rounded"
                              >
                                删除
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 编辑影集模态框 */}
      {editingAlbum && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">编辑影集</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleUpdateAlbum(editingAlbum.id, {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  location: formData.get('location') as string,
                  featured: formData.get('featured') === 'on'
                })
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">标题</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingAlbum.title}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">描述</label>
                  <textarea
                    name="description"
                    defaultValue={editingAlbum.description}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">地点</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingAlbum.location}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      defaultChecked={editingAlbum.featured}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                    />
                    <span className="ml-2 text-sm text-gray-700">设为精选影集</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingAlbum(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 编辑照片模态框 */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">编辑照片</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleUpdatePhoto(editingPhoto.album.id, editingPhoto.photo.id, {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  location: formData.get('location') as string,
                  tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean)
                })
              }}
            >
              <div className="space-y-4">
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden">
                    <Image
                      src={editingPhoto.photo.thumbnail || editingPhoto.photo.src}
                      alt={editingPhoto.photo.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">标题</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingPhoto.photo.title}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">描述</label>
                  <textarea
                    name="description"
                    defaultValue={editingPhoto.photo.description}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">地点</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingPhoto.photo.location}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">标签（用逗号分隔）</label>
                  <input
                    type="text"
                    name="tags"
                    defaultValue={editingPhoto.photo.tags?.join(', ') || ''}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="风景, 人像, 街拍"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  <p>相机: {editingPhoto.photo.camera}</p>
                  <p>设置: {editingPhoto.photo.settings}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
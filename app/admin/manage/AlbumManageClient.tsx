'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Settings, Trash2, Image as ImageIcon, Check, X, AlertCircle, RefreshCw } from 'lucide-react'
import { Album, SetCoverResponse, DeleteAlbumResponse } from '@/types'
import { getAlbumCoverImage, getPhotoUrl } from '@/lib/albumUtils'

export default function AlbumManageClient() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [showCoverModal, setShowCoverModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // 加载相册列表
  const loadAlbums = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/albums')
      const data = await response.json()
      if (data.success) {
        setAlbums(data.albums)
      }
    } catch (error) {
      console.error('Failed to load albums:', error)
      showMessage('error', '加载相册列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlbums()
  }, [])

  // 显示消息
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  // 设置相册封面
  const setCover = async (albumId: string, coverImage: string) => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/album/${albumId}/cover`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cover: coverImage }),
      })

      const result: SetCoverResponse = await response.json()
      
      if (result.success) {
        showMessage('success', result.msg || '封面设置成功')
        // 重新加载相册数据
        await loadAlbums()
        setShowCoverModal(false)
      } else {
        showMessage('error', result.msg || '封面设置失败')
      }
    } catch (error) {
      console.error('Set cover error:', error)
      showMessage('error', '封面设置失败')
    } finally {
      setProcessing(false)
    }
  }

  // 删除相册
  const deleteAlbum = async (albumId: string) => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/album/${albumId}`, {
        method: 'DELETE',
      })

      const result: DeleteAlbumResponse = await response.json()
      
      if (result.success) {
        showMessage('success', result.msg || '相册删除成功')
        // 重新加载相册数据
        await loadAlbums()
        setShowDeleteModal(false)
      } else {
        showMessage('error', result.msg || '相册删除失败')
      }
    } catch (error) {
      console.error('Delete album error:', error)
      showMessage('error', '相册删除失败')
    } finally {
      setProcessing(false)
    }
  }

  // 打开设置封面模态框
  const openCoverModal = (album: Album) => {
    setSelectedAlbum(album)
    setShowCoverModal(true)
  }

  // 打开删除确认模态框
  const openDeleteModal = (album: Album) => {
    setSelectedAlbum(album)
    setShowDeleteModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Navigation */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <Link 
              href="/admin"
              className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors group font-medium"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>返回上传</span>
            </Link>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700 transition-colors">首页</Link>
              <span>/</span>
              <Link href="/admin" className="hover:text-gray-700 transition-colors">管理员</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">相册管理</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">相册管理</h1>
          <p className="text-gray-600">设置相册封面和管理相册</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Albums Grid */}
        {albums.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无相册</h3>
            <p className="text-gray-500 mb-4">还没有上传任何相册</p>
            <Link
              href="/admin"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>上传照片</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <div key={album.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Album Cover */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={getAlbumCoverImage(album)}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => openCoverModal(album)}
                        className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-colors"
                        title="设置封面"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(album)}
                        className="bg-red-500/90 hover:bg-red-500 text-white p-2 rounded-full transition-colors"
                        title="删除相册"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Album Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{album.title}</h3>
                    <div className="flex space-x-1">
                      {album.featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                          ⭐ 精选
                        </span>
                      )}
                      {album.hidden && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                          👁️‍🗨️ 隐藏
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{album.photos.length} 张照片</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                      {album.category === 'travel' ? '旅行' : 'Cosplay'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    ID: {album.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 设置封面模态框 */}
      {showCoverModal && selectedAlbum && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">设置 &quot;{selectedAlbum.title}&quot; 的封面</h2>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedAlbum.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setCover(selectedAlbum.id, photo.medium)}
                    disabled={processing}
                    className="relative aspect-square overflow-hidden rounded-lg border-2 border-transparent hover:border-blue-500 transition-colors disabled:opacity-50"
                  >
                    <img
                      src={getPhotoUrl(photo.thumbnail)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedAlbum.cover === photo.medium && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <div className="bg-blue-500 text-white p-1 rounded-full">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowCoverModal(false)}
                disabled={processing}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {showDeleteModal && selectedAlbum && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold">确认删除相册</h2>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  您确定要删除相册 &quot;<strong>{selectedAlbum.title}</strong>&quot; 吗？
                </p>

                {/* 相册信息概览 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">相册ID:</span>
                      <span className="ml-2 font-medium">{selectedAlbum.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">照片数量:</span>
                      <span className="ml-2 font-medium">{selectedAlbum.photos.length} 张</span>
                    </div>
                    <div>
                      <span className="text-gray-500">分类:</span>
                      <span className="ml-2 font-medium">
                        {selectedAlbum.category === 'travel' ? '旅行' : 'Cosplay'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">状态:</span>
                      <div className="ml-2 flex space-x-1">
                        {selectedAlbum.featured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            精选
                          </span>
                        )}
                        {selectedAlbum.hidden && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                            隐藏
                          </span>
                        )}
                        {!selectedAlbum.featured && !selectedAlbum.hidden && (
                          <span className="text-gray-500 text-xs">常规</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-red-500 text-sm">
                  ⚠️ 此操作不可撤销，相册中的所有照片都将被永久删除。
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={processing}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={() => deleteAlbum(selectedAlbum.id)}
                  disabled={processing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {processing && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>确认删除</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
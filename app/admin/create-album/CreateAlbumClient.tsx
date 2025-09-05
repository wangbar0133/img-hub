'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface UploadedImage {
  id: number
  src: string
  detailSrc: string
  originalSrc: string
  thumbnail: string
  alt: string
  title: string
  description: string
  location: string
  camera: string
  settings: string
  tags: string[]
}

export default function CreateAlbumClient() {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    category: 'travel',
    location: '',
    featured: false
  })
  
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [coverPhotoId, setCoverPhotoId] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  const router = useRouter()

  // 检查登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth')
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated) {
            setIsAuthenticated(true)
          } else {
            router.push('/admin')
          }
        } else {
          router.push('/admin')
        }
      } catch (error) {
        router.push('/admin')
      } finally {
        setCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [router])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files)
      setUploadedImages([]) // 清空之前上传的图片
    }
  }

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError('请选择要上传的图片')
      return
    }

    setUploading(true)
    setError('')
    setProgress(0)

    try {
      const formDataToUpload = new FormData()
      
      // 添加所有选中的文件
      Array.from(selectedFiles).forEach((file) => {
        formDataToUpload.append('images', file)
      })
      formDataToUpload.append('category', formData.category)

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataToUpload
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '上传失败')
      }

      const result = await response.json()
      setUploadedImages(result.images)
      
      // 自动设置第一张图片为封面
      if (result.images.length > 0) {
        setCoverPhotoId(result.images[0].id)
      }
      
      // 清空文件选择
      const fileInput = document.getElementById('images') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
      setSelectedFiles(null)

    } catch (error) {
      console.error('上传错误:', error)
      setError(error instanceof Error ? error.message : '上传失败')
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const handleCreateAlbum = async () => {
    if (!formData.id.trim() || !formData.title.trim()) {
      setError('请填写影集ID和标题')
      return
    }

    if (uploadedImages.length === 0) {
      setError('请先上传图片')
      return
    }

    setCreating(true)
    setError('')

    try {
      // 找到选中的封面照片
      const coverPhoto = uploadedImages.find(img => img.id === coverPhotoId) || uploadedImages[0]
      
      // 创建影集数据
      const albumData = {
        id: formData.id.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        coverImage: coverPhoto.src, // 使用选中的照片作为封面
        coverPhotoId: coverPhotoId, // 记录封面照片ID
        category: formData.category,
        featured: formData.featured,
        location: formData.location.trim(),
        createdAt: new Date().toISOString().split('T')[0],
        photoCount: uploadedImages.length,
        photos: uploadedImages
      }

      // 调用创建影集API
      const response = await fetch('/api/admin/albums/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(albumData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '创建影集失败')
      }

      // 成功创建，跳转到管理面板
      router.push('/admin/dashboard')

    } catch (error) {
      console.error('创建影集错误:', error)
      setError(error instanceof Error ? error.message : '创建影集失败')
    } finally {
      setCreating(false)
    }
  }

  const removeImage = (index: number) => {
    const imageToRemove = uploadedImages[index]
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    
    // 如果删除的是封面图片，重新设置封面
    if (imageToRemove.id === coverPhotoId) {
      const remainingImages = uploadedImages.filter((_, i) => i !== index)
      setCoverPhotoId(remainingImages.length > 0 ? remainingImages[0].id : null)
    }
  }

  const setCoverPhoto = (photoId: number) => {
    setCoverPhotoId(photoId)
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">验证登录状态中...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">创建新影集</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                返回管理面板
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* 影集基本信息 */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">影集信息</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      影集ID *
                    </label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="用于URL的唯一标识符"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      影集标题 *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      分类 *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="travel">旅行</option>
                      <option value="cosplay">Cosplay</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      拍摄地点
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                    />
                    <span className="ml-2 text-sm text-gray-700">设为精选影集</span>
                  </label>
                </div>
              </div>

              {/* 图片上传区域 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">上传图片</h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="mt-4">
                      <label htmlFor="images" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          点击选择图片文件
                        </span>
                        <input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      <p className="mt-2 text-xs text-gray-500">
                        支持 JPG, PNG, WebP 格式，可选择多个文件
                      </p>
                    </div>
                  </div>
                </div>

                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      已选择 {selectedFiles.length} 个文件
                    </p>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {uploading ? '处理中...' : '开始处理'}
                    </button>
                  </div>
                )}

                {/* 上传进度 */}
                {uploading && (
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">处理进度: {progress}%</p>
                  </div>
                )}

                {/* 已处理的图片预览 */}
                {uploadedImages.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">
                        已处理图片 ({uploadedImages.length} 张)
                      </h4>
                      {coverPhotoId && (
                        <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full flex items-center">
                          <span className="mr-1">⭐</span>
                          当前封面: {uploadedImages.find(img => img.id === coverPhotoId)?.title}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">如何设置封面：</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1 ml-6">
                        <li>• 点击任意图片将其设为影集封面</li>
                        <li>• 封面图片会显示蓝色边框和⭐标识</li>
                        <li>• 默认第一张上传的图片为封面</li>
                        <li>• 悬停时显示删除按钮，可以移除不需要的图片</li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={image.id} className="relative group">
                          <div 
                            className={`relative w-full h-24 rounded-lg overflow-hidden cursor-pointer border-3 transition-all duration-200 ${
                              image.id === coverPhotoId 
                                ? 'border-blue-500 ring-4 ring-blue-200 shadow-lg transform scale-105' 
                                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                            }`}
                            onClick={() => setCoverPhoto(image.id)}
                            title={`点击设为封面: ${image.title}`}
                          >
                            <Image
                              src={image.thumbnail}
                              alt={image.alt}
                              fill
                              className="object-cover"
                            />
                            
                            {/* 封面标识 */}
                            {image.id === coverPhotoId && (
                              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center font-medium">
                                  <span className="mr-1">⭐</span>
                                  封面
                                </div>
                              </div>
                            )}
                            
                            {/* 点击提示 */}
                            {image.id !== coverPhotoId && (
                              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                                <div className="bg-white text-gray-800 text-xs px-2 py-1 rounded flex items-center">
                                  <span className="mr-1">👆</span>
                                  点击设为封面
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* 删除按钮 */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(index)
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
                            title="删除这张图片"
                          >
                            ×
                          </button>
                          
                          {/* 图片序号 */}
                          <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 封面预览 */}
                {uploadedImages.length > 0 && coverPhotoId && (
                  <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="text-md font-medium text-gray-900 mb-3">封面预览</h5>
                    <div className="flex items-start space-x-4">
                      <div className="relative w-32 h-24 rounded-lg overflow-hidden border-2 border-blue-200 shadow-sm">
                        <Image
                          src={uploadedImages.find(img => img.id === coverPhotoId)?.thumbnail || ''}
                          alt="影集封面预览"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                          封面
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">
                          <p className="font-medium mb-1">这张图片将作为影集封面显示在：</p>
                          <ul className="space-y-1 ml-4">
                            <li>• 影集列表页面</li>
                            <li>• 分类浏览页面</li>
                            <li>• 搜索结果页面</li>
                          </ul>
                          <p className="mt-2 text-xs text-gray-500">
                            如需更换封面，请点击上方其他图片
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 创建影集按钮 */}
                {uploadedImages.length > 0 && (
                  <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <p>准备创建影集：</p>
                      <ul className="mt-1 space-y-1">
                        <li>• {uploadedImages.length} 张图片已处理</li>
                        <li>• 封面：{uploadedImages.find(img => img.id === coverPhotoId)?.title || '未选择'}</li>
                        <li>• 影集ID：{formData.id || '请填写'}</li>
                        <li>• 影集标题：{formData.title || '请填写'}</li>
                      </ul>
                    </div>
                    <button
                      onClick={handleCreateAlbum}
                      disabled={creating || !formData.id || !formData.title}
                      className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
                    >
                      {creating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          创建中...
                        </>
                      ) : (
                        `创建影集 (${uploadedImages.length} 张图片)`
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
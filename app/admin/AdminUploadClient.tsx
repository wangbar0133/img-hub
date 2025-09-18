'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, Image as ImageIcon, AlertCircle, CheckCircle, X } from 'lucide-react'
import { UploadResponse } from '@/types'

export default function AdminUploadClient() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null)
  const [albumData, setAlbumData] = useState({
    id: '',
    title: '',
    category: 'cosplay',
    featured: false,
    hidden: false
  })
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // 处理文件选择
  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 10) {
      alert('最多只能上传10个文件')
      return
    }
    setSelectedFiles(files)
  }

  // 处理拖拽
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  // 上传文件
  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('请选择要上传的文件')
      return
    }

    setIsUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      
      // 添加文件
      Array.from(selectedFiles).forEach(file => {
        formData.append('images', file)
      })
      
      // 添加元数据
      if (albumData.id) formData.append('id', albumData.id)
      if (albumData.title) formData.append('title', albumData.title)
      if (albumData.category) formData.append('category', albumData.category)
      formData.append('featured', albumData.featured.toString())
      formData.append('hidden', albumData.hidden.toString())

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result: UploadResponse = await response.json()
      setUploadResult(result)
      
      if (result.success) {
        // 清空表单
        setSelectedFiles(null)
        setAlbumData({
          id: '',
          title: '',
          category: 'cosplay',
          featured: false,
          hidden: false
        })
        // 重置文件输入
        const fileInput = document.getElementById('fileInput') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadResult({
        success: false,
        msg: '上传失败: ' + (error instanceof Error ? error.message : '未知错误'),
        uploaded_files: [],
        failed_files: []
      })
    } finally {
      setIsUploading(false)
    }
  }

  // 移除选中的文件
  const clearFiles = () => {
    setSelectedFiles(null)
    const fileInput = document.getElementById('fileInput') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Navigation */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <Link 
              href="/"
              className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors group font-medium"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>返回首页</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/manage"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                相册管理
              </Link>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Link href="/" className="hover:text-gray-700 transition-colors">首页</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">管理员上传</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">上传照片</h1>
          <p className="text-gray-600">上传照片到影集，系统会自动生成不同尺寸的图片</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* 影集信息 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">影集信息</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  影集ID <span className="text-gray-400">(可选)</span>
                </label>
                <input
                  type="text"
                  value={albumData.id}
                  onChange={(e) => setAlbumData(prev => ({ ...prev, id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="留空将使用默认值"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  影集标题 <span className="text-gray-400">(可选)</span>
                </label>
                <input
                  type="text"
                  value={albumData.title}
                  onChange={(e) => setAlbumData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="未命名影集"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  影集分类
                </label>
                <select
                  value={albumData.category}
                  onChange={(e) => setAlbumData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cosplay">Cosplay</option>
                  <option value="travel">旅行</option>
                </select>
              </div>
            </div>

            {/* 相册选项 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={albumData.featured}
                  onChange={(e) => setAlbumData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <span>⭐</span>
                  <span>设为精选相册</span>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="hidden"
                  checked={albumData.hidden}
                  onChange={(e) => setAlbumData(prev => ({ ...prev, hidden: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="hidden" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <span>👁️‍🗨️</span>
                  <span>隐藏相册</span>
                </label>
              </div>
            </div>
          </div>

          {/* 文件上传区域 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">选择图片文件</h2>
            
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className={`w-16 h-16 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    拖拽图片到此处，或点击选择文件
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    支持 JPEG, PNG 格式，最多10个文件
                  </p>
                </div>
              </div>
            </div>

            {/* 选中的文件列表 */}
            {selectedFiles && selectedFiles.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">已选择 {selectedFiles.length} 个文件</h3>
                  <button
                    onClick={clearFiles}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <ImageIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 上传按钮 */}
          <div className="flex justify-center">
            <button
              onClick={handleUpload}
              disabled={isUploading || !selectedFiles || selectedFiles.length === 0}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>上传中...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>开始上传</span>
                </>
              )}
            </button>
          </div>

          {/* 上传结果 */}
          {uploadResult && (
            <div className={`rounded-lg p-4 ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start space-x-3">
                {uploadResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                
                <div className="flex-1">
                  <p className={`font-medium ${uploadResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {uploadResult.msg || (uploadResult.success ? '上传成功' : '上传失败')}
                  </p>
                  
                  {uploadResult.uploaded_files.length > 0 && (
                    <div className="mt-2">
                      <p className="text-green-700 font-medium">成功上传的文件:</p>
                      <ul className="mt-1 space-y-1">
                        {uploadResult.uploaded_files.map((file, index) => (
                          <li key={index} className="text-green-600 text-sm">• {file}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {uploadResult.failed_files.length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-700 font-medium">失败的文件:</p>
                      <ul className="mt-1 space-y-1">
                        {uploadResult.failed_files.map((file, index) => (
                          <li key={index} className="text-red-600 text-sm">• {file}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {uploadResult.success && (
                    <div className="mt-3">
                      <Link 
                        href="/albums"
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <span>查看影集</span>
                        <span>→</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
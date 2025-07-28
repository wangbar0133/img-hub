import Link from 'next/link'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'

export default function PhotoNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <ImageIcon className="w-24 h-24 text-gray-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">照片未找到</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          抱歉，您访问的照片不存在或已被删除。请检查URL是否正确，或浏览影集中的其他照片。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/albums"
            className="inline-flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回影集列表</span>
          </Link>
          <Link 
            href="/"
            className="border-2 border-white text-white px-6 py-3 rounded-full hover:bg-white hover:text-black transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
} 
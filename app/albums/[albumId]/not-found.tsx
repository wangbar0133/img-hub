import Link from 'next/link'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'

export default function AlbumNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-photo-light">
      <div className="text-center">
        <ImageIcon className="w-24 h-24 text-gray-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-photo-dark mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-600 mb-4">影集未找到</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          抱歉，您访问的影集不存在或已被删除。请检查URL是否正确，或浏览其他精彩影集。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/albums"
            className="inline-flex items-center space-x-2 bg-photo-dark text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回影集列表</span>
          </Link>
          <Link 
            href="/"
            className="border-2 border-photo-dark text-photo-dark px-6 py-3 rounded-full hover:bg-photo-dark hover:text-white transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
} 
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '摄影影集 - ImgHub',
  description: '用镜头记录世界的美好，每个影集都是一段独特的视觉故事。探索不同主题和风格的摄影作品，感受光影艺术的魅力。',
  keywords: ['摄影影集', '摄影作品集', '风景摄影', '人像摄影', '建筑摄影', '街头摄影', 'ImgHub'],
  openGraph: {
    title: '摄影影集 - ImgHub',
    description: '用镜头记录世界的美好，每个影集都是一段独特的视觉故事',
    type: 'website',
  },
}

export default function AlbumsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
import { notFound } from 'next/navigation'
import { Album } from '@/types'
import { getAlbumById, loadAlbumsFromFile } from '@/data/albums'
import AlbumDetailClient from './AlbumDetailClient'

// 静态导出时需要的函数
export async function generateStaticParams() {
  const albums = loadAlbumsFromFile()
  
  return albums.map((album) => ({
    albumId: album.id,
  }))
}

// 生成页面元数据
export async function generateMetadata({ params }: { params: { albumId: string } }) {
  const albums = loadAlbumsFromFile()
  const album = getAlbumById(albums, params.albumId)
  
  if (!album) {
    return {
      title: '影集未找到 - ImgHub',
    }
  }

  return {
    title: `${album.title} - ImgHub`,
    description: `欣赏${album.title}影集，共${album.photos.length}张精美摄影作品`,
    openGraph: {
      title: `${album.title} - ImgHub`,
      description: `欣赏${album.title}影集，共${album.photos.length}张精美摄影作品`,
      images: [album.coverImage],
    },
  }
}

export default function AlbumDetailPage({ params }: { params: { albumId: string } }) {
  const albums = loadAlbumsFromFile()
  const album = getAlbumById(albums, params.albumId)

  if (!album) {
    notFound()
  }

  return <AlbumDetailClient album={album} />
} 
import { notFound } from 'next/navigation'
import { Album, Photo } from '@/types'
import { getAlbumById, getAllAlbums } from '@/data/albums'
import PhotoDetailClient from './PhotoDetailClient'

// 静态导出时需要的函数
export async function generateStaticParams() {
  const albums = getAllAlbums()
  const params: { albumId: string; photoId: string }[] = []
  
  albums.forEach((album) => {
    album.photos.forEach((photo) => {
      params.push({
        albumId: album.id,
        photoId: photo.id.toString(),
      })
    })
  })
  
  return params
}

// 生成页面元数据
export async function generateMetadata({ 
  params 
}: { 
  params: { albumId: string; photoId: string } 
}) {
  const album = getAlbumById(params.albumId)
  const photo = album?.photos.find(p => p.id === parseInt(params.photoId))
  
  if (!album || !photo) {
    return {
      title: '照片未找到 - ImgHub',
    }
  }

  return {
    title: `${photo.title} - ${album.title} - ImgHub`,
    description: `欣赏摄影作品《${photo.title}》，来自${album.title}影集`,
    openGraph: {
      title: `${photo.title} - ${album.title} - ImgHub`,
      description: `欣赏摄影作品《${photo.title}》，来自${album.title}影集`,
      images: [photo.src],
    },
  }
}

export default async function PhotoDetailPage({ params }: { params: { albumId: string; photoId: string } }) {
  const album = getAlbumById(params.albumId)
  const photo = album?.photos.find(p => p.id.toString() === params.photoId)

  if (!album || !photo) {
    notFound()
  }

  return (
    <div className="bg-black">
      <PhotoDetailClient album={album} photo={photo} />
    </div>
  )
} 
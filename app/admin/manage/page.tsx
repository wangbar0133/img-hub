import { Metadata } from 'next'
import AlbumManageClient from './AlbumManageClient'

export const metadata: Metadata = {
  title: '相册管理 - ImgHub',
  description: '管理相册封面和删除相册',
}

export default function AlbumManagePage() {
  return <AlbumManageClient />
}
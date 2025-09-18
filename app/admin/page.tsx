import { Metadata } from 'next'
import AdminUploadClient from './AdminUploadClient'

export const metadata: Metadata = {
  title: '管理员上传 - ImgHub',
  description: '上传和管理照片',
}

export default function AdminPage() {
  return <AdminUploadClient />
}
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { AlbumModel } from '@/lib/models/album'

const JWT_SECRET = process.env.JWT_SECRET || 'img-hub-admin-secret-key-2024'

// 验证管理员权限
function verifyAdmin() {
  const cookieStore = cookies()
  const token = cookieStore.get('admin-token')?.value
  
  if (!token) {
    throw new Error('未登录')
  }
  
  try {
    const decoded = verify(token, JWT_SECRET) as any
    if (decoded.role !== 'admin') {
      throw new Error('权限不足')
    }
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    throw new Error('无效的登录状态: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// PUT - 更新影集封面
export async function PUT(request: NextRequest) {
  try {
    verifyAdmin()
    
    const { albumId, coverPhotoId } = await request.json()
    
    if (!albumId) {
      return NextResponse.json(
        { error: '缺少影集ID' },
        { status: 400 }
      )
    }
    
    if (coverPhotoId === null || coverPhotoId === undefined) {
      return NextResponse.json(
        { error: '缺少封面照片ID' },
        { status: 400 }
      )
    }
    
    const success = await AlbumModel.updateCover(albumId, coverPhotoId)
    
    if (!success) {
      return NextResponse.json(
        { error: '影集不存在或指定的照片不存在于此影集中' },
        { status: 404 }
      )
    }
    
    const updatedAlbum = await AlbumModel.getAlbumById(albumId)
    
    return NextResponse.json({
      success: true,
      message: '封面更新成功',
      album: updatedAlbum ? {
        id: updatedAlbum.id,
        title: updatedAlbum.title,
        coverImage: updatedAlbum.coverImage,
        coverPhotoId: updatedAlbum.coverPhotoId
      } : null
    })
    
  } catch (error) {
    console.error('更新封面错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}
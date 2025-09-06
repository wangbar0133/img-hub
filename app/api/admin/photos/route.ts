import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { PhotoModel } from '@/lib/models/photo'
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

// PUT - 更新照片信息
export async function PUT(request: NextRequest) {
  try {
    verifyAdmin()
    
    const { photoId, updates } = await request.json()
    
    if (!photoId) {
      return NextResponse.json(
        { error: '缺少照片ID' },
        { status: 400 }
      )
    }
    
    // 过滤掉不允许修改的字段
    const { src, detailSrc, originalSrc, thumbnail, id, ...allowedUpdates } = updates
    
    const success = await PhotoModel.updatePhoto(Number(photoId), allowedUpdates)
    
    if (!success) {
      return NextResponse.json(
        { error: '照片不存在或更新失败' },
        { status: 404 }
      )
    }
    
    const updatedPhoto = await PhotoModel.getPhotoById(Number(photoId))
    
    return NextResponse.json({
      success: true,
      message: '照片信息更新成功',
      photo: updatedPhoto
    })
    
  } catch (error) {
    console.error('更新照片错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}

// DELETE - 删除照片
export async function DELETE(request: NextRequest) {
  try {
    verifyAdmin()
    
    const { photoId } = await request.json()
    
    if (!photoId) {
      return NextResponse.json(
        { error: '缺少照片ID' },
        { status: 400 }
      )
    }
    
    // 先获取照片信息
    const photo = await PhotoModel.getPhotoById(Number(photoId))
    if (!photo) {
      return NextResponse.json(
        { error: '照片不存在' },
        { status: 404 }
      )
    }
    
    // 删除照片（这会自动更新相册的photo count）
    const albumId = await PhotoModel.deletePhoto(Number(photoId))
    
    if (!albumId) {
      return NextResponse.json(
        { error: '删除失败' },
        { status: 500 }
      )
    }
    
    // 获取更新后的相册信息
    const updatedAlbum = await AlbumModel.getAlbumById(albumId)
    
    return NextResponse.json({
      success: true,
      message: '照片删除成功',
      deletedPhoto: photo,
      album: {
        id: updatedAlbum!.id,
        photoCount: updatedAlbum!.photoCount,
        coverImage: updatedAlbum!.coverImage
      }
    })
    
  } catch (error) {
    console.error('删除照片错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}
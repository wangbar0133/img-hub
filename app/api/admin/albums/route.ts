import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { AlbumModel } from '@/lib/models/album'
import { addLog } from '../logs/route'

const JWT_SECRET = process.env.JWT_SECRET || 'img-hub-admin-secret-key-2024'

// 验证管理员权限的中间件
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
    // JWT验证失败，保持原始错误信息用于调试
    console.error('JWT verification failed:', error)
    throw new Error('无效的登录状态: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// GET - 获取所有影集（管理员视图）
export async function GET(request: NextRequest) {
  try {
    verifyAdmin()
    
    const albums = await AlbumModel.getAllAlbums()
    
    return NextResponse.json({
      success: true,
      albums,
      total: albums.length,
      totalPhotos: albums.reduce((sum: number, album: any) => sum + album.photoCount, 0)
    })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '服务器错误'
    addLog('error', 'Admin albums API error', { error: errorMessage, endpoint: 'GET /api/admin/albums' })
    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    )
  }
}

// PUT - 更新影集信息
export async function PUT(request: NextRequest) {
  try {
    verifyAdmin()
    
    const { albumId, updates } = await request.json()
    
    if (!albumId) {
      return NextResponse.json(
        { error: '缺少影集ID' },
        { status: 400 }
      )
    }
    
    const success = await AlbumModel.updateAlbum(albumId, updates)
    
    if (!success) {
      return NextResponse.json(
        { error: '影集不存在或更新失败' },
        { status: 404 }
      )
    }
    
    const updatedAlbum = await AlbumModel.getAlbumById(albumId)
    
    return NextResponse.json({
      success: true,
      message: '影集更新成功',
      album: updatedAlbum
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}

// DELETE - 删除影集
export async function DELETE(request: NextRequest) {
  try {
    verifyAdmin()
    
    const { albumId } = await request.json()
    
    if (!albumId) {
      return NextResponse.json(
        { error: '缺少影集ID' },
        { status: 400 }
      )
    }
    
    // 先获取影集信息用于返回
    const album = await AlbumModel.getAlbumById(albumId)
    
    if (!album) {
      return NextResponse.json(
        { error: '影集不存在' },
        { status: 404 }
      )
    }
    
    const success = await AlbumModel.deleteAlbum(albumId)
    
    if (!success) {
      return NextResponse.json(
        { error: '删除失败' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `影集 "${album.title}" 删除成功`,
      deletedAlbum: album
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}
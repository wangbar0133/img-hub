import { NextRequest, NextResponse } from 'next/server'
import { AlbumModel } from '@/lib/models/album'
import { addLog, verifyAdmin } from '@/lib/logging'

// GET - 获取所有影集（管理员视图）
export async function GET(request: NextRequest) {
  try {
    addLog('info', 'GET albums request started')
    
    verifyAdmin()
    
    const albums = await AlbumModel.getAllAlbums()
    
    addLog('info', `Retrieved ${albums.length} albums`, {
      totalAlbums: albums.length,
      totalPhotos: albums.reduce((sum: number, album: any) => sum + album.photoCount, 0)
    })
    
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
    addLog('info', 'PUT album update request started')
    
    verifyAdmin()
    
    const { albumId, updates } = await request.json()
    
    addLog('info', `Updating album: ${albumId}`, { updates: Object.keys(updates) })
    
    if (!albumId) {
      addLog('warn', 'Album update failed: Missing album ID')
      return NextResponse.json(
        { error: '缺少影集ID' },
        { status: 400 }
      )
    }
    
    const success = await AlbumModel.updateAlbum(albumId, updates)
    
    if (!success) {
      addLog('warn', `Album update failed: Album not found or update failed for ID ${albumId}`)
      return NextResponse.json(
        { error: '影集不存在或更新失败' },
        { status: 404 }
      )
    }
    
    const updatedAlbum = await AlbumModel.getAlbumById(albumId)
    
    addLog('info', `Album updated successfully: ${albumId}`, { albumTitle: updatedAlbum?.title })
    
    return NextResponse.json({
      success: true,
      message: '影集更新成功',
      album: updatedAlbum
    })
    
  } catch (error) {
    addLog('error', 'Album update failed', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}

// DELETE - 删除影集
export async function DELETE(request: NextRequest) {
  try {
    addLog('info', 'DELETE album request started')
    
    verifyAdmin()
    
    const { albumId } = await request.json()
    
    addLog('info', `Deleting album: ${albumId}`)
    
    if (!albumId) {
      addLog('warn', 'Album deletion failed: Missing album ID')
      return NextResponse.json(
        { error: '缺少影集ID' },
        { status: 400 }
      )
    }
    
    // 先获取影集信息用于返回
    const album = await AlbumModel.getAlbumById(albumId)
    
    if (!album) {
      addLog('warn', `Album deletion failed: Album not found for ID ${albumId}`)
      return NextResponse.json(
        { error: '影集不存在' },
        { status: 404 }
      )
    }
    
    const success = await AlbumModel.deleteAlbum(albumId)
    
    if (!success) {
      addLog('error', `Album deletion failed: Database operation failed for ID ${albumId}`)
      return NextResponse.json(
        { error: '删除失败' },
        { status: 500 }
      )
    }
    
    addLog('info', `Album deleted successfully: "${album.title}" (${albumId})`, { 
      deletedAlbum: { id: albumId, title: album.title, photoCount: album.photoCount }
    })
    
    return NextResponse.json({
      success: true,
      message: `影集 "${album.title}" 删除成功`,
      deletedAlbum: album
    })
    
  } catch (error) {
    addLog('error', 'Album deletion failed', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}
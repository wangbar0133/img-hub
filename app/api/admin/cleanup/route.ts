import { NextRequest, NextResponse } from 'next/server'
import { AlbumModel } from '@/lib/models/album'
import { addLog, verifyAdmin } from '@/lib/logging'

// POST - 清理残留的相册数据（临时修复端点）
export async function POST(request: NextRequest) {
  try {
    addLog('info', 'Cleanup API requested')
    
    verifyAdmin()
    
    const { albumId } = await request.json()
    
    if (!albumId) {
      return NextResponse.json(
        { error: '缺少相册ID' },
        { status: 400 }
      )
    }
    
    addLog('info', `Manual cleanup requested for album: ${albumId}`)
    
    // 使用改进后的删除方法
    const success = await AlbumModel.deleteAlbum(albumId)
    
    if (success) {
      addLog('info', `Manual cleanup successful for album: ${albumId}`)
      return NextResponse.json({
        success: true,
        message: `相册 ${albumId} 已成功清理`
      })
    } else {
      addLog('warn', `Manual cleanup failed: Album ${albumId} not found or already deleted`)
      return NextResponse.json(
        { error: '相册不存在或已被删除' },
        { status: 404 }
      )
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '服务器错误'
    addLog('error', 'Cleanup API error', { error: errorMessage })
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
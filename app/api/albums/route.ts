import { NextResponse } from 'next/server'
import { AlbumModel } from '@/lib/models/album'
import { addLog } from '@/lib/logging'

// GET - 获取所有影集（公共API）
export async function GET() {
  try {
    addLog('info', 'Public albums API requested')
    
    const albums = await AlbumModel.getAllAlbums()
    
    addLog('info', `Public albums API: Retrieved ${albums.length} albums`)
    
    // 临时调试：记录封面信息
    albums.forEach(album => {
      console.log(`Album ${album.id} (${album.title}): coverImage=${album.coverImage}, coverPhotoId=${album.coverPhotoId}`)
    })
    
    const response = NextResponse.json({
      success: true,
      albums,
      timestamp: Date.now() // 添加时间戳确保数据新鲜度
    })
    
    // 设置无缓存头，确保返回最新数据
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('ETag', `"albums-${Date.now()}"`) // 添加动态ETag
    
    return response
    
  } catch (error) {
    addLog('error', 'Public albums API error', { error: error instanceof Error ? error.message : String(error) })
    console.error('Albums API error:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
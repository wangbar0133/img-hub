import { NextResponse } from 'next/server'
import { AlbumModel } from '@/lib/models/album'
import { addLog } from '../admin/logs/route'

// GET - 获取所有影集（公共API）
export async function GET() {
  try {
    addLog('info', 'Public albums API requested')
    
    const albums = await AlbumModel.getAllAlbums()
    
    addLog('info', `Public albums API: Retrieved ${albums.length} albums`)
    
    return NextResponse.json({
      success: true,
      albums
    })
    
  } catch (error) {
    addLog('error', 'Public albums API error', { error: error instanceof Error ? error.message : String(error) })
    console.error('Albums API error:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
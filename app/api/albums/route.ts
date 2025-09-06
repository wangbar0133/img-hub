import { NextResponse } from 'next/server'
import { AlbumModel } from '@/lib/models/album'

// GET - 获取所有影集（公共API）
export async function GET() {
  try {
    const albums = await AlbumModel.getAllAlbums()
    
    return NextResponse.json({
      success: true,
      albums
    })
    
  } catch (error) {
    console.error('Albums API error:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
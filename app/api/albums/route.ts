import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

const ALBUMS_JSON_PATH = join(process.cwd(), 'public', 'albums.json')

// 读取影集数据
function loadAlbums() {
  try {
    const data = readFileSync(ALBUMS_JSON_PATH, 'utf-8')
    const parsed = JSON.parse(data)
    // 确保返回的是数组
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Error loading albums:', error)
    return []
  }
}

// GET - 获取所有影集（公共API）
export async function GET() {
  try {
    const albums = loadAlbums()
    
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
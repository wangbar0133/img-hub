import { NextResponse } from 'next/server'
import { AlbumsResponse } from '@/types'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

// GET - 获取所有影集（代理到新后端API）
export async function GET() {
  try {
    console.log('Proxying albums request to backend:', `${BACKEND_URL}/api/albums`)
    
    const response = await fetch(`${BACKEND_URL}/api/albums`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 禁用缓存以获取最新数据
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }
    
    const data: AlbumsResponse = await response.json()
    
    console.log(`Retrieved ${data.albums?.length || 0} albums from backend`)
    
    const nextResponse = NextResponse.json(data)
    
    // 设置无缓存头，确保返回最新数据
    nextResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    nextResponse.headers.set('Pragma', 'no-cache')
    nextResponse.headers.set('Expires', '0')
    
    return nextResponse
    
  } catch (error) {
    console.error('Albums API proxy error:', error)
    return NextResponse.json(
      { 
        success: false, 
        msg: error instanceof Error ? error.message : 'Backend connection failed',
        albums: []
      } as AlbumsResponse,
      { status: 500 }
    )
  }
}
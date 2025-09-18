import { NextResponse } from 'next/server'
import { AlbumResponse } from '@/types'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

// GET - 获取指定影集（代理到新后端API）
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const albumId = params.id
    console.log('Proxying album request to backend:', `${BACKEND_URL}/api/album/${albumId}`)
    
    const response = await fetch(`${BACKEND_URL}/api/album/${albumId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }
    
    const data: AlbumResponse = await response.json()
    
    console.log(`Retrieved album ${albumId} from backend:`, data.success ? 'success' : 'failed')
    
    const nextResponse = NextResponse.json(data)
    
    // 设置无缓存头
    nextResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    nextResponse.headers.set('Pragma', 'no-cache')
    nextResponse.headers.set('Expires', '0')
    
    return nextResponse
    
  } catch (error) {
    console.error('Album API proxy error:', error)
    return NextResponse.json(
      { 
        success: false, 
        msg: error instanceof Error ? error.message : 'Backend connection failed',
        album: null
      } as AlbumResponse,
      { status: 500 }
    )
  }
}
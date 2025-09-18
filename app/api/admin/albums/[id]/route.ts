import { NextRequest, NextResponse } from 'next/server'
import { DeleteAlbumResponse } from '@/types'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const albumId = params.id
    console.log('Proxying delete album request to backend:', `${BACKEND_URL}/api/album/${albumId}`)

    // 调用后端删除相册接口
    const response = await fetch(`${BACKEND_URL}/api/album/${albumId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const result: DeleteAlbumResponse = await response.json()
    console.log(`Delete album ${albumId} result:`, result.success ? 'success' : 'failed')

    return NextResponse.json(result)
  } catch (error) {
    console.error('Delete album proxy error:', error)
    return NextResponse.json(
      {
        success: false,
        msg: error instanceof Error ? error.message : 'Backend connection failed'
      } as DeleteAlbumResponse,
      { status: 500 }
    )
  }
}
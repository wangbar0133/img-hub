import { NextRequest, NextResponse } from 'next/server'
import { SetCoverResponse } from '@/types'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { cover } = await request.json()
    const albumId = params.id

    console.log('Proxying set cover request to backend:', `${BACKEND_URL}/api/album/${albumId}/cover`, 'cover:', cover)

    const response = await fetch(`${BACKEND_URL}/api/album/${albumId}/cover`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cover }),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const result: SetCoverResponse = await response.json()
    console.log(`Set cover for album ${albumId} result:`, result.success ? 'success' : 'failed')

    return NextResponse.json(result)
  } catch (error) {
    console.error('Set cover proxy error:', error)
    return NextResponse.json(
      {
        success: false,
        msg: error instanceof Error ? error.message : 'Backend connection failed'
      } as SetCoverResponse,
      { status: 500 }
    )
  }
}
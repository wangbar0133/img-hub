import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // 获取表单数据
    const formData = await request.formData()
    
    console.log('Proxying upload request to backend:', `${BACKEND_URL}/api/upload`)
    
    // 转发到后端
    const response = await fetch(`${BACKEND_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    })
    
    const result = await response.json()
    console.log('Upload result from backend:', result)
    
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    console.error('Upload proxy error:', error)
    return NextResponse.json(
      { 
        success: false, 
        msg: 'Failed to proxy upload request',
        uploaded_files: [],
        failed_files: []
      },
      { status: 500 }
    )
  }
}
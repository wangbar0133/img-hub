import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sign, verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'img-hub-admin-secret-key-2024'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    // 验证用户名和密码
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }
    
    // 生成 JWT token
    const token = sign(
      { 
        username: adminUsername,
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
      },
      JWT_SECRET
    )
    
    // 设置 httpOnly cookie
    const response = NextResponse.json(
      { success: true, message: '登录成功' },
      { status: 200 }
    )
    
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      // HTTPS环境下启用secure标志
      secure: process.env.FORCE_HTTPS === 'true',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24小时
      path: '/'
    })
    
    return response
    
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('admin-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }
    
    // 验证 token
    const decoded = verify(token, JWT_SECRET) as any
    
    return NextResponse.json({
      authenticated: true,
      user: {
        username: decoded.username,
        role: decoded.role
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}

export async function DELETE() {
  const response = NextResponse.json(
    { success: true, message: '退出登录成功' },
    { status: 200 }
  )
  
  // 清除 cookie
  response.cookies.delete('admin-token')
  
  return response
}
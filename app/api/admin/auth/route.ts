import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sign, verify } from 'jsonwebtoken'
import { addLog } from '../logs/route'

const JWT_SECRET = process.env.JWT_SECRET || 'img-hub-admin-secret-key-2024'

export async function POST(request: NextRequest) {
  try {
    addLog('info', 'Admin login attempt started')
    
    const { username, password } = await request.json()
    
    addLog('info', `Login attempt for username: ${username}`)
    
    // 验证用户名和密码
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    if (username !== adminUsername || password !== adminPassword) {
      addLog('warn', `Failed login attempt for username: ${username}`, { 
        reason: 'Invalid credentials',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      })
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
    
    addLog('info', `Admin login successful for username: ${username}`, {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })
    
    // 设置 httpOnly cookie
    const response = NextResponse.json(
      { success: true, message: '登录成功' },
      { status: 200 }
    )
    
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      // HTTPS环境下启用secure标志
      secure: process.env.FORCE_HTTPS === 'true',
      // 开发环境使用lax，生产环境使用strict
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24小时
      path: '/'
    })
    
    return response
    
  } catch (error) {
    addLog('error', 'Admin login error', { error: error instanceof Error ? error.message : String(error) })
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    addLog('info', 'Auth status check requested')
    
    const cookieStore = cookies()
    const token = cookieStore.get('admin-token')?.value
    
    if (!token) {
      addLog('warn', 'Auth check failed: No token found')
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }
    
    // 验证 token
    const decoded = verify(token, JWT_SECRET) as any
    
    addLog('info', `Auth check successful for user: ${decoded.username}`)
    
    return NextResponse.json({
      authenticated: true,
      user: {
        username: decoded.username,
        role: decoded.role
      }
    })
    
  } catch (error) {
    addLog('warn', 'Auth check failed: Invalid token', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}

export async function DELETE() {
  addLog('info', 'Admin logout requested')
  
  const response = NextResponse.json(
    { success: true, message: '退出登录成功' },
    { status: 200 }
  )
  
  // 清除 cookie
  response.cookies.delete('admin-token')
  
  addLog('info', 'Admin logout successful')
  
  return response
}
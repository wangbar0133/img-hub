import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

const JWT_SECRET = process.env.JWT_SECRET || 'img-hub-admin-secret-key-2024'

// 验证管理员权限
function verifyAdmin() {
  const cookieStore = cookies()
  const token = cookieStore.get('admin-token')?.value
  
  if (!token) {
    throw new Error('未登录')
  }
  
  try {
    const decoded = verify(token, JWT_SECRET) as any
    if (decoded.role !== 'admin') {
      throw new Error('权限不足')
    }
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    throw new Error('无效的登录状态: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// GET - 获取系统信息
export async function GET(request: NextRequest) {
  try {
    verifyAdmin()
    
    // 数据库路径
    const dbPath = process.env.NODE_ENV === 'production' 
      ? '/app/data/database.db' 
      : path.join(process.cwd(), 'data', 'database.db')
    
    // 检查数据库文件
    let dbExists = false
    let dbSize = 0
    try {
      const stats = fs.statSync(dbPath)
      dbExists = true
      dbSize = stats.size
    } catch (error) {
      // 数据库文件不存在
    }
    
    // 内存使用情况
    const memUsage = process.memoryUsage()
    
    // 系统信息
    const systemInfo = {
      nodeEnv: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      dbPath,
      dbExists,
      dbSize,
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        rss: memUsage.rss,
        external: memUsage.external
      },
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      system: systemInfo
    })
    
  } catch (error) {
    console.error('获取系统信息错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 401 }
    )
  }
}

// POST - 测试API（用于调试）
export async function POST(request: NextRequest) {
  try {
    verifyAdmin()
    
    const { test } = await request.json()
    
    // 根据测试类型执行不同的操作
    switch (test) {
      case 'database':
        try {
          const { getDatabase } = require('@/lib/database')
          const db = await getDatabase()
          const result = await db.get('SELECT COUNT(*) as count FROM albums')
          return NextResponse.json({
            success: true,
            result: `数据库连接正常，共有 ${result.count} 个相册`,
            test: 'database'
          })
        } catch (error) {
          throw new Error('数据库连接失败: ' + (error instanceof Error ? error.message : String(error)))
        }
        
      case 'error':
        // 故意触发一个错误用于测试
        throw new Error('这是一个测试错误')
        
      case 'memory':
        const memBefore = process.memoryUsage()
        // 创建一些对象来测试内存
        const testArray = new Array(100000).fill('test')
        const memAfter = process.memoryUsage()
        
        return NextResponse.json({
          success: true,
          result: {
            before: memBefore.heapUsed,
            after: memAfter.heapUsed,
            difference: memAfter.heapUsed - memBefore.heapUsed,
            testArrayLength: testArray.length
          },
          test: 'memory'
        })
        
      default:
        return NextResponse.json({
          success: true,
          result: '系统运行正常',
          test: test || 'default'
        })
    }
    
  } catch (error) {
    console.error('系统测试错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}
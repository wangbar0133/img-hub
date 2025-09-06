import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// 支持的图片格式
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

// 获取MIME类型
function getMimeType(ext: string): string {
  switch (ext.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    default:
      return 'image/jpeg'
  }
}

// 设置缓存头
function setCacheHeaders(response: NextResponse, isProduction: boolean = false) {
  if (isProduction) {
    // 生产环境：长期缓存
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else {
    // 开发环境：短期缓存
    response.headers.set('Cache-Control', 'public, max-age=3600')
  }
  return response
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // 构建文件路径
    const imagePath = params.path.join('/')
    
    // 安全检查：防止路径遍历攻击
    if (imagePath.includes('..') || imagePath.includes('\\')) {
      return NextResponse.json(
        { error: '无效的文件路径' },
        { status: 400 }
      )
    }

    // 构建完整的文件系统路径
    const fullPath = join(process.cwd(), 'public', 'images', imagePath)
    
    // 检查文件是否存在
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      )
    }

    // 获取文件统计信息
    const fileStat = await stat(fullPath)
    
    // 检查是否是文件
    if (!fileStat.isFile()) {
      return NextResponse.json(
        { error: '请求的不是文件' },
        { status: 404 }
      )
    }

    // 获取文件扩展名
    const ext = '.' + imagePath.split('.').pop()?.toLowerCase()
    
    // 检查是否是支持的图片格式
    if (!SUPPORTED_FORMATS.includes(ext)) {
      return NextResponse.json(
        { error: '不支持的文件格式' },
        { status: 415 }
      )
    }

    // 读取文件
    const fileBuffer = await readFile(fullPath)
    
    // 创建响应
    const response = new NextResponse(fileBuffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': getMimeType(ext),
        'Content-Length': fileBuffer.length.toString(),
        'Last-Modified': fileStat.mtime.toUTCString(),
        'ETag': `"${fileStat.mtime.getTime()}-${fileStat.size}"`,
      }
    })

    // 设置缓存头
    const isProduction = process.env.NODE_ENV === 'production'
    setCacheHeaders(response, isProduction)

    return response
    
  } catch (error) {
    console.error('Static file serving error:', error)
    
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 支持HEAD请求用于检查文件存在
export async function HEAD(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join('/')
    
    if (imagePath.includes('..') || imagePath.includes('\\')) {
      return new NextResponse(null, { status: 400 })
    }

    const fullPath = join(process.cwd(), 'public', 'images', imagePath)
    
    if (!existsSync(fullPath)) {
      return new NextResponse(null, { status: 404 })
    }

    const fileStat = await stat(fullPath)
    
    if (!fileStat.isFile()) {
      return new NextResponse(null, { status: 404 })
    }

    const ext = '.' + imagePath.split('.').pop()?.toLowerCase()
    
    if (!SUPPORTED_FORMATS.includes(ext)) {
      return new NextResponse(null, { status: 415 })
    }

    const response = new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': getMimeType(ext),
        'Content-Length': fileStat.size.toString(),
        'Last-Modified': fileStat.mtime.toUTCString(),
        'ETag': `"${fileStat.mtime.getTime()}-${fileStat.size}"`,
      }
    })

    const isProduction = process.env.NODE_ENV === 'production'
    setCacheHeaders(response, isProduction)

    return response
    
  } catch (error) {
    console.error('HEAD request error:', error)
    return new NextResponse(null, { status: 500 })
  }
}
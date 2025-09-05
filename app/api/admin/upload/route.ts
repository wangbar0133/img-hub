import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { ImageProcessor } from '@/lib/imageProcessor'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const JWT_SECRET = process.env.JWT_SECRET || 'img-hub-admin-secret-key-2024'

// 验证管理员权限
function verifyAdmin(request: NextRequest) {
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
    throw new Error('无效的登录状态')
  }
}

// 生成唯一ID
function generateId(): number {
  return Date.now()
}

// 确保目录存在
async function ensureDirectoryExists(dirPath: string) {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  try {
    verifyAdmin(request)
    
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    const category = formData.get('category') as string
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: '请选择图片文件' },
        { status: 400 }
      )
    }
    
    if (!category || !['travel', 'cosplay'].includes(category)) {
      return NextResponse.json(
        { error: '请选择有效的分类' },
        { status: 400 }
      )
    }
    
    // 项目根目录的 public 目录
    const publicDir = join(process.cwd(), 'public')
    const imagesDir = join(publicDir, 'images')
    
    // 确保所有目录存在
    await ensureDirectoryExists(join(imagesDir, category))
    await ensureDirectoryExists(join(imagesDir, 'detail'))
    await ensureDirectoryExists(join(imagesDir, 'original'))
    await ensureDirectoryExists(join(imagesDir, 'thumbnails', category))
    
    const processedImages = []
    const imageProcessor = new ImageProcessor()
    
    for (const file of files) {
      try {
        // 读取文件内容
        const buffer = Buffer.from(await file.arrayBuffer())
        
        // 验证是否为图片
        if (!ImageProcessor.isValidImage(buffer)) {
          console.warn(`跳过无效图片文件: ${file.name}`)
          continue
        }
        
        // 处理图片
        const processed = await imageProcessor.processImage(buffer)
        
        // 生成文件名
        const photoId = generateId()
        const ext = '.jpg'
        const filename = `${category}_${photoId}${ext}`
        
        // 保存不同尺寸的图片
        await writeFile(join(imagesDir, category, filename), processed.display)
        await writeFile(join(imagesDir, 'detail', filename), processed.detail)
        await writeFile(join(imagesDir, 'original', filename), processed.original)
        await writeFile(join(imagesDir, 'thumbnails', category, filename), processed.thumbnail)
        
        // 构建照片数据
        const photoData = {
          id: photoId,
          src: `/images/${category}/${filename}`,
          detailSrc: `/images/detail/${filename}`,
          originalSrc: `/images/original/${filename}`,
          thumbnail: `/images/thumbnails/${category}/${filename}`,
          alt: file.name.replace(/\.[^/.]+$/, ''), // 移除扩展名
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: '',
          location: '',
          camera: processed.metadata.exif?.camera || 'Unknown',
          settings: processed.metadata.exif?.settings || 'Unknown',
          tags: []
        }
        
        processedImages.push(photoData)
        
      } catch (error) {
        console.error(`处理图片 ${file.name} 失败:`, error)
        // 继续处理其他图片
      }
    }
    
    if (processedImages.length === 0) {
      return NextResponse.json(
        { error: '没有成功处理任何图片' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `成功处理 ${processedImages.length} 张图片`,
      images: processedImages,
      totalProcessed: processedImages.length,
      totalSubmitted: files.length
    })
    
  } catch (error) {
    console.error('上传处理错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}

// 获取上传进度（可选实现）
export async function GET(request: NextRequest) {
  try {
    verifyAdmin(request)
    
    // 可以返回当前正在处理的任务状态
    return NextResponse.json({
      success: true,
      status: 'ready',
      message: '上传服务就绪'
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 401 }
    )
  }
}
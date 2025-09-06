import { NextRequest, NextResponse } from 'next/server'
import { ImageProcessor } from '@/lib/imageProcessor'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { addLog, verifyAdminWithLogging } from '../logs/route'


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
    // 记录上传开始
    addLog('info', 'Image upload started')
    
    verifyAdminWithLogging()
    
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    const category = formData.get('category') as string
    
    addLog('info', `Upload request: ${files.length} files, category: ${category}`)
    
    if (!files || files.length === 0) {
      addLog('warn', 'No files provided in upload request')
      return NextResponse.json(
        { error: '请选择图片文件' },
        { status: 400 }
      )
    }
    
    if (!category || !['travel', 'cosplay'].includes(category)) {
      addLog('warn', `Invalid category: ${category}`)
      return NextResponse.json(
        { error: '请选择有效的分类' },
        { status: 400 }
      )
    }
    
    // 项目根目录的 public 目录
    const publicDir = join(process.cwd(), 'public')
    const imagesDir = join(publicDir, 'images')
    
    addLog('info', `Image directory: ${imagesDir}`)
    
    try {
      // 确保所有目录存在
      await ensureDirectoryExists(join(imagesDir, category))
      await ensureDirectoryExists(join(imagesDir, 'detail'))
      await ensureDirectoryExists(join(imagesDir, 'original'))
      await ensureDirectoryExists(join(imagesDir, 'thumbnails', category))
      addLog('info', 'All directories created successfully')
    } catch (dirError) {
      addLog('error', 'Failed to create directories', { error: dirError })
      throw new Error(`目录创建失败: ${dirError instanceof Error ? dirError.message : '未知错误'}`)
    }
    
    const processedImages = []
    let imageProcessor: ImageProcessor
    
    try {
      imageProcessor = new ImageProcessor()
      addLog('info', 'ImageProcessor initialized')
    } catch (processorError) {
      addLog('error', 'Failed to initialize ImageProcessor', { error: processorError })
      throw new Error(`图片处理器初始化失败: ${processorError instanceof Error ? processorError.message : '未知错误'}`)
    }
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        addLog('info', `Processing file ${i + 1}/${files.length}: ${file.name}`)
        
        // 读取文件内容
        const buffer = Buffer.from(await file.arrayBuffer())
        addLog('info', `File buffer size: ${buffer.length} bytes`)
        
        // 验证是否为图片
        if (!ImageProcessor.isValidImage(buffer)) {
          addLog('warn', `Invalid image file: ${file.name}`)
          continue
        }
        
        // 处理图片
        const processed = await imageProcessor.processImage(buffer)
        addLog('info', `Image processed successfully: ${file.name}`)
        
        // 生成文件名
        const photoId = generateId()
        const ext = '.jpg'
        const filename = `${category}_${photoId}${ext}`
        
        // 保存不同尺寸的图片
        try {
          await writeFile(join(imagesDir, category, filename), processed.display)
          await writeFile(join(imagesDir, 'detail', filename), processed.detail)
          await writeFile(join(imagesDir, 'original', filename), processed.original)
          await writeFile(join(imagesDir, 'thumbnails', category, filename), processed.thumbnail)
          addLog('info', `Files saved successfully: ${filename}`)
        } catch (saveError) {
          addLog('error', `Failed to save files: ${filename}`, { error: saveError })
          throw saveError
        }
        
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
        addLog('error', `Failed to process file: ${file.name}`, { error: error instanceof Error ? error.message : String(error) })
        // 继续处理其他图片
      }
    }
    
    if (processedImages.length === 0) {
      addLog('error', 'No images were processed successfully')
      return NextResponse.json(
        { error: '没有成功处理任何图片' },
        { status: 400 }
      )
    }
    
    addLog('info', `Upload completed successfully: ${processedImages.length} images processed`)
    
    return NextResponse.json({
      success: true,
      message: `成功处理 ${processedImages.length} 张图片`,
      images: processedImages,
      totalProcessed: processedImages.length,
      totalSubmitted: files.length
    })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '服务器错误'
    addLog('error', 'Upload processing failed', { error: errorMessage, stack: error instanceof Error ? error.stack : undefined })
    console.error('上传处理错误:', error)
    
    // 根据错误类型返回适当的状态码
    const isAuthError = errorMessage.includes('未登录') || errorMessage.includes('权限不足') || errorMessage.includes('无效的登录状态')
    const statusCode = isAuthError ? 401 : 500
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}

// 获取上传进度（可选实现）
export async function GET(request: NextRequest) {
  try {
    verifyAdminWithLogging()
    
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
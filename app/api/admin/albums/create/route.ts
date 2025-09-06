import { NextRequest, NextResponse } from 'next/server'
import { AlbumModel } from '@/lib/models/album'
import { PhotoModel } from '@/lib/models/photo'
import { addLog, verifyAdmin } from '@/lib/logging'

export async function POST(request: NextRequest) {
  try {
    addLog('info', 'Album creation request started')
    
    verifyAdmin()
    
    const albumData = await request.json()
    
    addLog('info', `Creating album: "${albumData.title}" with ${albumData.photos?.length || 0} photos`)
    
    // 验证必需字段
    if (!albumData.id || !albumData.title || !albumData.photos || !Array.isArray(albumData.photos)) {
      addLog('warn', 'Album creation failed: Missing required fields', { providedFields: Object.keys(albumData) })
      return NextResponse.json(
        { error: '缺少必需的字段：id、title、photos' },
        { status: 400 }
      )
    }
    
    if (albumData.photos.length === 0) {
      addLog('warn', 'Album creation failed: No photos provided')
      return NextResponse.json(
        { error: '影集至少需要一张照片' },
        { status: 400 }
      )
    }
    
    // 验证分类
    if (!['travel', 'cosplay'].includes(albumData.category)) {
      addLog('warn', `Album creation failed: Invalid category "${albumData.category}"`)
      return NextResponse.json(
        { error: '无效的分类' },
        { status: 400 }
      )
    }
    
    // 检查ID是否已存在
    addLog('info', `Checking if album ID "${albumData.id}" already exists`)
    const existingAlbum = await AlbumModel.getAlbumById(albumData.id)
    if (existingAlbum) {
      addLog('warn', `Album creation failed: ID "${albumData.id}" already exists`)
      return NextResponse.json(
        { error: `影集ID "${albumData.id}" 已存在` },
        { status: 409 }
      )
    }
    
    // 构建影集数据
    const albumInfo = {
      id: albumData.id,
      title: albumData.title,
      description: albumData.description || '',
      coverImage: albumData.coverImage || albumData.photos[0]?.src || '',
      coverPhotoId: albumData.coverPhotoId || albumData.photos[0]?.id,
      category: albumData.category,
      featured: Boolean(albumData.featured),
      location: albumData.location || '',
      createdAt: albumData.createdAt || new Date().toISOString().split('T')[0]
    }
    
    addLog('info', `Creating album in database: "${albumInfo.title}"`)
    
    // 创建影集
    await AlbumModel.createAlbum(albumInfo)
    
    // 添加照片到数据库
    addLog('info', `Adding ${albumData.photos.length} photos to album "${albumInfo.title}"`)
    const photoIds = await PhotoModel.addPhotos(albumData.id, albumData.photos)
    
    // 获取创建的完整影集数据
    const createdAlbum = await AlbumModel.getAlbumById(albumData.id)
    
    addLog('info', `Album "${albumInfo.title}" created successfully`, {
      albumId: albumData.id,
      photoCount: albumData.photos.length,
      category: albumData.category,
      photoIds: photoIds.length
    })
    
    return NextResponse.json({
      success: true,
      message: `影集 "${albumInfo.title}" 创建成功`,
      album: {
        id: createdAlbum!.id,
        title: createdAlbum!.title,
        photoCount: createdAlbum!.photoCount,
        category: createdAlbum!.category
      },
      photoIds
    })
    
  } catch (error) {
    addLog('error', 'Album creation failed', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    console.error('创建影集错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}
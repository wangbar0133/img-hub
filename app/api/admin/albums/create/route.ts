import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const JWT_SECRET = process.env.JWT_SECRET || 'img-hub-admin-secret-key-2024'
const ALBUMS_JSON_PATH = join(process.cwd(), 'public', 'albums.json')

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

// 读取影集数据
function loadAlbums() {
  try {
    const data = readFileSync(ALBUMS_JSON_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

// 保存影集数据
function saveAlbums(albums: any[]) {
  writeFileSync(ALBUMS_JSON_PATH, JSON.stringify(albums, null, 2), 'utf-8')
}

export async function POST(request: NextRequest) {
  try {
    verifyAdmin(request)
    
    const albumData = await request.json()
    
    // 验证必需字段
    if (!albumData.id || !albumData.title || !albumData.photos || !Array.isArray(albumData.photos)) {
      return NextResponse.json(
        { error: '缺少必需的字段：id、title、photos' },
        { status: 400 }
      )
    }
    
    if (albumData.photos.length === 0) {
      return NextResponse.json(
        { error: '影集至少需要一张照片' },
        { status: 400 }
      )
    }
    
    // 验证分类
    if (!['travel', 'cosplay'].includes(albumData.category)) {
      return NextResponse.json(
        { error: '无效的分类' },
        { status: 400 }
      )
    }
    
    const albums = loadAlbums()
    
    // 检查ID是否已存在
    if (albums.some((album: any) => album.id === albumData.id)) {
      return NextResponse.json(
        { error: `影集ID "${albumData.id}" 已存在` },
        { status: 409 }
      )
    }
    
    // 构建完整的影集数据
    const newAlbum = {
      id: albumData.id,
      title: albumData.title,
      description: albumData.description || '',
      coverImage: albumData.coverImage || albumData.photos[0]?.src || '',
      coverPhotoId: albumData.coverPhotoId || albumData.photos[0]?.id,
      category: albumData.category,
      featured: Boolean(albumData.featured),
      location: albumData.location || '',
      createdAt: albumData.createdAt || new Date().toISOString().split('T')[0],
      photoCount: albumData.photos.length,
      photos: albumData.photos
    }
    
    // 添加到影集列表
    albums.push(newAlbum)
    
    // 保存到文件
    saveAlbums(albums)
    
    return NextResponse.json({
      success: true,
      message: `影集 "${newAlbum.title}" 创建成功`,
      album: {
        id: newAlbum.id,
        title: newAlbum.title,
        photoCount: newAlbum.photoCount,
        category: newAlbum.category
      }
    })
    
  } catch (error) {
    console.error('创建影集错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}
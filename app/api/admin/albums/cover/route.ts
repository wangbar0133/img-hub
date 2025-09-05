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

// PUT - 更新影集封面
export async function PUT(request: NextRequest) {
  try {
    verifyAdmin(request)
    
    const { albumId, coverPhotoId } = await request.json()
    
    if (!albumId) {
      return NextResponse.json(
        { error: '缺少影集ID' },
        { status: 400 }
      )
    }
    
    if (coverPhotoId === null || coverPhotoId === undefined) {
      return NextResponse.json(
        { error: '缺少封面照片ID' },
        { status: 400 }
      )
    }
    
    const albums = loadAlbums()
    const albumIndex = albums.findIndex((album: any) => album.id === albumId)
    
    if (albumIndex === -1) {
      return NextResponse.json(
        { error: '影集不存在' },
        { status: 404 }
      )
    }
    
    const album = albums[albumIndex]
    
    // 查找指定的照片
    const coverPhoto = album.photos.find((photo: any) => photo.id === coverPhotoId)
    
    if (!coverPhoto) {
      return NextResponse.json(
        { error: '指定的照片不存在于此影集中' },
        { status: 404 }
      )
    }
    
    // 更新封面信息
    album.coverPhotoId = coverPhotoId
    album.coverImage = coverPhoto.src
    
    albums[albumIndex] = album
    saveAlbums(albums)
    
    return NextResponse.json({
      success: true,
      message: '封面更新成功',
      album: {
        id: album.id,
        title: album.title,
        coverImage: album.coverImage,
        coverPhotoId: album.coverPhotoId
      }
    })
    
  } catch (error) {
    console.error('更新封面错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}
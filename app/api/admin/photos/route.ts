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

// PUT - 更新照片信息
export async function PUT(request: NextRequest) {
  try {
    verifyAdmin(request)
    
    const { albumId, photoId, updates } = await request.json()
    
    if (!albumId || !photoId) {
      return NextResponse.json(
        { error: '缺少影集ID或照片ID' },
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
    const photoIndex = album.photos.findIndex((photo: any) => photo.id === photoId)
    
    if (photoIndex === -1) {
      return NextResponse.json(
        { error: '照片不存在' },
        { status: 404 }
      )
    }
    
    // 更新照片信息
    album.photos[photoIndex] = {
      ...album.photos[photoIndex],
      ...updates,
      // 防止修改某些关键字段
      id: album.photos[photoIndex].id,
      src: album.photos[photoIndex].src,
      detailSrc: album.photos[photoIndex].detailSrc,
      originalSrc: album.photos[photoIndex].originalSrc,
      thumbnail: album.photos[photoIndex].thumbnail
    }
    
    albums[albumIndex] = album
    saveAlbums(albums)
    
    return NextResponse.json({
      success: true,
      message: '照片信息更新成功',
      photo: album.photos[photoIndex]
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}

// DELETE - 删除照片
export async function DELETE(request: NextRequest) {
  try {
    verifyAdmin(request)
    
    const { albumId, photoId } = await request.json()
    
    if (!albumId || !photoId) {
      return NextResponse.json(
        { error: '缺少影集ID或照片ID' },
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
    const photoIndex = album.photos.findIndex((photo: any) => photo.id === photoId)
    
    if (photoIndex === -1) {
      return NextResponse.json(
        { error: '照片不存在' },
        { status: 404 }
      )
    }
    
    // 删除照片
    const deletedPhoto = album.photos.splice(photoIndex, 1)[0]
    
    // 更新影集的照片数量和封面图片
    album.photoCount = album.photos.length
    if (album.coverImage === deletedPhoto.src && album.photos.length > 0) {
      album.coverImage = album.photos[0].src
    } else if (album.photos.length === 0) {
      album.coverImage = ''
    }
    
    albums[albumIndex] = album
    saveAlbums(albums)
    
    return NextResponse.json({
      success: true,
      message: '照片删除成功',
      deletedPhoto,
      album: {
        id: album.id,
        photoCount: album.photoCount,
        coverImage: album.coverImage
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}
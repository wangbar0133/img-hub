import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const JWT_SECRET = process.env.JWT_SECRET || 'img-hub-admin-secret-key-2024'
const ALBUMS_JSON_PATH = join(process.cwd(), 'public', 'albums.json')

// 验证管理员权限的中间件
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

// GET - 获取所有影集（管理员视图）
export async function GET(request: NextRequest) {
  try {
    verifyAdmin(request)
    
    const albums = loadAlbums()
    
    return NextResponse.json({
      success: true,
      albums,
      total: albums.length,
      totalPhotos: albums.reduce((sum: number, album: any) => sum + album.photoCount, 0)
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 401 }
    )
  }
}

// PUT - 更新影集信息
export async function PUT(request: NextRequest) {
  try {
    verifyAdmin(request)
    
    const { albumId, updates } = await request.json()
    
    if (!albumId) {
      return NextResponse.json(
        { error: '缺少影集ID' },
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
    
    // 更新影集信息
    albums[albumIndex] = {
      ...albums[albumIndex],
      ...updates,
      // 防止修改某些关键字段
      id: albums[albumIndex].id,
      photos: albums[albumIndex].photos,
      photoCount: albums[albumIndex].photoCount
    }
    
    saveAlbums(albums)
    
    return NextResponse.json({
      success: true,
      message: '影集更新成功',
      album: albums[albumIndex]
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}

// DELETE - 删除影集
export async function DELETE(request: NextRequest) {
  try {
    verifyAdmin(request)
    
    const { albumId } = await request.json()
    
    if (!albumId) {
      return NextResponse.json(
        { error: '缺少影集ID' },
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
    
    // 删除影集
    const deletedAlbum = albums.splice(albumIndex, 1)[0]
    saveAlbums(albums)
    
    return NextResponse.json({
      success: true,
      message: `影集 "${deletedAlbum.title}" 删除成功`,
      deletedAlbum
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}
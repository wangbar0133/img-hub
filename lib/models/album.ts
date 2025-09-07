import { Album } from '@/types'
import { getDatabase } from '../database'

export class AlbumModel {
  static async getAllAlbums(): Promise<Album[]> {
    const db = await getDatabase()
    
    // 获取所有albums
    const albums = await db.all(`
      SELECT 
        id, title, description, cover_image as coverImage, 
        cover_photo_id as coverPhotoId, category, featured, 
        location, created_at as createdAt, photo_count as photoCount
      FROM albums 
      ORDER BY created_at DESC
    `)
    
    // 为每个album获取photos
    const albumsWithPhotos: Album[] = []
    
    for (const album of albums) {
      const photos = await db.all(`
        SELECT 
          id, src, detail_src as detailSrc, original_src as originalSrc, 
          thumbnail, alt, title, description, location, camera, settings, tags
        FROM photos 
        WHERE album_id = ? 
        ORDER BY id
      `, [album.id])
      
      // 处理tags字段（从JSON字符串解析为数组）
      const processedPhotos = photos.map((photo: any) => ({
        ...photo,
        tags: photo.tags ? JSON.parse(photo.tags) : []
      }))
      
      albumsWithPhotos.push({
        ...album,
        featured: Boolean(album.featured),
        photos: processedPhotos
      })
    }
    
    return albumsWithPhotos
  }
  
  static async getAlbumById(id: string): Promise<Album | null> {
    const db = await getDatabase()
    
    const album = await db.get(`
      SELECT 
        id, title, description, cover_image as coverImage, 
        cover_photo_id as coverPhotoId, category, featured, 
        location, created_at as createdAt, photo_count as photoCount
      FROM albums 
      WHERE id = ?
    `, [id])
    
    if (!album) return null
    
    const photos = await db.all(`
      SELECT 
        id, src, detail_src as detailSrc, original_src as originalSrc, 
        thumbnail, alt, title, description, location, camera, settings, tags
      FROM photos 
      WHERE album_id = ? 
      ORDER BY id
    `, [id])
    
    const processedPhotos = photos.map((photo: any) => ({
      ...photo,
      tags: photo.tags ? JSON.parse(photo.tags) : []
    }))
    
    return {
      ...album,
      featured: Boolean(album.featured),
      photos: processedPhotos
    }
  }
  
  static async createAlbum(albumData: Omit<Album, 'photos' | 'photoCount'>): Promise<string> {
    const db = await getDatabase()
    
    await db.run(`
      INSERT INTO albums 
      (id, title, description, cover_image, cover_photo_id, category, featured, location, created_at, photo_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `, [
      albumData.id,
      albumData.title,
      albumData.description,
      albumData.coverImage,
      albumData.coverPhotoId || null,
      albumData.category,
      albumData.featured ? 1 : 0,
      albumData.location || null,
      albumData.createdAt
    ])
    
    return albumData.id
  }
  
  static async updateAlbum(id: string, updates: Partial<Album>): Promise<boolean> {
    const db = await getDatabase()
    
    const setParts: string[] = []
    const values: any[] = []
    
    if (updates.title !== undefined) {
      setParts.push('title = ?')
      values.push(updates.title)
    }
    if (updates.description !== undefined) {
      setParts.push('description = ?')
      values.push(updates.description)
    }
    if (updates.coverImage !== undefined) {
      setParts.push('cover_image = ?')
      values.push(updates.coverImage)
    }
    if (updates.coverPhotoId !== undefined) {
      setParts.push('cover_photo_id = ?')
      values.push(updates.coverPhotoId)
    }
    if (updates.category !== undefined) {
      setParts.push('category = ?')
      values.push(updates.category)
    }
    if (updates.featured !== undefined) {
      setParts.push('featured = ?')
      values.push(updates.featured ? 1 : 0)
    }
    if (updates.location !== undefined) {
      setParts.push('location = ?')
      values.push(updates.location)
    }
    
    if (setParts.length === 0) return false
    
    values.push(id)
    
    const result = await db.run(`
      UPDATE albums 
      SET ${setParts.join(', ')}
      WHERE id = ?
    `, values)
    
    return result.changes! > 0
  }
  
  static async deleteAlbum(id: string): Promise<boolean> {
    const db = await getDatabase()
    
    // 使用显式事务确保删除操作正确提交
    await db.exec('BEGIN TRANSACTION')
    
    try {
      // 先删除所有相关的photos（通过外键约束会自动删除）
      const result = await db.run('DELETE FROM albums WHERE id = ?', [id])
      
      // 确保操作成功后再提交
      if (result.changes! > 0) {
        await db.exec('COMMIT')
        return true
      } else {
        await db.exec('ROLLBACK')
        return false
      }
    } catch (error) {
      // 如果出现任何错误，回滚事务
      await db.exec('ROLLBACK')
      throw error
    }
  }
  
  static async updatePhotoCount(albumId: string): Promise<void> {
    const db = await getDatabase()
    
    await db.run(`
      UPDATE albums 
      SET photo_count = (
        SELECT COUNT(*) FROM photos WHERE album_id = ?
      )
      WHERE id = ?
    `, [albumId, albumId])
  }
  
  static async updateCover(albumId: string, coverPhotoId: number): Promise<boolean> {
    const db = await getDatabase()
    
    // 首先验证照片是否存在于指定影集中
    const photo = await db.get(`
      SELECT src FROM photos 
      WHERE id = ? AND album_id = ?
    `, [coverPhotoId, albumId])
    
    if (!photo) {
      return false
    }
    
    // 更新影集的封面信息
    const result = await db.run(`
      UPDATE albums 
      SET cover_photo_id = ?, cover_image = ?
      WHERE id = ?
    `, [coverPhotoId, photo.src, albumId])
    
    return result.changes! > 0
  }
}
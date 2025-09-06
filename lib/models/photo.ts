import { Photo } from '@/types'
import { getDatabase } from '../database'
import { AlbumModel } from './album'

export class PhotoModel {
  static async addPhoto(albumId: string, photoData: Omit<Photo, 'id'>): Promise<number> {
    const db = await getDatabase()
    
    const result = await db.run(`
      INSERT INTO photos 
      (album_id, src, detail_src, original_src, thumbnail, alt, title, description, location, camera, settings, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      albumId,
      photoData.src,
      photoData.detailSrc || null,
      photoData.originalSrc || null,
      photoData.thumbnail || null,
      photoData.alt,
      photoData.title,
      photoData.description,
      photoData.location || null,
      photoData.camera || null,
      photoData.settings || null,
      photoData.tags ? JSON.stringify(photoData.tags) : null
    ])
    
    const photoId = result.lastID as number
    
    // 更新album的photo count
    await AlbumModel.updatePhotoCount(albumId)
    
    return photoId
  }
  
  static async addPhotos(albumId: string, photos: Omit<Photo, 'id'>[]): Promise<number[]> {
    const db = await getDatabase()
    const photoIds: number[] = []
    
    // 使用事务确保数据一致性
    await db.exec('BEGIN TRANSACTION')
    
    try {
      for (const photoData of photos) {
        const result = await db.run(`
          INSERT INTO photos 
          (album_id, src, detail_src, original_src, thumbnail, alt, title, description, location, camera, settings, tags)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          albumId,
          photoData.src,
          photoData.detailSrc || null,
          photoData.originalSrc || null,
          photoData.thumbnail || null,
          photoData.alt,
          photoData.title,
          photoData.description,
          photoData.location || null,
          photoData.camera || null,
          photoData.settings || null,
          photoData.tags ? JSON.stringify(photoData.tags) : null
        ])
        
        photoIds.push(result.lastID as number)
      }
      
      // 更新album的photo count
      await AlbumModel.updatePhotoCount(albumId)
      
      await db.exec('COMMIT')
    } catch (error) {
      await db.exec('ROLLBACK')
      throw error
    }
    
    return photoIds
  }
  
  static async updatePhoto(photoId: number, updates: Partial<Photo>): Promise<boolean> {
    const db = await getDatabase()
    
    const setParts: string[] = []
    const values: any[] = []
    
    if (updates.src !== undefined) {
      setParts.push('src = ?')
      values.push(updates.src)
    }
    if (updates.detailSrc !== undefined) {
      setParts.push('detail_src = ?')
      values.push(updates.detailSrc)
    }
    if (updates.originalSrc !== undefined) {
      setParts.push('original_src = ?')
      values.push(updates.originalSrc)
    }
    if (updates.thumbnail !== undefined) {
      setParts.push('thumbnail = ?')
      values.push(updates.thumbnail)
    }
    if (updates.alt !== undefined) {
      setParts.push('alt = ?')
      values.push(updates.alt)
    }
    if (updates.title !== undefined) {
      setParts.push('title = ?')
      values.push(updates.title)
    }
    if (updates.description !== undefined) {
      setParts.push('description = ?')
      values.push(updates.description)
    }
    if (updates.location !== undefined) {
      setParts.push('location = ?')
      values.push(updates.location)
    }
    if (updates.camera !== undefined) {
      setParts.push('camera = ?')
      values.push(updates.camera)
    }
    if (updates.settings !== undefined) {
      setParts.push('settings = ?')
      values.push(updates.settings)
    }
    if (updates.tags !== undefined) {
      setParts.push('tags = ?')
      values.push(updates.tags ? JSON.stringify(updates.tags) : null)
    }
    
    if (setParts.length === 0) return false
    
    values.push(photoId)
    
    const result = await db.run(`
      UPDATE photos 
      SET ${setParts.join(', ')}
      WHERE id = ?
    `, values)
    
    return result.changes! > 0
  }
  
  static async deletePhoto(photoId: number): Promise<string | null> {
    const db = await getDatabase()
    
    // 先获取photo所属的albumId
    const photo = await db.get('SELECT album_id FROM photos WHERE id = ?', [photoId])
    
    if (!photo) return null
    
    const result = await db.run('DELETE FROM photos WHERE id = ?', [photoId])
    
    if (result.changes! > 0) {
      // 更新album的photo count
      await AlbumModel.updatePhotoCount(photo.album_id)
      return photo.album_id
    }
    
    return null
  }
  
  static async getPhotoById(photoId: number): Promise<Photo | null> {
    const db = await getDatabase()
    
    const photo = await db.get(`
      SELECT 
        id, src, detail_src as detailSrc, original_src as originalSrc, 
        thumbnail, alt, title, description, location, camera, settings, tags
      FROM photos 
      WHERE id = ?
    `, [photoId])
    
    if (!photo) return null
    
    return {
      ...photo,
      tags: photo.tags ? JSON.parse(photo.tags) : []
    }
  }
  
  static async getPhotosByAlbum(albumId: string): Promise<Photo[]> {
    const db = await getDatabase()
    
    const photos = await db.all(`
      SELECT 
        id, src, detail_src as detailSrc, original_src as originalSrc, 
        thumbnail, alt, title, description, location, camera, settings, tags
      FROM photos 
      WHERE album_id = ? 
      ORDER BY id
    `, [albumId])
    
    return photos.map((photo: any) => ({
      ...photo,
      tags: photo.tags ? JSON.parse(photo.tags) : []
    }))
  }
}
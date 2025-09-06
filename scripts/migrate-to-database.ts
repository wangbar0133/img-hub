import { readFileSync } from 'fs'
import path from 'path'
import { AlbumModel } from '../lib/models/album'
import { PhotoModel } from '../lib/models/photo'
import { Album } from '../types'

async function migrateData() {
  try {
    console.log('开始数据迁移...')
    
    // 读取现有的albums.json
    const albumsJsonPath = path.join(process.cwd(), 'public', 'albums.json')
    const albumsData = JSON.parse(readFileSync(albumsJsonPath, 'utf-8')) as Album[]
    
    console.log(`找到 ${albumsData.length} 个影集`)
    
    let migratedAlbums = 0
    let migratedPhotos = 0
    
    for (const album of albumsData) {
      try {
        console.log(`迁移影集: ${album.title} (${album.id})`)
        
        // 创建album（不包含photos）
        await AlbumModel.createAlbum({
          id: album.id,
          title: album.title,
          description: album.description,
          coverImage: album.coverImage,
          coverPhotoId: album.coverPhotoId,
          category: album.category,
          featured: album.featured,
          location: album.location,
          createdAt: album.createdAt
        })
        
        migratedAlbums++
        
        // 添加photos
        if (album.photos && album.photos.length > 0) {
          console.log(`  添加 ${album.photos.length} 张照片...`)
          
          const photosToAdd = album.photos.map(photo => ({
            src: photo.src,
            detailSrc: photo.detailSrc,
            originalSrc: photo.originalSrc,
            thumbnail: photo.thumbnail,
            alt: photo.alt,
            title: photo.title,
            description: photo.description,
            location: photo.location,
            camera: photo.camera,
            settings: photo.settings,
            tags: photo.tags
          }))
          
          await PhotoModel.addPhotos(album.id, photosToAdd)
          migratedPhotos += album.photos.length
        }
        
        console.log(`  ✅ 影集 ${album.title} 迁移完成`)
      } catch (error) {
        console.error(`  ❌ 迁移影集 ${album.title} 失败:`, error)
      }
    }
    
    console.log('\n迁移完成!')
    console.log(`✅ 成功迁移 ${migratedAlbums} 个影集`)
    console.log(`✅ 成功迁移 ${migratedPhotos} 张照片`)
    
    // 验证迁移结果
    console.log('\n验证迁移结果...')
    const migratedAlbumsFromDb = await AlbumModel.getAllAlbums()
    console.log(`数据库中共有 ${migratedAlbumsFromDb.length} 个影集`)
    
    const totalPhotosInDb = migratedAlbumsFromDb.reduce((sum, album) => sum + album.photos.length, 0)
    console.log(`数据库中共有 ${totalPhotosInDb} 张照片`)
    
  } catch (error) {
    console.error('数据迁移失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  migrateData().then(() => {
    console.log('迁移脚本执行完成')
    process.exit(0)
  }).catch((error) => {
    console.error('迁移脚本执行失败:', error)
    process.exit(1)
  })
}

export default migrateData
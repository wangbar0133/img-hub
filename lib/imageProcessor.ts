import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join } from 'path'

export interface ImageProcessingConfig {
  thumbnailSize: number
  displaySize: number
  detailSize: number
  thumbnailQuality: number
  displayQuality: number
  detailQuality: number
  originalQuality: number
}

export interface ProcessedImage {
  thumbnail: Buffer
  display: Buffer
  detail: Buffer
  original: Buffer
  metadata: ImageMetadata
}

export interface ImageMetadata {
  width: number
  height: number
  format: string
  size: number
  exif?: any
}

export class ImageProcessor {
  private config: ImageProcessingConfig

  constructor(config?: Partial<ImageProcessingConfig>) {
    this.config = {
      thumbnailSize: 400,
      displaySize: 800,
      detailSize: 900,
      thumbnailQuality: 75,
      displayQuality: 85,
      detailQuality: 90,
      originalQuality: 95,
      ...config
    }
  }

  async processImage(inputBuffer: Buffer): Promise<ProcessedImage> {
    try {
      // 获取图片信息
      const image = sharp(inputBuffer)
      const metadata = await image.metadata()
      
      // 提取 EXIF 信息
      const exifData = metadata.exif ? this.parseExif(metadata.exif) : {}
      
      // 生成缩略图 (400px, 保持比例)
      const thumbnail = await image
        .clone()
        .resize(this.config.thumbnailSize, this.config.thumbnailSize, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: this.config.thumbnailQuality })
        .toBuffer()

      // 生成展示图 (800px, 保持比例)
      const display = await image
        .clone()
        .resize(this.config.displaySize, this.config.displaySize, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: this.config.displayQuality })
        .toBuffer()

      // 生成详情图 (900px, 保持比例)
      const detail = await image
        .clone()
        .resize(this.config.detailSize, this.config.detailSize, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: this.config.detailQuality })
        .toBuffer()

      // 处理原图 (保持原始尺寸但优化质量)
      const original = await image
        .clone()
        .jpeg({ quality: this.config.originalQuality })
        .toBuffer()

      return {
        thumbnail,
        display,
        detail,
        original,
        metadata: {
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: metadata.format || 'jpeg',
          size: inputBuffer.length,
          exif: exifData
        }
      }
    } catch (error) {
      throw new Error(`图片处理失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  private parseExif(exifBuffer: Buffer): Record<string, any> {
    try {
      // 这里可以使用 exif-js 或其他库来解析 EXIF
      // 目前返回基础信息
      return {}
    } catch (error) {
      console.warn('EXIF 解析失败:', error)
      return {}
    }
  }

  // 验证图片格式
  static isValidImage(buffer: Buffer): boolean {
    try {
      // 检查文件头
      const header = buffer.subarray(0, 12)
      
      // JPEG
      if (header[0] === 0xFF && header[1] === 0xD8) return true
      
      // PNG
      if (header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return true
      
      // WebP
      if (header.subarray(0, 4).equals(Buffer.from('RIFF', 'ascii')) && 
          header.subarray(8, 12).equals(Buffer.from('WEBP', 'ascii'))) return true
      
      return false
    } catch {
      return false
    }
  }

  // 获取图片基本信息
  static async getImageInfo(buffer: Buffer): Promise<ImageMetadata> {
    try {
      const image = sharp(buffer)
      const metadata = await image.metadata()
      
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: buffer.length
      }
    } catch (error) {
      throw new Error(`获取图片信息失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
}
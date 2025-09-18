// 图片信息类型定义
export interface ImageInfo {
  width: number
  height: number
  format: string
  file_size: number
  created_at?: string
  camera_make?: string
  camera_model?: string
  lens_model?: string
  focal_length?: number
  aperture?: number
  exposure_time?: string
  iso?: number
  flash?: string
  white_balance?: string
}

// 图片类型定义
export interface Photo {
  src: string          // 原始文件名
  detail: string       // 详情页面用的图片（最大1920x1080）
  medium: string       // 中等尺寸图片（最大800x600）
  thumbnail: string    // 缩略图（最大300x300）
  info: ImageInfo      // 图片元数据信息
}

// 影集类型定义
export interface Album {
  id: string
  title: string
  cover: string        // 封面图片文件名
  category: string
  shot_time: string    // ISO 8601格式
  updata_time: string  // ISO 8601格式
  featured: boolean    // 是否精选
  hidden: boolean      // 是否隐藏
  photos: Photo[]
}

// API响应类型定义
export interface ApiResponse {
  success: boolean
  msg?: string
  [key: string]: any  // 允许额外的数据字段
}

export interface AlbumsResponse extends ApiResponse {
  albums: Album[]
}

export interface AlbumResponse extends ApiResponse {
  album: Album | null
}

export interface UploadResponse extends ApiResponse {
  uploaded_files: string[]
  failed_files: string[]
}

// 设置封面响应类型
export interface SetCoverResponse extends ApiResponse {
  // 继承基础响应类型即可
}

// 删除相册响应类型
export interface DeleteAlbumResponse extends ApiResponse {
  // 继承基础响应类型即可
}

// 上传表单数据类型
export interface UploadFormData {
  id?: string
  title?: string
  category?: string
  featured?: boolean
  hidden?: boolean
  images: File[]
} 
import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import path from 'path'
import fs from 'fs'

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null

export async function getDatabase() {
  if (!db) {
    const dbPath = process.env.NODE_ENV === 'production' 
      ? '/app/data/database.db' 
      : path.join(process.cwd(), 'data', 'database.db')
    
    // 确保数据目录存在
    const dbDir = path.dirname(dbPath)
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }
    
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      })
      
      await initializeTables()
    } catch (error) {
      console.error('Database connection failed:', error)
      console.error('Database path:', dbPath)
      console.error('Directory exists:', fs.existsSync(dbDir))
      console.error('Directory permissions:', fs.statSync(dbDir))
      throw error
    }
  }
  
  return db
}

async function initializeTables() {
  if (!db) return
  
  // 创建albums表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS albums (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      cover_image TEXT,
      cover_photo_id INTEGER,
      category TEXT CHECK(category IN ('travel', 'cosplay')) NOT NULL,
      featured BOOLEAN DEFAULT 0,
      location TEXT,
      created_at TEXT NOT NULL,
      photo_count INTEGER DEFAULT 0
    )
  `)
  
  // 创建photos表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY,
      album_id TEXT NOT NULL,
      src TEXT NOT NULL,
      detail_src TEXT,
      original_src TEXT,
      thumbnail TEXT,
      alt TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT,
      camera TEXT,
      settings TEXT,
      tags TEXT, -- JSON字符串存储标签数组
      FOREIGN KEY (album_id) REFERENCES albums (id) ON DELETE CASCADE
    )
  `)
  
  // 创建索引
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos (album_id)
  `)
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_albums_category ON albums (category)
  `)
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_albums_featured ON albums (featured)
  `)
}

export async function closeDatabase() {
  if (db) {
    await db.close()
    db = null
  }
}
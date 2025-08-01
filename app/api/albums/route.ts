import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Album } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const albumsPath = join(process.cwd(), 'public', 'albums.json')
    const fileContent = readFileSync(albumsPath, 'utf-8')
    const albums: Album[] = JSON.parse(fileContent)
    
    return NextResponse.json(albums)
  } catch (error) {
    console.error('Error reading albums.json:', error)
    return NextResponse.json([], { status: 200 })
  }
}
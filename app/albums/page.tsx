import { loadAlbumsFromFile } from '@/data/albums'
import AlbumsClient from './AlbumsClient'

export default function AlbumsPage() {
  const albums = loadAlbumsFromFile()
  
  return <AlbumsClient initialAlbums={albums} />
} 
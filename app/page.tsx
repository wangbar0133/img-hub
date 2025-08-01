import { loadAlbumsFromFile } from '@/data/albums'
import HomeClient from './HomeClient'

export default function Home() {
  const albums = loadAlbumsFromFile()
  
  return <HomeClient initialAlbums={albums} />
} 
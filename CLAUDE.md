# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm install` - Install dependencies
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build production version
- `npm run lint` - Run ESLint checks
- `npm run export` - Export static files (used by Docker build)

### Image Management
- `python3 scripts/img-manager.py local-test` - Process images locally and test
- `python3 scripts/img-manager.py deploy` - Deploy to ECS remotely
- `python3 scripts/img-manager.py ecs-config` - Configure ECS connection
- `python3 scripts/img-manager.py status` - Check data status
- `python3 scripts/img-manager.py local-preview` - Start local preview server

### Docker Operations
- `docker-compose up -d` - Start application in production mode
- `docker-compose logs -f img-hub` - View application logs
- `docker-compose ps` - Check container status
- `docker-compose down` - Stop all services

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI**: Framer Motion for animations, Lucide React for icons
- **Deployment**: Docker + Nginx, supports ECS remote deployment
- **Image Processing**: ImageMagick via Python scripts

### Core Structure

#### Data Flow
- Image data is managed through `public/albums.json` - the single source of truth
- Images are stored in 4-tier structure: thumbnail (400px) → src (800px) → detailSrc (900px) → originalSrc (full size)
- Data interface in `data/albums.ts` imports from the JSON file
- TypeScript types defined in `types/index.ts`

#### Routing Structure
```
/ (homepage)
├── /albums (album list with category filtering)
├── /albums/[albumId] (album detail view)
└── /albums/[albumId]/photos/[photoId] (photo detail with full-screen modal)
```

#### Key Components
- `AlbumGrid.tsx` - Displays album thumbnails in grid layout
- `FullScreenModal.tsx` - Full-screen photo viewing experience
- `Header.tsx` - Navigation with smart breadcrumbs
- `Gallery.tsx` - Photo grid within albums

#### Docker Architecture
- Uses multi-stage build (Node.js builder → Nginx production)
- **Data separation strategy**: Container excludes `public/images/` and `albums.json`, mounts them at runtime
- This allows image updates without rebuilding containers
- Nginx serves static files with optimized caching headers

### Image Management System

The Python script `scripts/img-manager.py` is the primary tool for content management:

#### Key Features
- **Four-tier image processing**: Automatically generates thumbnails, display images, detail images, and preserves originals
- **Workspace isolation**: Uses `~/.img-hub-workspace` for processing, doesn't modify project files directly
- **ECS integration**: Can deploy directly to remote ECS instances
- **Batch processing**: Handles multiple images and automatically updates `albums.json`
- **Quality settings**: Thumbnail (75%), Display (85%), Detail (90%), Original (100%)

#### Configuration
- ECS settings stored in `~/.img-hub-workspace/ecs-config.json`
- Image processing parameters defined in script constants
- Albums categorized as 'travel' or 'cosplay'

### Deployment Strategy

#### Local Development
Next.js development server with hot reload. Images served directly from `public/` directory.

#### Production (Docker)
- Static export via `next export` (configured in `next.config.js`)
- Nginx serves static files with aggressive caching
- Public folder content mounted as Docker volumes
- Health checks and restart policies configured

#### ECS Remote Deployment
- Source code synced via rsync
- Remote Docker build and deployment
- Automated container restart with zero downtime
- Supports rolling updates

### Important Files

- `public/albums.json` - Master data file containing all album and photo metadata
- `nginx.conf` - Production web server configuration with caching rules
- `docker-compose.yml` - Container orchestration with volume mounts
- `next.config.js` - Static export configuration and image optimization settings

### Development Notes

- Always use the image management script for adding new photos - never manually edit `albums.json`
- The codebase uses TypeScript strict mode
- Static export mode means no server-side APIs - all data is compile-time
- Images must follow the four-tier naming convention (handled automatically by scripts)
- ECS deployment requires proper SSH key configuration and server Docker setup
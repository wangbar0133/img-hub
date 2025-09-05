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

- Images are managed through the web admin interface at `/admin`
- Upload and organize photos through the admin dashboard
- Automatic image processing generates 4 tiers: thumbnails, display, detail, and original

### Docker Operations

- `docker-compose up -d` - Start application in production mode
- `docker-compose logs -f img-hub` - View application logs
- `docker-compose ps` - Check container status
- `docker-compose down` - Stop all services

## Architecture Overview

### Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI**: Framer Motion for animations, Lucide React for icons
- **Deployment**: Docker + Nginx
- **Image Processing**: Server-side Sharp library processing

### Core Structure

#### Data Flow

- Image data is managed through `public/albums.json` - the single source of truth
- Images are stored in 4-tier structure: thumbnail (400px) → src (800px) → detailSrc (900px) → originalSrc (full size)
- Data interface in `data/albums.ts` imports from the JSON file
- TypeScript types defined in `types/index.ts`

#### Routing Structure

```text
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

Web-based admin interface at `/admin` provides complete content management:

#### Key Features

- **Web-based upload**: Upload multiple images through browser interface
- **Four-tier processing**: Server-side Sharp processing generates thumbnails, display, detail, and original images
- **Album creation**: Create and organize albums with metadata
- **Cover photo selection**: Choose cover images for albums with visual feedback
- **Real-time preview**: See results immediately in admin dashboard

#### Admin Authentication

- JWT-based authentication system
- Configurable admin credentials via environment variables
- Secure cookie-based session management

### Deployment Strategy

#### Local Development

Next.js development server with API routes for admin functionality.

#### Production (Docker)

- Full-stack application with Next.js API routes
- Server-side image processing with Sharp library
- Data persistence through Docker volumes
- JWT authentication for admin access

### Important Files

- `public/albums.json` - Master data file containing all album and photo metadata
- `lib/imageProcessor.ts` - Server-side image processing with Sharp
- `app/admin/` - Admin interface components and pages
- `app/api/admin/` - Admin API routes for authentication and data management
- `docker-compose.yml` - Container orchestration with data volume mounts

### Development Notes

- Use the web admin interface at `/admin` for all content management
- Images are processed server-side with automatic optimization
- Album data is stored in JSON format with type safety
- Admin credentials should be configured via environment variables for production
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
- `./deploy.sh` - Automated deployment with Docker image optimization options

#### Docker Image Optimization

The Dockerfile is optimized for minimal image size through:
- **Multi-stage builds**: Separate stages for dependencies, building, and runtime
- **Alpine Linux base**: Lightweight Node.js Alpine images
- **Layer optimization**: Minimized layers and cleaned caches
- **Production-only dependencies**: Separate installation of dev and prod dependencies
- **Cache cleanup**: Removal of npm cache, build artifacts, and APK cache

## Architecture Overview

### Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI**: Framer Motion for animations, Lucide React for icons
- **Backend**: Rust backend API server (external)
- **Database**: MongoDB (managed by backend API)
- **Deployment**: Docker + Nginx for frontend, separate backend deployment

### Core Structure

#### Data Flow

- Image data is managed through external Rust backend API
- Frontend acts as API proxy/client to backend services
- Images are processed by backend in 4-tier structure: thumbnail (300px) → src (800px) → detail (900px) → original (full size)
- Data access through REST API calls to backend endpoints
- TypeScript types defined in `types/index.ts` match backend API responses

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
- **Data separation strategy**: Container excludes `public/images/`, database persisted via volumes
- This allows image and data updates without rebuilding containers
- Nginx serves static files with optimized caching headers

### Image Management System

Content management is handled by the external backend API:

#### Key Features

- **Backend API upload**: Images uploaded and processed by Rust backend
- **Four-tier processing**: Backend generates thumbnails (300px), display (800px), detail (900px), and original images
- **Album management**: Create and organize albums through backend API
- **MongoDB storage**: Album metadata and image info stored in MongoDB
- **Static file serving**: Backend serves processed images via `/public/` endpoint

#### API Integration

- Frontend proxies requests to backend API (default: http://localhost:8000)
- Environment variable `BACKEND_URL` configures backend location
- All CRUD operations handled by backend REST API

### Deployment Strategy

#### Local Development

- Next.js development server for frontend
- External Rust backend API server
- Configure `BACKEND_URL` environment variable to point to backend

#### Production (Docker)

- Frontend: Next.js application in Docker container
- Backend: Separate Rust API server deployment
- MongoDB: Database managed by backend
- Static files: Served by backend at `/public/` endpoint

### Important Files

- `app/api/albums/` - Frontend API routes that proxy to backend
- `lib/albumUtils.ts` - Helper functions for working with album data
- `types/index.ts` - TypeScript interfaces matching backend API responses
- `docker-compose.yml` - Container orchestration for frontend deployment

### Development Notes

- Backend API handles all content management and image processing
- Frontend acts as a proxy and UI layer for the backend services
- Album data is fetched from backend API and cached on frontend
- Configure `BACKEND_URL` and `NEXT_PUBLIC_BACKEND_URL` environment variables
- All image uploads and processing handled by external backend

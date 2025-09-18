# Frontend-only Next.js Docker build

# Dependencies stage
FROM node:18-alpine AS deps
WORKDIR /app

# Install minimal dependencies for building
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Builder stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# Copy source code
COPY . .

# Build the application
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Install minimal runtime dependencies
RUN apk add --no-cache libc6-compat && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

# Environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    BACKEND_URL=http://localhost:8000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/').on('response', () => process.exit(0)).on('error', () => process.exit(1))" || exit 1

CMD ["node", "server.js"]
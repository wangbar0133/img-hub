# 多阶段构建优化 Dockerfile

# 第一阶段：构建应用
FROM node:18-alpine AS deps

WORKDIR /app

# 安装构建所需的最小依赖
RUN apk add --no-cache \
    make gcc g++ python3 sqlite-dev \
    vips-dev libc6-compat pkgconfig

# 复制package文件，利用Docker缓存
COPY package*.json ./

# 只安装生产依赖和构建依赖
RUN npm ci --only=production && \
    npm ci --only=development --cache /tmp/npm-cache

# 第二阶段：构建应用
FROM node:18-alpine AS builder

WORKDIR /app

# 从deps阶段复制node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# 安装Sharp构建依赖
RUN apk add --no-cache vips-dev libc6-compat

# 重建Sharp以确保Alpine兼容性
RUN npm rebuild --arch=x64 --platform=linux --libc=musl sharp
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1

# 复制源代码
COPY . .

# 注：不再需要 albums.json 占位文件，现在使用数据库存储

# 构建应用
ENV NODE_ENV=production
RUN npm run build

# 清理缓存和不必要文件
RUN rm -rf .next/cache /tmp/* /var/cache/apk/*

# 第三阶段：生产依赖
FROM node:18-alpine AS prod-deps

WORKDIR /app

# 安装运行时最小依赖
RUN apk add --no-cache sqlite vips libc6-compat

# 复制package文件
COPY package*.json ./

# 只安装生产依赖，并清理npm缓存
RUN npm ci --only=production --cache /tmp/npm-cache && \
    npm rebuild --arch=x64 --platform=linux --libc=musl sharp && \
    npm cache clean --force && \
    rm -rf /tmp/npm-cache

# 第四阶段：最终运行时镜像
FROM node:18-alpine AS runner

# 安装最小运行时依赖
RUN apk add --no-cache \
    sqlite vips libc6-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p data/images logs public/images

# 从构建阶段复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/server-wrapper.js ./
# 只复制生产依赖
COPY --from=prod-deps /app/node_modules ./node_modules

# 设置权限和环境变量
RUN chown -R nextjs:nodejs /app && \
    touch /app/logs/server.log && \
    chown nextjs:nodejs /app/logs/server.log && \
    chmod 664 /app/logs/server.log

USER nextjs

ENV NODE_ENV=production \
    PORT=3000 \
    SHARP_IGNORE_GLOBAL_LIBVIPS=1

EXPOSE 3000

# 使用更轻量的healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/').on('response', () => process.exit(0)).on('error', () => process.exit(1))" || exit 1

CMD ["node", "server.js"]
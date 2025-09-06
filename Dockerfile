# 多阶段构建优化 Dockerfile

# 第一阶段：构建应用
FROM node:18-alpine AS builder

WORKDIR /app

# 安装构建工具、SQLite3、Sharp和图片处理所需的依赖
RUN apk add --no-cache \
    make gcc g++ python3 sqlite-dev \
    vips-dev libc6-compat \
    pkgconfig

# 复制package文件，利用Docker缓存
COPY package*.json ./

# 安装所有依赖（包括SQLite3和Sharp原生模块编译）
RUN npm ci

# 重新安装Sharp以确保Alpine兼容性
RUN npm rebuild --arch=x64 --platform=linux --libc=musl sharp
# 额外确保Sharp在Alpine环境下正常工作
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1

# 复制源代码
COPY . .

# 创建构建时需要的占位文件（如果不存在的话）
RUN if [ ! -f public/albums.json ]; then \
    echo '[]' > public/albums.json; \
    fi

# 设置生产环境并构建
ENV NODE_ENV=production
RUN npm run build

# 清理开发依赖，只保留生产依赖
RUN npm prune --production && \
    rm -rf .next/cache

# 第二阶段：运行时镜像
FROM node:18-alpine AS runner

# 安装运行时工具、SQLite和Sharp所需的库
RUN apk add --no-cache \
    wget sqlite \
    vips \
    libc6-compat

WORKDIR /app

# 创建用户和目录
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p data/images logs public/images

# 从构建阶段复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/server-wrapper.js ./
# 复制SQLite和Sharp相关的编译模块
COPY --from=builder /app/node_modules/sqlite3 ./node_modules/sqlite3
COPY --from=builder /app/node_modules/sqlite ./node_modules/sqlite
COPY --from=builder /app/node_modules/bindings ./node_modules/bindings
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp

# 设置正确的权限，并预创建日志文件
RUN chown -R nextjs:nodejs /app && \
    touch /app/logs/server.log && \
    chown nextjs:nodejs /app/logs/server.log && \
    chmod 664 /app/logs/server.log
USER nextjs

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# 启动服务器，使用内存日志系统而不是文件输出
CMD ["node", "server.js"]
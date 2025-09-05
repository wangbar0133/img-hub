# Node.js 服务器模式 Dockerfile
FROM node:18-alpine

WORKDIR /app

# 先复制package文件，利用Docker缓存
COPY package*.json ./

# 安装依赖 (包括开发依赖，构建需要TypeScript等)
RUN npm ci --ignore-scripts

# 复制源代码
COPY . .

# 设置生产环境
ENV NODE_ENV=production

# 构建应用 (服务器模式)
RUN npm run build

# 创建数据目录和日志目录
RUN mkdir -p data/images logs public/images && \
    chown -R node:node /app

# 切换到非root用户
USER node

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# 启动Next.js服务器
CMD ["npm", "start"]
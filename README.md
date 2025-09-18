# 📸 ImgHub - 现代摄影作品展示平台

一个基于 **Next.js 前端 + Rust 后端 + MongoDB 数据库** 构建的现代化摄影作品展示平台，采用微服务架构，提供沉浸式的视觉体验和完整的内容管理系统。

## ✨ 核心特性

- 🎨 **极简设计** - 专注作品展示的纯净界面
- 📱 **完美适配** - 桌面端和移动端响应式体验
- 📚 **影集体系** - 层级化的作品组织方式
- 🖼️ **沉浸体验** - 全屏无干扰的作品浏览
- 💫 **流畅动画** - 细腻的交互动画效果
- ⭐ **精选展示** - 首页精选相册瀑布流展示
- ⚡ **性能优化** - 四层图片优化策略
- 🔐 **管理后台** - Web端内容管理系统
- 🐳 **容器化部署** - Docker Hub + 微服务架构
- 🔒 **HTTPS 支持** - 生产环境SSL证书管理

## 🏗️ 系统架构

### 微服务架构

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │  Next.js 前端   │    │   Rust 后端     │
│   (SSL + 反向)   │────│   (UI层)       │────│   (API + 业务)   │
│     代理         │    │                │    │                │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                         ┌─────────────────┐
                         │   MongoDB       │
                         │   (数据存储)     │
                         └─────────────────┘
```

### 页面结构

```text
首页 (Hero + 精选影集)
├── 影集列表页 (/albums)
│   ├── 旅行摄影 (/albums?category=travel)
│   └── Cosplay摄影 (/albums?category=cosplay)
├── 影集详情页 (/albums/[albumId])
│   └── 照片详情页 (/albums/[albumId]/photos/[photoId])
│       └── 全屏查看模式
└── 管理后台 (/admin)
    ├── 上传界面 (/admin)
    └── 相册管理 (/admin/manage)
```

### 图片处理流程

```text
原图上传 → Rust后端处理 → 四层图片生成
├── thumbnail (300px)    - 相册列表缩略图
├── src (800px)         - 相册详情展示图
├── detail (900px)      - 照片详情页图片
└── original (原尺寸)    - 全屏查看原图
```

## 🛠️ 技术栈

### 前端 (Next.js)
- **框架**: Next.js 14 (App Router) + TypeScript
- **样式**: Tailwind CSS + 自定义动画
- **交互**: Framer Motion
- **图标**: Lucide React

### 后端 (Rust)
- **框架**: Axum + Tokio
- **图片处理**: image crate
- **数据库**: MongoDB driver
- **认证**: JWT

### 数据库
- **主数据库**: MongoDB 7.0
- **数据持久化**: Docker volumes

### 部署架构
- **容器化**: Docker + Docker Compose
- **镜像仓库**: Docker Hub
- **反向代理**: Nginx
- **SSL证书**: Let's Encrypt + Certbot

## 🚀 快速开始

### 环境要求

- **开发环境**: Node.js 18+, Rust + MongoDB (或 Docker)
- **生产部署**: Docker & Docker Compose, 域名 (可选)

### 本地开发

#### 方法1: 纯开发模式
```bash
# 1. 克隆项目
git clone <your-repo-url>
cd img-hub

# 2. 安装前端依赖
npm install

# 3. 启动 Rust 后端 (需要单独下载运行)
# 后端项目地址: https://github.com/your-username/img-hub-backend
# 默认运行在 http://localhost:8000

# 4. 启动前端开发服务器
npm run dev

# 5. 访问应用
# 前端: http://localhost:3000
# 后端API: http://localhost:8000
```

#### 方法2: Docker 开发模式
```bash
# 1. 克隆项目和配置环境
git clone <your-repo-url>
cd img-hub
cp .env.example .env

# 2. 启动完整服务 (前端 + 后端 + 数据库)
docker-compose up -d

# 3. 访问应用
# 主站: http://localhost
# 管理后台: http://localhost/admin
```

### 生产部署

#### 环境准备
```bash
# 1. 配置环境变量 (必填)
cp .env.example .env
# 编辑 .env 文件，设置以下变量:
# DOCKER_USERNAME=your-dockerhub-username
# IMAGE_TAG=latest
# DOMAIN_NAME=yourdomain.com (如果使用域名)
# SSL_EMAIL=your-email@example.com (HTTPS部署)

# 2. 启动服务
docker-compose up -d

# 3. 检查服务状态
docker-compose ps
docker-compose logs -f

# 4. 访问网站
# HTTP: http://your-server-ip 或 http://yourdomain.com
# HTTPS: https://yourdomain.com (配置SSL后)
```

## 🔐 管理后台

### 功能特性

- **图片上传**: 多文件批量上传，支持精选/隐藏标记
- **相册管理**: 创建、编辑、删除相册，设置分类
- **精选功能**: 设置精选相册，首页瀑布流展示
- **封面设置**: 可视化封面选择界面
- **实时预览**: 管理界面即时反馈
- **安全认证**: 后端JWT身份验证

### 使用流程

1. **访问管理后台**: 浏览器打开 `/admin`
2. **上传图片**: 选择多个图片文件，设置相册信息
3. **设置属性**: 勾选是否精选、是否隐藏
4. **相册管理**: 在 `/admin/manage` 查看和管理所有相册
5. **发布作品**: 相册立即在前台显示

### 默认访问凭据

- **管理地址**: `http://your-domain/admin`
- **默认账户**: 通过后端API配置
- **HTTPS推荐**: 生产环境建议启用HTTPS

## 📂 项目结构

```text
img-hub/ (前端项目)
├── app/                     # Next.js App Router
│   ├── layout.tsx          # 全局布局
│   ├── page.tsx            # 首页 (Hero + 精选相册)
│   ├── albums/             # 相册路由
│   │   ├── page.tsx        # 相册列表页
│   │   └── [albumId]/      # 相册详情路由
│   ├── admin/              # 管理后台
│   │   ├── page.tsx        # 上传界面
│   │   └── manage/         # 相册管理页面
│   └── api/                # API代理路由
│       ├── albums/         # 相册API代理
│       ├── featured-albums/ # 精选相册API
│       └── upload/         # 上传API代理
├── components/             # 核心组件
│   ├── Header.tsx          # 智能导航栏
│   ├── AlbumGrid.tsx       # 相册网格展示
│   ├── FeaturedAlbumsSection.tsx # 精选相册瀑布流
│   └── FullScreenModal.tsx # 全屏图片查看器
├── lib/                    # 工具库
│   └── albumUtils.ts       # 相册工具函数
├── types/
│   └── index.ts            # TypeScript 类型定义
├── .env.example            # 环境变量示例
├── docker-compose.yml      # 微服务编排配置
├── nginx.conf              # Nginx反向代理配置
└── Dockerfile              # 前端镜像构建配置
```

## 🐳 Docker Hub 部署策略

### 部署架构

本项目采用 **Docker Hub 镜像仓库 + 微服务** 部署策略：

- 🏗️ **分离构建**: 前端/后端镜像独立构建
- 📦 **镜像仓库**: 使用 Docker Hub 存储和分发镜像
- 🔄 **多平台支持**: 支持 ARM64 → x86_64 跨平台构建
- 📁 **数据持久化**: 图片和数据库通过 volumes 持久化

### 构建和发布流程

#### 1. 前端镜像构建 (Mac M1 → Linux x86)

```bash
# 构建多平台镜像并推送到 Docker Hub
docker buildx build --platform linux/amd64 \
  -t your-dockerhub-username/img-hub-frontend:latest \
  --push .
```

#### 2. 后端镜像构建

```bash
# 后端项目构建 (需要单独的 Rust 后端项目)
# 在后端项目目录执行:
docker buildx build --platform linux/amd64 \
  -t your-dockerhub-username/img-hub-backend:latest \
  --push .
```

#### 3. 服务器部署

```bash
# 1. 配置环境变量
export DOCKER_USERNAME=your-dockerhub-username
export IMAGE_TAG=latest
export DOMAIN_NAME=yourdomain.com

# 2. 拉取镜像并启动服务
docker-compose pull
docker-compose up -d

# 3. 检查服务状态
docker-compose ps
```

## 📊 性能优化

### 图片优化策略

1. **四层图片架构** - 根据使用场景加载不同尺寸 (Rust后端处理)
2. **高性能处理** - Rust image crate 高效图片处理
3. **Nginx 缓存** - 静态资源长期缓存和压缩
4. **懒加载** - 视窗内图片按需加载
5. **CDN友好** - 静态文件路径优化

### Nginx 缓存配置

```nginx
# 图片文件缓存 (后端静态文件)
location /public/ {
    proxy_pass http://img-hub-backend:8000/public/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Gzip 压缩
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript;
```

### 数据库优化

- **MongoDB 索引**: 相册ID、分类字段建立索引
- **连接池**: Rust后端使用连接池管理数据库连接
- **缓存策略**: 前端API路由层实现适当缓存

## 🔧 运维管理

### 监控命令

```bash
# 查看所有服务状态
docker-compose ps

# 查看各服务日志
docker-compose logs -f img-hub-frontend
docker-compose logs -f img-hub-backend
docker-compose logs -f mongodb
docker-compose logs -f nginx

# 查看系统资源使用
docker stats

# 重启特定服务
docker-compose restart img-hub-frontend
docker-compose restart img-hub-backend
```

### 备份策略

```bash
# 数据备份 (MongoDB + 静态文件)
docker exec img-hub-mongodb mongodump --out /backup
tar -czf backup_$(date +%Y%m%d).tar.gz ./static

# 数据恢复
docker exec img-hub-mongodb mongorestore /backup
tar -xzf backup_20240101.tar.gz
```

### 服务健康检查

```bash
# 检查前端服务
curl -I http://localhost/

# 检查后端API
curl -I http://localhost/api/albums

# 检查数据库连接
docker exec img-hub-mongodb mongosh --eval "db.runCommand('ping')"
```

## 🚨 故障排除

### 常见问题

#### 前端服务问题

```bash
# 前端无法访问
docker-compose logs -f img-hub-frontend

# 检查前端健康状态
docker exec img-hub-frontend wget --spider http://localhost:3000/

# 重启前端服务
docker-compose restart img-hub-frontend
```

#### 后端API问题

```bash
# 后端API无响应
docker-compose logs -f img-hub-backend

# 检查后端健康状态
docker exec img-hub-backend curl -f http://localhost:8000/

# 检查环境变量配置
docker exec img-hub-backend env | grep DATABASE_URL

# 重启后端服务
docker-compose restart img-hub-backend
```

#### 数据库连接问题

```bash
# 检查MongoDB状态
docker-compose logs -f mongodb

# 测试数据库连接
docker exec img-hub-mongodb mongosh --eval "db.runCommand('ping')"

# 检查数据库认证
docker exec img-hub-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

#### 图片无法显示

```bash
# 检查静态文件挂载
ls -la ./static/
docker exec img-hub-backend ls -la /app/static/

# 检查后端静态文件服务
curl -I http://localhost/public/

# 修复权限问题
sudo chown -R 1000:1000 ./static/
```

#### Nginx 代理问题

```bash
# 检查Nginx配置
docker-compose logs -f nginx

# 测试代理转发
curl -I http://localhost/api/albums
curl -I http://localhost/

# 重启Nginx
docker-compose restart nginx
```

#### HTTPS 证书问题

```bash
# 检查证书文件
sudo ls -la /etc/letsencrypt/live/yourdomain.com/

# 重新获取证书
docker-compose down
sudo certbot certonly --standalone -d yourdomain.com
docker-compose up -d

# 检查证书有效期
sudo certbot certificates
```

## 🚀 生产环境部署

### 系统要求

- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **内存**: 最低 2GB，推荐 4GB+ (多个微服务)
- **存储**: 最低 20GB，推荐 100GB+ (数据库 + 图片存储)
- **网络**: 公网IP，开放 80/443 端口

### 一键部署脚本

```bash
# 1. 安装 Docker 环境
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 2. 项目部署
mkdir -p /opt/img-hub && cd /opt/img-hub
git clone <your-repo-url> .

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置必要参数:
# DOCKER_USERNAME=your-dockerhub-username
# DOMAIN_NAME=yourdomain.com
# SSL_EMAIL=your-email@example.com

# 4. 创建数据目录
mkdir -p ./static

# 5. 启动所有服务
docker-compose up -d

# 6. 验证部署状态
docker-compose ps
docker-compose logs -f
```

### HTTPS 配置 (推荐)

#### SSL 证书自动配置

```bash
# 1. 确保域名已解析到服务器
# 2. 停止服务释放80端口
docker-compose down

# 3. 获取 Let's Encrypt 证书
sudo apt install certbot -y
sudo certbot certonly --standalone \
  --email your-email@example.com \
  --agree-tos \
  -d yourdomain.com

# 4. 启动HTTPS服务
docker-compose up -d

# 5. 验证HTTPS访问
curl -I https://yourdomain.com/
```

#### 证书自动续期

```bash
# 添加续期任务到系统crontab
sudo crontab -e

# 添加以下行：
0 3 * * * /usr/bin/certbot renew --quiet && cd /opt/img-hub && docker-compose restart nginx
```

#### 访问地址

部署完成后的访问地址：

- **HTTP访问**: `http://your-server-ip/` 或 `http://yourdomain.com/`
- **HTTPS访问**: `https://yourdomain.com/` (配置SSL后)
- **管理后台**: `/admin` 路径

### 部署检查清单

- [ ] 服务器系统要求满足 (2GB+ 内存, 20GB+ 存储)
- [ ] Docker 和 Docker Compose 已安装
- [ ] 项目文件已克隆到服务器
- [ ] 环境变量已正确配置 (.env 文件)
- [ ] Docker Hub 镜像访问权限正常
- [ ] 防火墙端口已开放 (80, 443)
- [ ] 所有微服务启动正常
- [ ] 前端页面可正常访问
- [ ] 后端API可正常响应
- [ ] 数据库连接正常
- [ ] 图片上传和显示功能正常
- [ ] SSL证书配置正常 (如启用HTTPS)
- [ ] 备份策略已设置

## 📈 功能特性

### 已实现功能

- ✅ **微服务架构** - 前端/后端/数据库独立部署
- ✅ **精选相册** - 首页瀑布流展示，原比例显示
- ✅ **相册管理** - 创建、编辑、删除，支持隐藏/精选标记
- ✅ **图片批量上传** - 多文件同时处理，四层尺寸生成
- ✅ **全屏浏览** - 沉浸式图片查看体验
- ✅ **响应式设计** - 桌面端和移动端完美适配
- ✅ **Docker Hub部署** - 多平台镜像构建和分发
- ✅ **HTTPS支持** - SSL证书自动管理和续期
- ✅ **数据持久化** - MongoDB + 静态文件挂载

### 技术亮点

- 🚀 **高性能**: Rust后端 + Next.js前端
- 🔄 **跨平台**: ARM64 → x86_64 镜像构建
- 📦 **容器化**: Docker Compose 微服务编排
- 🔒 **安全性**: Nginx反向代理 + JWT认证
- ⚡ **性能优化**: 图片缓存 + Gzip压缩

## 🎯 最佳实践

### 内容管理

- 📏 **图片规格**: 建议上传高质量原图 (2000px+)，后端自动生成四种尺寸
- 🏷️ **分类策略**: travel/cosplay 分类明确，便于用户浏览
- ⭐ **精选设置**: 选择最优质作品设为精选，首页展示
- 📝 **描述优化**: 简洁有力的相册描述，提升用户体验

### 部署管理

- 🐳 **镜像更新**: 定期更新Docker镜像到最新版本
- 💾 **数据备份**: 定期备份MongoDB数据和静态文件
- 🔐 **安全加固**: 启用HTTPS，配置强密码策略
- 📊 **监控运维**: 定期检查服务状态和系统资源

## 🤝 贡献指南

欢迎为 ImgHub 项目贡献代码！

### 开发流程

1. **Fork 项目** - 点击右上角 Fork 按钮
2. **克隆仓库** - `git clone https://github.com/your-username/img-hub.git`
3. **安装依赖** - `npm install`
4. **创建分支** - `git checkout -b feature/your-feature`
5. **开发测试** - 完成功能开发和测试
6. **提交代码** - `git commit -m "feat: add your feature"`
7. **推送分支** - `git push origin feature/your-feature`
8. **创建PR** - 在GitHub上创建Pull Request

### 项目结构

- **前端项目**: 当前仓库 (Next.js + TypeScript)
- **后端项目**: 独立的 Rust API 服务器
- **部署配置**: Docker Compose + Nginx

### 开发环境

```bash
# 前端开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run lint         # 代码检查

# Docker 开发
docker-compose up -d # 启动完整服务栈
```

## 📄 许可证

MIT License - 自由使用和修改

---

## 🌟 项目亮点

**ImgHub** 是一个现代化的摄影作品展示平台，采用最新的技术栈和微服务架构：

- 🏗️ **前后端分离**: Next.js + Rust + MongoDB 微服务架构
- 🎨 **精美设计**: 瀑布流布局，沉浸式全屏体验
- ⚡ **高性能**: Rust高性能后端，四层图片优化
- 🐳 **云原生**: Docker容器化，支持Docker Hub部署
- 🔒 **生产就绪**: HTTPS支持，安全认证，监控运维

**让每一张照片都有被欣赏的机会** 📸✨
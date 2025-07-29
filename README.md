# 📸 ImgHub - 纯粹摄影作品展示平台

一个专注于摄影作品展示的现代化网站，使用 Next.js + Docker 构建，提供沉浸式的视觉体验。

## ✨ 核心特性

- 🎨 **极简设计** - 专注作品展示的纯净界面
- 📱 **完美适配** - 桌面端和移动端响应式体验
- 📚 **影集体系** - 层级化的作品组织方式
- 🖼️ **沉浸体验** - 全屏无干扰的作品浏览
- 💫 **流畅动画** - 细腻的交互动画效果
- ⚡ **性能优化** - 多层图片优化策略
- 🐳 **一键部署** - Docker 容器化部署
- 🔍 **SEO 优化** - 静态生成 + 元数据优化

## 🏗️ 网站架构

### 页面结构
```
首页 (Hero + 精选影集)
├── 影集列表页 (/albums)
│   ├── 旅行摄影 (/albums?category=travel)
│   └── Cosplay摄影 (/albums?category=cosplay)
├── 影集详情页 (/albums/[albumId])
│   └── 照片详情页 (/albums/[albumId]/photos/[photoId])
│       └── 全屏查看模式
```

### 图片体系
```
四层图片结构：
├── thumbnail (400px)    - 影集列表缩略图
├── src (800px)         - 影集详情展示图
├── detailSrc (900px)   - 照片详情页图片
└── originalSrc (原尺寸) - 全屏查看原图
```

## 🛠️ 技术栈

- **前端框架**: Next.js 14 (App Router) + TypeScript
- **样式系统**: Tailwind CSS + 自定义动画
- **交互效果**: Framer Motion
- **图标系统**: Lucide React
- **部署方案**: Docker + Docker Compose + Nginx
- **图片管理**: ImageMagick + 自动化脚本

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Docker & Docker Compose
- ImageMagick (图片处理)

### 本地开发

```bash
# 克隆项目
git clone <your-repo-url>
cd img-hub

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### Docker 部署

```bash
# 一键启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f img-hub

# 停止服务
docker-compose down
```

## 🐳 Docker 部署

### 镜像构建策略
本项目采用**数据与应用分离**的部署策略：

- ✅ **镜像精简**：镜像不包含任何图片或数据文件
- ✅ **完全挂载**：所有资源通过Docker挂载提供
- ✅ **零冲突**：避免内置文件与挂载文件冲突
- ✅ **动态更新**：图片上传立即生效，无需重建镜像

### 构建和运行

```bash
# 构建镜像（不包含public目录数据）
docker build -t img-hub .

# 运行容器（挂载本地数据）
docker-compose up -d

# 验证挂载
docker exec img-hub-app ls -la /usr/share/nginx/html/public/
```

### 镜像结构
```
/usr/share/nginx/html/
├── _next/          # Next.js 静态资源
├── albums/         # 影集页面
├── index.html      # 首页
└── public/         # 空目录结构（等待挂载）
    ├── albums.json # 空文件（被挂载覆盖）
    └── images/     # 空目录（被挂载覆盖）
```

## 📂 项目结构

```
img-hub/
├── app/                     # Next.js App Router
│   ├── layout.tsx          # 全局布局（Header + Footer）
│   ├── page.tsx            # 首页（Hero + 精选影集）
│   ├── albums/             # 影集路由
│   │   ├── page.tsx        # 影集列表页
│   │   ├── layout.tsx      # 影集页面布局
│   │   └── [albumId]/      # 动态路由
│   │       ├── page.tsx    # 影集详情页（服务端）
│   │       ├── AlbumDetailClient.tsx  # 影集详情（客户端）
│   │       └── photos/[photoId]/
│   │           ├── page.tsx           # 照片详情页（服务端）
│   │           └── PhotoDetailClient.tsx  # 照片详情（客户端）
│   └── globals.css         # 全局样式 + 自定义动画
├── components/             # 核心组件
│   ├── Header.tsx          # 智能导航栏
│   ├── Footer.tsx          # 作品导向页脚
│   ├── AlbumGrid.tsx       # 影集网格展示
│   └── FullScreenModal.tsx # 全屏图片查看器
├── data/
│   ├── albums.ts             # 影集数据接口
│   └── albums.json           # 影集数据文件
├── types/
│   └── index.ts            # TypeScript 类型定义
├── scripts/
│   └── img-manager.sh        # 统一图片管理脚本
├── public/images/          # 本地图片存储
│   ├── travel/             # 旅行摄影
│   ├── cosplay/            # Cosplay摄影
│   ├── detail/             # 900p 详情图
│   ├── thumbnails/         # 400p 缩略图
│   └── original/           # 原始图片备份
├── Dockerfile              # 多阶段构建配置
├── docker-compose.yml      # 容器编排 + 数据卷
├── nginx.conf              # 高性能Web服务配置
└── next.config.js          # 静态导出 + 优化配置
```

### 内容管理

本项目提供了自动化的内容管理工具：

#### `albums.ts` 数据接口
```typescript
// data/albums.ts - 影集数据接口
import albumsData from '../public/albums.json'
export const sampleAlbums: Album[] = albumsData
```

#### `albums.json` 数据文件
位置：`public/albums.json`
- 存储所有影集和照片的结构化数据
- 包含EXIF信息、分类、标签等元数据
- 通过Docker挂载自动同步到服务器

#### 图片管理脚本
**Python版本（推荐）：** `scripts/img-manager.py`
- 自动处理图片（四层尺寸优化）
- 原图无损保存（100%质量）
- 自动更新 `public/albums.json`
- 交互式操作界面
- **🆕 一键ECS部署功能**

**使用方法**:
```bash
# 本地图片处理和测试（支持ECS上传）
python3 scripts/img-manager.py local-test

# 一键部署到ECS
python3 scripts/img-manager.py deploy

# 配置ECS连接信息  
python3 scripts/img-manager.py ecs-config

# 查看数据状态
python3 scripts/img-manager.py status

# 启动本地预览
python3 scripts/img-manager.py local-preview
```

**工作流程**:
1. `local-test` - 处理图片后询问是否上传ECS
2. `deploy` - 独立执行ECS部署

**注意**: ~~旧的 `img-manager.sh` 已废弃~~，Python版本现已集成ECS部署功能。

### 图片优化设置

脚本内置的图片处理参数：

```bash
THUMBNAIL_SIZE="400"     # 缩略图尺寸
DISPLAY_SIZE="800"       # 展示图尺寸  
DETAIL_SIZE="900"        # 详情页尺寸
THUMBNAIL_QUALITY="75"   # 缩略图质量
DISPLAY_QUALITY="85"     # 展示图质量
DETAIL_QUALITY="90"      # 详情图质量
```

## 🔧 ECS 部署指南

### 1. 服务器准备

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 启动并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. 项目部署

```bash
# 本地准备图片（使用统一脚本）
./scripts/img-manager.sh upload ./my-photos/

# 上传项目文件
scp -r img-hub/ user@ecs-ip:/home/user/

# 登录服务器
ssh user@ecs-ip

# 启动服务
cd img-hub
docker-compose up -d

# 配置防火墙
sudo ufw allow 80
sudo ufw allow 443
```

### 3. SSL 配置（可选）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d your-domain.com

# 设置自动续期
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## 📊 性能优化

### 图片优化策略

1. **四层图片架构** - 根据使用场景加载不同尺寸
2. **WebP 格式支持** - 现代浏览器自动优化
3. **Nginx 缓存** - 静态资源长期缓存
4. **懒加载** - 视窗内图片按需加载

### 缓存配置

Nginx 自动配置：
- 图片文件：1年缓存
- 静态资源：1个月缓存  
- HTML文件：无缓存
- Gzip 压缩：自动启用

### 监控指标

```bash
# 查看容器状态
docker stats

# 查看访问日志
docker-compose logs nginx

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

## 🎯 最佳实践

### 图片管理
- 📏 **统一尺寸**: 使用脚本确保图片尺寸一致
- 🗜️ **适度压缩**: 平衡质量与文件大小
- 🏷️ **标准命名**: 使用有意义的文件名
- 💾 **定期备份**: 原图保存在云存储

### 内容组织
- 📚 **精选影集**: 首页只展示最佳作品
- 🏷️ **准确分类**: travel/cosplay 明确划分
- 📝 **优质描述**: 简洁有力的作品描述
- 🔄 **持续更新**: 定期添加新作品

### 性能优化
- ⚡ **CDN 加速**: 配置图片CDN分发
- 📱 **移动优先**: 优先优化移动端体验
- 🔍 **SEO 友好**: 完善图片 alt 属性
- 📊 **数据分析**: 监控用户访问行为

## 🚨 故障排除

### 常见问题

**图片不显示**
```bash
# 检查文件权限
ls -la public/images/
chmod 755 public/images/
chmod 644 public/images/**/*

# 检查容器挂载
docker inspect img-hub_img-hub_1 | grep Mounts
```

**服务无法启动**
```bash
# 查看端口占用
sudo netstat -tlnp | grep :80

# 检查 Docker 服务
sudo systemctl status docker

# 查看容器日志
docker-compose logs
```

**内存不足**
```bash
# 清理 Docker 缓存
docker system prune -a

# 查看磁盘空间
df -h

# 重启服务
docker-compose restart
```

## 📈 扩展功能

### 计划中的功能
- 🔐 **管理后台** - 在线图片管理
- 📊 **访问统计** - 作品浏览数据
- 💬 **评论系统** - 作品互动功能
- 🔍 **搜索功能** - 全站内容搜索
- 🌍 **多语言** - 国际化支持

### 技术升级
- ⚡ **Edge Runtime** - 边缘计算优化
- 🎨 **AI 标签** - 智能图片标注
- 📱 **PWA 支持** - 渐进式Web应用
- 🔄 **实时同步** - 云端自动同步

## 📄 许可证

MIT License - 自由使用和修改

## 🤝 贡献指南

欢迎提交 Issues 和 Pull Requests！

1. Fork 本仓库
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 开启 Pull Request

---

**ImgHub** - 让每一张照片都有被欣赏的机会 📸✨


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

## 🎨 内容管理

### 影集管理

编辑 `data/albums.ts` 添加新影集：

```typescript
{
  id: 'your-album-id',
  title: '影集标题',
  description: '影集描述',
  coverImage: 'https://...',
  category: 'travel', // 或 'cosplay'
  featured: true,     // 是否在首页展示
  photos: [
    {
      id: 1,
      src: '/images/travel/photo1.jpg',
      detailSrc: '/images/detail/photo1.jpg',
      originalSrc: '/images/original/photo1.jpg',
      thumbnail: '/images/thumbnails/photo1.jpg',
      title: '照片标题',
      alt: '照片描述',
      camera: 'Canon EOS R5',
      settings: 'f/8, 1/125s, ISO 100',
      tags: ['标签1', '标签2']
    }
  ]
}
```

### 图片处理工具

使用统一的图片管理脚本：

```bash
# 交互式上传（推荐新手）
./scripts/img-manager.sh

# 快速上传到现有影集
./scripts/img-manager.sh upload ./my-photos/ mountain-landscapes

# 上传单张图片
./scripts/img-manager.sh upload ./photo.jpg

# 创建新影集
./scripts/img-manager.sh create

# 查看现有影集
./scripts/img-manager.sh list

# 部署到服务器
./scripts/img-manager.sh deploy

# 查看帮助
./scripts/img-manager.sh help
```

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


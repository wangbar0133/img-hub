# 📸 ImgHub - 现代摄影作品展示平台

一个专注于摄影作品展示的现代化网站，使用 Next.js + Docker 构建，提供沉浸式的视觉体验。

## ✨ 核心特性

- 🎨 **极简设计** - 专注作品展示的纯净界面
- 📱 **完美适配** - 桌面端和移动端响应式体验
- 📚 **影集体系** - 层级化的作品组织方式
- 🖼️ **沉浸体验** - 全屏无干扰的作品浏览
- 💫 **流畅动画** - 细腻的交互动画效果
- ⚡ **性能优化** - 多层图片优化策略
- 🔐 **管理后台** - Web端内容管理系统
- 🐳 **一键部署** - Docker 容器化部署

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
└── 管理后台 (/admin)
    ├── 登录页面 (/admin)
    ├── 管理面板 (/admin/dashboard)
    └── 创建影集 (/admin/create-album)
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
- **图片处理**: Sharp (Next.js API 处理)
- **认证系统**: JWT + HTTP-only cookies
- **部署方案**: Docker + Docker Compose + Nginx

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Docker & Docker Compose

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
# 管理后台 http://localhost:3000/admin (admin/admin123)
```

### 生产部署

```bash
# 1. 生成安全凭据
./generate-credentials.sh

# 2. 启动服务
docker-compose --env-file .env.production up -d

# 3. 查看状态
docker-compose ps

# 4. 访问网站
# 主站: http://your-server-ip/
# 管理后台: http://your-server-ip/admin
```

## 🔐 管理后台

### 功能特性

- **图片上传**: 多文件批量上传，自动处理4层尺寸
- **影集管理**: 创建、编辑、删除影集
- **封面设置**: 可视化封面选择界面
- **数据管理**: 实时编辑照片和影集信息
- **安全认证**: JWT身份验证，会话管理

### 使用流程

1. **访问管理后台**: 浏览器打开 `/admin`
2. **登录账户**: 使用配置的管理员凭据
3. **上传图片**: 选择多个图片文件上传
4. **创建影集**: 填写影集信息，选择封面
5. **发布作品**: 影集立即在前台显示

### 安全配置

```bash
# 生产环境凭据设置
export ADMIN_USERNAME="your-admin-username"
export ADMIN_PASSWORD="your-secure-password"
export JWT_SECRET="your-super-secret-jwt-key"
```

## 📂 项目结构

```
img-hub/
├── app/                     # Next.js App Router
│   ├── layout.tsx          # 全局布局
│   ├── page.tsx            # 首页
│   ├── albums/             # 影集路由
│   │   ├── page.tsx        # 影集列表页
│   │   └── [albumId]/      # 动态路由
│   ├── admin/              # 管理后台
│   │   ├── page.tsx        # 登录页面
│   │   ├── dashboard/      # 管理面板
│   │   └── create-album/   # 创建影集
│   └── api/                # API路由
│       └── admin/          # 管理API
├── components/             # 核心组件
│   ├── Header.tsx          # 智能导航栏
│   ├── AlbumGrid.tsx       # 影集网格展示
│   └── FullScreenModal.tsx # 全屏图片查看器
├── lib/                    # 工具库
│   ├── imageProcessor.ts   # 服务端图片处理
│   └── albumUtils.ts       # 影集工具函数
├── data/
│   └── albums.ts           # 影集数据接口
├── types/
│   └── index.ts            # TypeScript 类型定义
├── public/
│   ├── albums.json         # 影集数据文件
│   └── images/             # 图片存储
├── Dockerfile              # 容器构建配置
├── docker-compose.yml      # 容器编排
└── nginx.conf              # Web服务配置
```

## 🐳 Docker 部署

### 数据分离策略
本项目采用**数据与应用分离**的部署策略：

- ✅ **镜像精简**：镜像不包含图片数据
- ✅ **动态挂载**：数据通过Docker volumes挂载
- ✅ **零冲突**：避免内置文件冲突
- ✅ **实时更新**：内容更新无需重建镜像

### 构建和运行

```bash
# 构建镜像
docker build -t img-hub .

# 运行容器（数据挂载）
docker-compose up -d

# 验证挂载
docker exec img-hub-app ls -la /usr/share/nginx/html/
```

## 📊 性能优化

### 图片优化策略

1. **四层图片架构** - 根据使用场景加载不同尺寸
2. **服务端处理** - Sharp库高性能图片处理
3. **Nginx 缓存** - 静态资源长期缓存
4. **懒加载** - 视窗内图片按需加载

### 缓存配置

```nginx
# 图片文件：1年缓存
location ~* \.(jpg|jpeg|png|gif|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 静态资源：1个月缓存
location ~* \.(css|js)$ {
    expires 1M;
    add_header Cache-Control "public";
}
```

## 🔧 运维管理

### 监控命令

```bash
# 查看容器状态
docker-compose ps

# 查看应用日志
docker-compose logs -f img-hub

# 查看系统资源
docker stats

# 重启服务
docker-compose restart
```

### 备份策略

```bash
# 数据备份
tar -czf backup_$(date +%Y%m%d).tar.gz data/

# 数据恢复
tar -xzf backup_20240101.tar.gz
```

## 🚨 故障排除

### 常见问题

**管理后台无法登录**
```bash
# 检查环境变量
docker exec img-hub-app env | grep ADMIN

# 重新生成凭据
./generate-credentials.sh
docker-compose restart
```

**图片无法显示**
```bash
# 检查挂载权限
ls -la data/images/
chmod 755 data/images/

# 检查容器挂载
docker inspect img-hub-app | grep Mounts
```

**服务无法启动**
```bash
# 查看端口占用
netstat -tlnp | grep :80

# 查看详细日志
docker-compose logs img-hub
```

## 🚀 生产环境部署

### 系统要求

- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **内存**: 最低 1GB，推荐 2GB+
- **存储**: 最低 10GB，推荐 50GB+（用于图片存储）
- **网络**: 公网IP，开放 80/443 端口

### 快速部署

```bash
# 1. 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 2. 项目部署
mkdir -p /opt/img-hub && cd /opt/img-hub
git clone <your-repo-url> .
mkdir -p data/images logs
echo '[]' > data/albums.json

# 3. 生成安全凭据
./generate-credentials.sh

# 4. 启动服务
docker-compose --env-file .env.production up -d

# 5. 验证部署
docker-compose ps
curl http://localhost/health
```

### 安全配置

#### 管理员账户设置

**方法1：自动生成（推荐）**
```bash
./generate-credentials.sh
# 自动生成强随机密码和JWT密钥
```

**方法2：手动配置**
```bash
cat > .env.production << EOF
ADMIN_USERNAME=admin
ADMIN_PASSWORD=$(openssl rand -base64 16)
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF

chmod 600 .env.production
```

#### 防火墙配置

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

#### HTTPS 配置

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 申请SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### 运维管理

#### 监控命令

```bash
# 查看服务状态
docker-compose ps

# 查看应用日志
docker-compose logs -f img-hub

# 系统资源监控
docker stats
```

#### 备份策略

```bash
# 创建备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p /backup/img-hub/$DATE
cp -r ./data /backup/img-hub/$DATE/
cp .env.production /backup/img-hub/$DATE/
tar -czf /backup/img-hub/backup_$DATE.tar.gz /backup/img-hub/$DATE
echo "备份完成: backup_$DATE.tar.gz"
EOF

chmod +x backup.sh

# 设置定时备份
echo "0 2 * * * /opt/img-hub/backup.sh" | crontab -
```

### 部署检查清单

- [ ] 服务器系统要求满足
- [ ] Docker 和 Docker Compose 已安装  
- [ ] 项目文件已下载到服务器
- [ ] 数据目录和文件已创建
- [ ] 管理员凭据已安全配置
- [ ] 防火墙端口已开放
- [ ] 服务已启动并运行正常
- [ ] 网站前台可正常访问
- [ ] 管理后台可正常登录
- [ ] 图片上传功能正常
- [ ] 备份策略已设置

## 📈 扩展功能

### 已实现功能

- ✅ **Web管理后台** - 完整的内容管理系统
- ✅ **图片批量上传** - 多文件同时处理
- ✅ **封面选择功能** - 可视化封面设置
- ✅ **实时预览** - 管理界面即时反馈
- ✅ **JWT认证** - 安全的身份验证

### 计划中的功能

- 📊 **访问统计** - 作品浏览数据分析
- 💬 **评论系统** - 作品互动功能
- 🔍 **搜索功能** - 全站内容搜索
- 🌍 **多语言** - 国际化支持
- 📱 **PWA 支持** - 渐进式Web应用

## 🎯 最佳实践

### 内容管理
- 📏 **合理尺寸**: 上传高质量原图，系统自动优化
- 🏷️ **准确分类**: travel/cosplay 明确划分
- 📝 **优质描述**: 简洁有力的作品描述
- 🖼️ **精选封面**: 选择最具代表性的封面图片

### 安全管理
- 🔐 **强密码**: 使用复杂的管理员密码
- 🔑 **定期更换**: 定期更新JWT密钥
- 🌐 **HTTPS**: 生产环境启用SSL证书
- 🔒 **访问限制**: 限制管理后台访问IP

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
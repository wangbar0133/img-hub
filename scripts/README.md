# ImgHub 图片管理脚本

本目录包含两个版本的图片管理工具：

## 🐍 Python 版本（推荐）

**文件：** `img-manager.py`

### 优势
- ✅ 更好的错误处理和用户体验
- ✅ 类型提示和代码可读性
- ✅ 原生 JSON 处理，无需额外工具
- ✅ 跨平台兼容性更好
- ✅ 面向对象设计，易于扩展
- ⭐ **原图无损保存**：完全不压缩，保持100%原始质量

### 使用方法
```bash
# 查看帮助
python3 scripts/img-manager.py help

# 本地测试模式
python3 scripts/img-manager.py local-test

# 查看数据状态
python3 scripts/img-manager.py status

# 启动本地预览
python3 scripts/img-manager.py local-preview
```

### 依赖要求
- Python 3.6+
- ImageMagick (`convert`, `identify`)
- ExifTool (`exiftool`)

```bash
# macOS 安装依赖
brew install imagemagick exiftool

# Ubuntu 安装依赖
sudo apt install imagemagick libimage-exiftool-perl
```

## 🔧 Bash 版本（兼容性）

**文件：** `img-manager.sh`

### 特点
- ✅ 传统 Shell 脚本，兼容性好
- ✅ 功能完整，经过验证
- ⚠️ 依赖 `jq` 处理 JSON
- ⚠️ 错误处理相对简单

### 使用方法
```bash
# 本地测试模式
./scripts/img-manager.sh local-test

# 查看数据状态
./scripts/img-manager.sh status
```

### 依赖要求
- Bash 4.0+
- ImageMagick
- jq
- rsync
- exiftool

## 📋 功能对比

| 功能 | Python版本 | Bash版本 |
|------|-----------|----------|
| 图片处理 | ✅ | ✅ |
| EXIF提取 | ✅ | ✅ |
| JSON管理 | ✅ 原生 | ✅ 依赖jq |
| 错误处理 | ✅ 强大 | ⚠️ 基础 |
| 跨平台 | ✅ 好 | ⚠️ 一般 |
| 类型安全 | ✅ | ❌ |
| 代码维护 | ✅ 易 | ⚠️ 中等 |
| 原图处理 | ⭐ 无损保存 | ⚠️ 压缩95% |

## 🚀 迁移建议

建议从 Bash 版本迁移到 Python 版本：

1. **保持数据兼容** - 两个版本使用相同的数据格式
2. **逐步迁移** - 可以并行使用两个版本
3. **测试验证** - 在本地充分测试后再切换

## 🖼️ 原图处理说明

Python版本默认对原图采用**无损保存**策略：

### 默认行为（推荐）
- ✅ **完全不压缩**：原图使用 `shutil.copy2()` 直接复制
- ✅ **保持原始质量**：100% 无损，包括EXIF数据
- ✅ **保持原始尺寸**：不限制图片大小
- ✅ **保持原始格式**：JPG/PNG/WebP等格式完全保持

### 验证方法
```bash
# 处理前后文件大小对比
ls -lh /path/to/original/image.jpg
ls -lh ./public/images/original/category_timestamp.jpg

# 应该看到文件大小完全相同
```

### 高级配置（可选）
如果确实需要压缩原图（不推荐），可以创建自定义配置：

```python
# 修改 scripts/img-config-example.py
self.compress_original = True      # 启用原图压缩
self.original_max_size = 3000      # 最大尺寸
self.original_quality = 98         # 压缩质量
```

## 💡 扩展功能

Python 版本为未来扩展提供了更好的基础：

- 🔄 批量操作优化
- 🎨 图片滤镜和特效
- 📊 更详细的统计信息
- 🌐 Web API 集成
- 🔍 图片相似度检测
- 📱 移动端适配检测 

## 🔄 数据管理流程

### 新的简化流程（v3.1.0+）

1. **数据存储位置**：`public/albums.json`
2. **Docker挂载**：整个 `public` 目录
3. **自动同步**：上传图片时直接更新Docker挂载的数据

```bash
# 1. 本地处理图片
python3 scripts/img-manager.py local-test

# 2. Docker自动使用最新数据（无需手动同步）
docker-compose up -d

# 3. 数据一致性：本地 = 容器 = 服务器
```

### 优势
- ✅ **数据一致性**：本地和远程始终同步
- ✅ **简化部署**：无需单独同步JSON文件
- ✅ **实时更新**：图片上传后立即生效
- ✅ **减少错误**：避免手动Git提交遗漏

### Docker挂载配置
```yaml
volumes:
  # 挂载整个public目录，包含images和albums.json
  - ./public:/usr/share/nginx/html/public:ro
```

## 🐳 Docker 镜像优化

### 数据分离策略

**问题**：传统方式会将本地图片打包到镜像中，导致：
- ❌ 镜像体积巨大（GB级别）
- ❌ 内置文件与挂载文件冲突
- ❌ 每次更新图片需要重建镜像

**解决方案**：数据与应用完全分离
- ✅ **`.dockerignore`**：排除 `public/images/` 和 `public/albums.json`
- ✅ **Dockerfile**：构建时清空public目录，只保留空的目录结构
- ✅ **挂载覆盖**：运行时挂载真实数据覆盖空目录

### 构建过程详解

```dockerfile
# 第一阶段：构建Next.js应用
FROM node:18-alpine AS builder
COPY . .                    # 复制源码（excludes: public/images/, public/albums.json）
RUN npm run build          # 生成静态文件到 /app/out

# 第二阶段：生产镜像
FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html

# 🧹 关键步骤：清理public目录
RUN rm -rf /usr/share/nginx/html/public/* && \
    mkdir -p /usr/share/nginx/html/public/images/{travel,cosplay,detail,original} && \
    mkdir -p /usr/share/nginx/html/public/images/thumbnails/{travel,cosplay} && \
    echo "[]" > /usr/share/nginx/html/public/albums.json
```

### 验证镜像清洁性

```bash
# 构建镜像
docker build -t img-hub-clean .

# 检查镜像大小（应该很小）
docker images img-hub-clean

# 检查public目录（应该为空结构）
docker run --rm img-hub-clean ls -la /usr/share/nginx/html/public/

# 启动容器并挂载数据
docker-compose up -d

# 验证挂载后有数据
docker exec img-hub-app ls -la /usr/share/nginx/html/public/
```

### 优势对比

| 方案 | 镜像大小 | 更新方式 | 数据一致性 | 构建时间 |
|------|----------|----------|------------|----------|
| **传统方式** | 1-5GB+ | 重建镜像 | ❌ 可能冲突 | 5-10分钟 |
| **分离方式** | 50-100MB | 仅挂载 | ✅ 完全同步 | 1-2分钟 | 
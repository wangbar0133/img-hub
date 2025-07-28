# 图片存储目录

本目录用于存储网站的所有图片资源，采用四层图片结构以优化不同场景的加载性能。

## 📁 目录结构

```
public/images/
├── travel/              # 旅行类别展示图片 (800px宽)
├── cosplay/             # Cosplay类别展示图片 (800px宽)
├── detail/              # 详情页图片 (900px宽)
├── original/            # 原始高清图片 (保持原尺寸)
└── thumbnails/          # 缩略图目录
    ├── travel/          # 旅行类缩略图 (400x400px)
    └── cosplay/         # Cosplay类缩略图 (400x400px)
```

## 🎯 图片规格说明 (基于 img-manager.sh 配置)

| 类型 | 目录 | 尺寸 | 用途 | 质量 |
|------|------|------|------|------|
| **缩略图** | `thumbnails/` | 400x400px | 影集列表展示 | 75% 质量，快速加载 |
| **展示图** | `travel/`, `cosplay/` | 800px宽 | 影集内照片展示 | 85% 质量 |
| **详情图** | `detail/` | 900px宽 | 照片详情页 | 90% 质量 |
| **原始图** | `original/` | 保持原尺寸 | 全屏查看/下载 | 原始质量 |

## 📸 当前配置的图片

### 山川风光影集 (travel)
- `mountain_sunrise.jpg` - 晨光山峦
- `lake_reflection.jpg` - 湖光山色  
- `forest_path.jpg` - 神秘森林
- `mountain_sunrise_cover.jpg` - 影集封面

### Cosplay摄影影集 (cosplay)
- `anime_girl.jpg` - 梦幻少女
- `traditional_style.jpg` - 古风韵味
- `anime_girl_cover.jpg` - 影集封面

## 🔧 脚本配置参数

根据 `img-manager.sh` 脚本的配置：

```bash
THUMBNAIL_SIZE="400"     # 缩略图大小
DISPLAY_SIZE="800"       # 展示图大小
DETAIL_SIZE="900"        # 详情图大小
THUMBNAIL_QUALITY="75"   # 缩略图质量
DISPLAY_QUALITY="85"     # 展示图质量
DETAIL_QUALITY="90"      # 详情图质量
```

## 🚀 使用说明

### 自动化管理（推荐）

```bash
# 交互式操作
./scripts/img-manager.sh

# 快速上传到现有影集
./scripts/img-manager.sh upload ./photos/ mountain-landscapes

# 上传单张图片（会询问目标影集）
./scripts/img-manager.sh upload ./photo.jpg

# 创建新影集
./scripts/img-manager.sh create

# 查看影集列表
./scripts/img-manager.sh list

# 部署到服务器
./scripts/img-manager.sh deploy
```

### 手动管理

1. **添加新图片时**，确保为每张图片创建4个版本并放置在对应目录
2. **保持命名一致性**，使用格式：`{category}_{timestamp}.{ext}`
3. **图片格式** 支持 JPG、PNG、WebP、TIFF
4. **手动更新** `data/albums.json` 文件（不推荐）

## ✨ 脚本功能特性

- ✅ 自动生成4种图片尺寸（400px缩略图、800px展示图、900px详情图、原图）
- ✅ 自动提取EXIF数据（相机型号、拍摄参数）
- ✅ 支持批量处理和单张上传
- ✅ 智能影集管理（JSON格式，自动更新）
- ✅ 一键部署到服务器
- ✅ 完全自动化工作流程

## 📂 目录映射关系

| JSON 中的路径 | 实际存储位置 | 脚本生成 |
|---------------|--------------|----------|
| `src` | `/images/{category}/{filename}` | 800px展示图 |
| `detailSrc` | `/images/detail/{filename}` | 900px详情图 |
| `originalSrc` | `/images/original/{filename}` | 原始尺寸 |
| `thumbnail` | `/images/thumbnails/{category}/{filename}` | 400x400px缩略图 |
| `coverImage` | `/images/{category}/{filename}` | 影集封面图 |

## 🎯 最佳实践

1. **始终使用脚本** - 手动管理容易出错
2. **批量上传** - 效率更高，元数据更一致
3. **合理分类** - 目前支持 `travel` 和 `cosplay` 两个分类
4. **定期备份** - 重要的原图要做好备份
5. **测试部署** - 本地测试无误后再部署到服务器 
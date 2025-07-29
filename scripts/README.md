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

## 🚀 迁移建议

建议从 Bash 版本迁移到 Python 版本：

1. **保持数据兼容** - 两个版本使用相同的数据格式
2. **逐步迁移** - 可以并行使用两个版本
3. **测试验证** - 在本地充分测试后再切换

## 💡 扩展功能

Python 版本为未来扩展提供了更好的基础：

- 🔄 批量操作优化
- 🎨 图片滤镜和特效
- 📊 更详细的统计信息
- 🌐 Web API 集成
- 🔍 图片相似度检测
- 📱 移动端适配检测 
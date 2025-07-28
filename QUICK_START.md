# 🚀 ImgHub 快速开始指南

只需一个脚本，完成从图片上传到网站部署的全流程！

## ⚡ 最简使用方式

### 1️⃣ 交互式上传（推荐）
```bash
# 启动交互式界面
./scripts/img-manager.sh

# 按提示操作：
# 1. 选择现有影集或创建新影集
# 2. 选择图片文件/目录
# 3. 自动处理并部署
```

### 2️⃣ 快速命令行
```bash
# 上传到现有影集
./scripts/img-manager.sh upload ./my-photos/ tokyo-street

# 上传单张图片
./scripts/img-manager.sh upload ./sunset.jpg

# 创建新影集
./scripts/img-manager.sh create

# 查看影集列表
./scripts/img-manager.sh list
```

## 🎯 完整工作流程

### 步骤1: 准备图片
```bash
# 将图片放在任意目录
mkdir ~/my-photos
# 复制图片到该目录...
```

### 步骤2: 运行脚本
```bash
cd img-hub
./scripts/img-manager.sh
```

### 步骤3: 按提示操作
```
[INFO] 当前影集列表:
  mountain-landscapes - 山川风光 (travel) - 5张照片
  cosplay-work - Cosplay作品 (cosplay) - 3张照片

请选择操作:
  1. 添加图片到现有影集
  2. 创建新影集并添加图片  ← 选择这个
  3. 仅部署到服务器
  4. 退出

影集ID: tokyo-street
影集标题: 东京街拍
影集描述: 记录东京都市生活
分类: 1 (travel)
图片路径: ~/my-photos/

# 脚本自动处理：
# ✅ 生成4种尺寸图片
# ✅ 提取EXIF数据
# ✅ 更新网站数据
# ✅ 部署到服务器
```

### 步骤4: 查看结果
访问您的网站，新影集和图片已经上线！

## 🔧 脚本功能详解

### 自动图片处理
- **缩略图** (400×400): 影集列表显示
- **展示图** (800px): 影集详情页
- **详情图** (900px): 照片详情页（不裁切）
- **原图**: 全屏查看模式

### 智能数据管理
- **JSON格式**: 自动更新 `data/albums.json`
- **TypeScript集成**: 自动导入到网站
- **EXIF提取**: 相机型号、拍摄参数

### 一键部署
- **文件同步**: 自动上传图片和数据
- **应用重建**: 自动重启Docker容器
- **配置保存**: 首次配置后自动记忆

## 📋 常用命令速查

| 命令 | 功能 | 示例 |
|------|------|------|
| `./scripts/img-manager.sh` | 交互式操作 | 最简单方式 |
| `./scripts/img-manager.sh upload <路径>` | 快速上传 | 批量/单张 |
| `./scripts/img-manager.sh create` | 创建影集 | 新影集 |
| `./scripts/img-manager.sh list` | 查看影集 | 管理现有 |
| `./scripts/img-manager.sh deploy` | 仅部署 | 服务器同步 |
| `./scripts/img-manager.sh help` | 显示帮助 | 查看文档 |

## 🎉 就是这么简单！

从图片准备到网站上线，只需要：
1. 运行 `./scripts/img-manager.sh`
2. 按提示选择和输入
3. 等待自动完成

您的摄影网站现在拥有专业级的内容管理体验！📸✨ 
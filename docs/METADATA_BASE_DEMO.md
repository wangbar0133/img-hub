# metadataBase 实际效果演示

## 🔍 分享链接检测工具

可以使用以下工具检测您网站的社交分享效果：

1. **Facebook 分享调试器**: https://developers.facebook.com/tools/debug/
2. **Twitter 卡片验证器**: https://cards-dev.twitter.com/validator
3. **LinkedIn 帖子检查器**: https://www.linkedin.com/post-inspector/

## 📊 实际效果对比

### 没有 metadataBase 时：

```html
<!-- 生成的错误 HTML -->
<meta property="og:image" content="/android-chrome-512x512.png" />
<meta property="og:url" content="/albums/travel" />
<link rel="icon" href="/favicon.ico" />
```

**分享效果：**
- ❌ 图片：显示破损图标
- ❌ 图标：浏览器显示默认图标
- ❌ URL：相对路径无法正确解析

### 有 metadataBase 时：

```html
<!-- 生成的正确 HTML -->
<meta property="og:image" content="https://your-domain.com/android-chrome-512x512.png" />
<meta property="og:url" content="https://your-domain.com/albums/travel" />
<link rel="icon" href="https://your-domain.com/favicon.ico" />
```

**分享效果：**
- ✅ 图片：完美显示
- ✅ 图标：正确加载
- ✅ URL：完整的绝对路径

## 🌐 您项目中的具体例子

### 主页分享 (app/layout.tsx)
```typescript
// 配置
metadataBase: new URL(getBaseUrl()),
openGraph: {
  images: ['/android-chrome-512x512.png'],
}

// 实际生成（开发环境）
// <meta property="og:image" content="http://localhost:3000/android-chrome-512x512.png" />

// 实际生成（生产环境）
// <meta property="og:image" content="https://your-domain.com/android-chrome-512x512.png" />
```

### 影集页面分享 (app/albums/[albumId]/page.tsx)
```typescript
// 配置
openGraph: {
  images: [album.coverImage], // 如: "/images/albums/travel_cover.jpg"
}

// 实际生成
// <meta property="og:image" content="https://your-domain.com/images/albums/travel_cover.jpg" />
```

### 照片页面分享 (app/albums/[albumId]/photos/[photoId]/page.tsx)
```typescript
// 配置
openGraph: {
  images: [photo.src], // 如: "/images/travel/sunset_001.jpg"
}

// 实际生成
// <meta property="og:image" content="https://your-domain.com/images/travel/sunset_001.jpg" />
```

## 🛠️ 测试方法

### 1. 开发环境测试
```bash
# 启动开发服务器
npm run dev

# 打开浏览器开发者工具，查看生成的 <meta> 标签
# 应该看到：content="http://localhost:3000/android-chrome-512x512.png"
```

### 2. 生产环境测试
```bash
# 构建项目
npm run build

# 查看生成的 HTML 文件
# 或部署后在浏览器查看源代码
```

### 3. 社交分享测试
1. 复制您的网页URL
2. 在 Facebook 分享调试器中粘贴
3. 查看预览效果是否正确显示图片

## ⚠️ 常见问题

### 问题1：图片路径仍然是相对路径
**原因**: metadataBase 配置错误或未生效
**解决**: 检查 getBaseUrl() 函数返回值

### 问题2：开发环境和生产环境表现不一致
**原因**: 环境变量配置不当
**解决**: 正确设置 NEXT_PUBLIC_SITE_URL

### 问题3：社交分享图片不显示
**原因**: 图片文件不存在或路径错误
**解决**: 确保 public/ 目录下有相应图片文件 
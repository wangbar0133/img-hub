# 服务器部署指南

## 部署脚本说明

### 1. 完整部署脚本 `deploy.sh`
**功能**：完整的生产环境部署，包含备份、回滚、健康检查等功能

**使用方法**：
```bash
# 在服务器项目目录下运行
./deploy.sh
```

**功能特点**：
- ✅ 自动备份数据、日志、图片文件
- ✅ 拉取最新代码并构建
- ✅ 健康检查和服务状态验证
- ✅ 支持自动回滚
- ✅ 详细的部署日志输出
- ✅ 交互式选项（清理镜像、删除备份等）

### 2. 快速部署脚本 `quick-deploy.sh`
**功能**：适用于紧急更新的快速部署脚本

**使用方法**：
```bash
# 在服务器项目目录下运行
./quick-deploy.sh
```

**功能特点**：
- ⚡ 快速执行，适合紧急更新
- ✅ 基本的代码拉取和重建
- ✅ 简单的状态检查
- ⚠️  无备份和回滚功能

## 手动部署步骤

如果脚本无法使用，可以手动执行以下步骤：

### 1. 更新代码
```bash
git pull origin main
```

### 2. 停止现有服务
```bash
# 新版 Docker Compose
docker compose down

# 或旧版
docker-compose down
```

### 3. 重新构建并启动
```bash
# 新版 Docker Compose
docker compose up -d --build

# 或旧版  
docker-compose up -d --build
```

### 4. 检查服务状态
```bash
# 查看容器状态
docker compose ps

# 查看应用日志
docker compose logs -f img-hub

# 查看服务器日志文件
tail -f logs/server.log
```

## 文件日志功能验证

### 1. 检查日志文件是否创建
```bash
ls -la logs/
cat logs/server.log
```

### 2. 测试 API 端点
```bash
# 测试服务器日志端点
curl https://your-domain.com/api/admin/server-logs
```

### 3. 访问管理界面
- 管理界面：`https://your-domain.com/admin`
- 日志查看：`https://your-domain.com/admin/logs`

## 故障排除

### 日志文件未创建
1. 检查容器启动命令：
```bash
docker compose exec img-hub ps aux
docker compose exec img-hub cat /proc/1/cmdline
```

2. 检查容器内日志目录：
```bash
docker compose exec img-hub ls -la /app/logs/
```

3. 手动进入容器调试：
```bash
docker compose exec img-hub sh
```

### 服务无法启动
1. 查看详细错误日志：
```bash
docker compose logs img-hub
```

2. 检查端口占用：
```bash
netstat -tulpn | grep :3000
```

3. 检查磁盘空间：
```bash
df -h
```

### 数据丢失恢复
如果使用 `deploy.sh` 部署，备份文件位于 `/tmp/img-hub-backup-*` 目录：

```bash
# 查找备份目录
ls -la /tmp/ | grep img-hub-backup

# 恢复数据
BACKUP_DIR="/tmp/img-hub-backup-YYYYMMDD_HHMMSS"
docker compose down
rm -rf data logs public/images
mv "$BACKUP_DIR/data" ./data
mv "$BACKUP_DIR/logs" ./logs  
mv "$BACKUP_DIR/public_images" ./public/images
docker compose up -d
```

## 监控和维护

### 定期检查
```bash
# 检查容器健康状态
docker compose ps

# 检查磁盘使用情况
du -sh data/ logs/ public/images/

# 检查日志文件大小
ls -lh logs/server.log
```

### 日志轮转
如果 `server.log` 文件过大，可以设置日志轮转：

```bash
# 手动清理日志（谨慎操作）
docker compose exec img-hub sh -c 'echo "" > /app/logs/server.log'

# 或者重启容器
docker compose restart img-hub
```

### 定期备份
建议设置定期备份脚本：

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/img-hub-$DATE"
mkdir -p "$BACKUP_DIR"
cp -r data/ logs/ public/images/ "$BACKUP_DIR/"
tar -czf "$BACKUP_DIR.tar.gz" -C "$BACKUP_DIR" .
rm -rf "$BACKUP_DIR"
echo "备份完成: $BACKUP_DIR.tar.gz"
```

## 环境变量配置

确保 `.env` 文件包含正确的配置：

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret
NODE_ENV=production
PORT=3000
FORCE_HTTPS=true
```

## 安全建议

1. **定期更新密码**：修改管理员密码和JWT密钥
2. **HTTPS配置**：确保使用HTTPS访问
3. **防火墙设置**：只开放必要端口
4. **定期备份**：数据库和图片文件
5. **日志监控**：定期查看错误日志
6. **系统更新**：保持系统和Docker版本更新

## 联系支持

如遇到问题，请提供以下信息：
- 错误日志：`docker compose logs img-hub`
- 服务器日志：`cat logs/server.log`
- 系统信息：`uname -a`、`docker --version`
- 部署时间和步骤
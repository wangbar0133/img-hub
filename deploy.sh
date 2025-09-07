#!/bin/bash

# img-hub 项目部署脚本
# 适用于服务器环境的自动化部署

set -e  # 遇到错误立即退出

# 配置变量
PROJECT_NAME="img-hub"
REPO_URL="https://github.com/your-username/img-hub.git"  # 请替换为实际的仓库地址
BRANCH="main"
BACKUP_DIR="/tmp/img-hub-backup-$(date +%Y%m%d_%H%M%S)"

echo "🚀 开始部署 $PROJECT_NAME..."
echo "📅 部署时间: $(date)"
echo "🔄 部署分支: $BRANCH"
echo ""

# 检查是否为root用户
if [ "$EUID" -eq 0 ]; then
  echo "⚠️  警告: 不建议使用root用户部署，建议使用普通用户"
fi

# 检查Docker和Docker Compose是否安装
echo "🔍 检查系统环境..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装Docker Compose"
    exit 1
fi

# 设置Docker Compose命令
if command -v docker compose &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo "✅ 环境检查通过"
echo ""

# 函数：回滚到备份
rollback() {
    echo "🔄 开始回滚..."
    if [ -d "$BACKUP_DIR" ]; then
        echo "📁 恢复数据目录..."
        if [ -d "data" ]; then
            rm -rf data
        fi
        if [ -d "logs" ]; then
            rm -rf logs
        fi
        if [ -d "public/images" ]; then
            rm -rf public/images
        fi
        
        mv "$BACKUP_DIR/data" ./data 2>/dev/null || true
        mv "$BACKUP_DIR/logs" ./logs 2>/dev/null || true  
        mv "$BACKUP_DIR/public_images" ./public/images 2>/dev/null || true
        
        echo "✅ 回滚完成"
    else
        echo "❌ 未找到备份目录"
    fi
}

# 捕获错误信号，执行回滚
trap 'echo "❌ 部署失败，开始回滚..."; rollback; exit 1' ERR

# 备份重要数据
echo "💾 备份重要数据..."
mkdir -p "$BACKUP_DIR"

if [ -d "data" ]; then
    echo "  📁 备份数据库文件..."
    cp -r data "$BACKUP_DIR/"
fi

if [ -d "logs" ]; then
    echo "  📁 备份日志文件..."
    cp -r logs "$BACKUP_DIR/"
fi

if [ -d "public/images" ]; then
    echo "  📁 备份图片文件..."
    cp -r public/images "$BACKUP_DIR/public_images"
fi

echo "✅ 数据备份完成: $BACKUP_DIR"
echo ""

# 拉取最新代码
echo "📥 拉取最新代码..."
if [ -d ".git" ]; then
    echo "  🔄 更新现有仓库..."
    git stash || true
    git fetch origin
    git checkout $BRANCH
    git reset --hard origin/$BRANCH
else
    echo "❌ 当前目录不是Git仓库"
    echo "请在项目根目录运行此脚本，或手动克隆仓库："
    echo "git clone $REPO_URL ."
    exit 1
fi

echo "✅ 代码更新完成"
echo ""

# 检查必要的配置文件
echo "🔍 检查配置文件..."

if [ ! -f "Dockerfile" ]; then
    echo "❌ 未找到 Dockerfile"
    exit 1
fi

if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 未找到 docker-compose.yml"
    exit 1
fi

# 创建必要的目录和设置权限
echo "📁 创建必要的目录..."
mkdir -p data logs public/images

# 设置目录权限确保Docker容器可以写入
echo "🔐 设置目录权限..."
# 容器中nextjs用户的UID是1001
sudo chown -R 1001:1001 data logs public/images || chown -R 1001:1001 data logs public/images 2>/dev/null || {
    echo "⚠️  无法设置目录所有者，尝试设置权限为777..."
    chmod -R 777 data logs public/images
}

# 设置环境变量（如果.env文件不存在）
if [ ! -f ".env" ]; then
    echo "⚙️  创建默认环境变量文件..."
    cat > .env << EOF
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=img-hub-admin-secret-key-$(date +%s)
NODE_ENV=production
PORT=3000
FORCE_HTTPS=true
EOF
    echo "✅ 已创建 .env 文件，请根据需要修改配置"
fi

echo "✅ 配置检查完成"
echo ""

# 停止现有服务
echo "⏹️  停止现有服务..."
$DOCKER_COMPOSE down || true
echo "✅ 服务已停止"
echo ""

# 清理旧镜像（可选）
read -p "🗑️  是否清理旧的Docker镜像？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 清理旧镜像..."
    docker system prune -f
    docker image prune -f
    echo "✅ 清理完成"
fi
echo ""

# 构建和启动服务
echo "🏗️  构建新镜像（优化版本）..."

# 优化Docker构建
echo "📝 清理Docker构建缓存..."
docker builder prune -f

# 询问是否使用优化构建
read -p "🚀 是否使用优化构建模式？(推荐使用，可减小镜像大小) (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⚡ 使用优化构建模式..."
    if ! $DOCKER_COMPOSE build --no-cache --compress; then
        echo "⚠️  优化构建失败，尝试标准构建..."
        $DOCKER_COMPOSE build --no-cache
    fi
    
    # 显示镜像大小对比
    echo "📊 镜像大小信息:"
    docker images ${PROJECT_NAME}* --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" 2>/dev/null || true
else
    echo "🔨 使用标准构建模式..."
    if ! $DOCKER_COMPOSE build --no-cache; then
        echo "❌ 标准构建也失败了，请检查Docker状态和系统资源"
        echo "💡 建议运行以下命令后重试："
        echo "  docker system prune -a -f"
        echo "  docker builder prune -f"
        exit 1
    fi
fi

echo "🚀 启动服务..."
$DOCKER_COMPOSE up -d

echo ""
echo "⏱️  等待服务启动..."
sleep 15

# 检查服务状态
echo "🔍 检查服务状态..."
$DOCKER_COMPOSE ps

# 健康检查
echo ""
echo "🏥 健康检查..."
max_attempts=12
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "  尝试 $attempt/$max_attempts..."
    
    # 首先检查Nginx代理是否运行，优先使用代理端口
    if $DOCKER_COMPOSE ps | grep -q "nginx.*Up"; then
        HEALTH_URL="http://localhost:80/"
    else
        # 如果没有Nginx，直接检查应用端口
        HEALTH_URL="http://localhost:3000/"
    fi
    
    echo "  📍 检查URL: $HEALTH_URL"
    if curl -f -s -o /dev/null "$HEALTH_URL"; then
        echo "✅ 服务健康检查通过"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ 服务健康检查失败"
        echo "📋 容器日志:"
        $DOCKER_COMPOSE logs --tail=20
        rollback
        exit 1
    fi
    
    sleep 5
    ((attempt++))
done

# 检查日志系统功能
echo ""
echo "📋 检查内存日志系统功能..."
sleep 5

echo "  🔍 测试管理员日志API访问..."

# 确定正确的访问URL
if $DOCKER_COMPOSE ps | grep -q "nginx.*Up"; then
    LOGS_API_URL="http://localhost:80/admin/logs"
    PUBLIC_LOGS_URL="http://localhost/admin/logs"
else
    LOGS_API_URL="http://localhost:3000/admin/logs"
    PUBLIC_LOGS_URL="http://localhost:3000/admin/logs"
fi

echo "  📍 测试URL: $LOGS_API_URL"
if curl -f -s -o /dev/null "$LOGS_API_URL"; then
    echo "✅ 日志API访问正常"
    echo "  📊 可以通过 $PUBLIC_LOGS_URL 查看应用日志"
else
    echo "⚠️  日志API测试失败，检查容器日志:"
    $DOCKER_COMPOSE logs --tail=15
fi

# 显示部署结果
echo ""
echo "🎉 部署完成!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 动态显示正确的访问URL
if $DOCKER_COMPOSE ps | grep -q "nginx.*Up"; then
    echo "📱 应用访问地址: http://localhost"
    echo "🔧 管理界面: http://localhost/admin"
    echo "📊 日志查看: http://localhost/admin/logs"
    echo "🌐 通过Nginx代理运行 (端口80/443)"
else
    echo "📱 应用访问地址: http://localhost:3000"
    echo "🔧 管理界面: http://localhost:3000/admin"
    echo "📊 日志查看: http://localhost:3000/admin/logs"
    echo "🔧 直连模式运行 (端口3000)"
fi

echo "💾 数据备份: $BACKUP_DIR"
echo ""
echo "📋 常用命令:"
echo "  查看服务状态: $DOCKER_COMPOSE ps"
echo "  查看容器日志: $DOCKER_COMPOSE logs -f img-hub"

if $DOCKER_COMPOSE ps | grep -q "nginx.*Up"; then
    echo "  查看应用日志: 访问 http://localhost/admin/logs"
else
    echo "  查看应用日志: 访问 http://localhost:3000/admin/logs"
fi

echo "  停止服务: $DOCKER_COMPOSE down"
echo "  重启服务: $DOCKER_COMPOSE restart"
echo ""
echo "🔧 如需回滚，运行以下命令:"
echo "  $DOCKER_COMPOSE down"
echo "  rm -rf data logs public/images"
echo "  mv $BACKUP_DIR/data ./data"
echo "  mv $BACKUP_DIR/logs ./logs"
echo "  mv $BACKUP_DIR/public_images ./public/images"
echo "  $DOCKER_COMPOSE up -d"
echo ""

# 清理成功的备份（可选）
read -p "🗑️  部署成功，是否删除备份目录？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf "$BACKUP_DIR"
    echo "✅ 备份目录已删除"
else
    echo "💾 备份目录保留: $BACKUP_DIR"
fi

echo ""
echo "🎊 部署完成! 祝您使用愉快!"
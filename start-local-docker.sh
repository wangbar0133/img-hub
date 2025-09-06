#!/bin/bash

echo "🐳 启动本地 Docker 环境..."

# 停止可能运行的开发服务器
echo "停止开发服务器..."
pkill -f "npm run dev" || true

# 停止已存在的容器
echo "停止现有容器..."
docker compose -f docker-compose.local.yml down

# 构建并启动新容器
echo "构建并启动容器..."
docker compose -f docker-compose.local.yml up -d --build

# 等待容器启动
echo "等待容器启动..."
sleep 10

# 显示容器状态
echo "容器状态:"
docker compose -f docker-compose.local.yml ps

# 显示日志
echo "容器日志:"
docker compose -f docker-compose.local.yml logs img-hub

echo ""
echo "✅ 本地环境已启动!"
echo "📱 应用访问: http://localhost:3000"
echo "🔧 管理界面: http://localhost:3000/admin"
echo "📊 日志查看: http://localhost:3000/admin/logs"
echo ""
echo "📋 常用命令:"
echo "  查看实时日志: docker compose -f docker-compose.local.yml logs -f img-hub"
echo "  查看 server.log 文件: cat logs/server.log"
echo "  进入容器: docker compose -f docker-compose.local.yml exec img-hub sh"
echo "  停止容器: docker compose -f docker-compose.local.yml down"
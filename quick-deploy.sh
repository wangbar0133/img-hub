#!/bin/bash

# 快速部署脚本 - 适用于紧急更新

echo "🚀 快速部署开始..."

# 检查Docker Compose命令
if command -v docker compose &> /dev/null; then
    DC="docker compose"
else
    DC="docker-compose"
fi

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 创建必要目录
mkdir -p data logs public/images

# 停止服务
echo "⏹️ 停止服务..."
$DC down

# 重新构建并启动
echo "🏗️ 重新构建并启动..."
$DC up -d --build

# 等待启动
echo "⏱️ 等待服务启动..."
sleep 10

# 检查状态
echo "🔍 检查状态..."
$DC ps

# 检查日志文件
echo "📋 检查日志文件..."
if [ -f "logs/server.log" ]; then
    echo "✅ server.log 已创建"
    tail -3 logs/server.log
else
    echo "⚠️ server.log 未找到"
fi

echo "✅ 快速部署完成!"
echo "📱 访问: http://localhost:3000"
echo "📊 日志: http://localhost:3000/admin/logs"
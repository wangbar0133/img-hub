#!/bin/bash

echo "🔍 环境变量调试脚本"
echo "==================="

# 1. 检查当前目录
echo "📂 当前目录: $(pwd)"
echo

# 2. 检查 .env.production 文件
echo "📄 检查 .env.production 文件:"
if [ -f ".env.production" ]; then
    echo "✅ .env.production 文件存在"
    echo "📋 文件内容:"
    cat .env.production
    echo
else
    echo "❌ .env.production 文件不存在"
    echo "📝 请创建该文件并设置环境变量"
    echo
fi

# 3. 检查Docker容器状态
echo "🐳 Docker 容器状态:"
docker-compose ps
echo

# 4. 检查容器中的环境变量
echo "🔧 容器中的环境变量:"
if docker ps -q -f name=img-hub-server | grep -q .; then
    echo "ADMIN_USERNAME: $(docker exec img-hub-server printenv ADMIN_USERNAME 2>/dev/null || echo 'Not set')"
    echo "ADMIN_PASSWORD: $(docker exec img-hub-server printenv ADMIN_PASSWORD 2>/dev/null || echo 'Not set')"
    echo "JWT_SECRET: $(docker exec img-hub-server printenv JWT_SECRET 2>/dev/null || echo 'Not set')"
    echo "NODE_ENV: $(docker exec img-hub-server printenv NODE_ENV 2>/dev/null || echo 'Not set')"
    echo "FORCE_HTTPS: $(docker exec img-hub-server printenv FORCE_HTTPS 2>/dev/null || echo 'Not set')"
else
    echo "❌ img-hub-server 容器未运行"
fi
echo

# 5. 测试API端点
echo "🧪 测试 API 端点:"
if command -v curl >/dev/null 2>&1; then
    echo "测试默认凭据 (admin/admin123):"
    curl -s -X POST http://localhost/api/admin/auth/ \
      -H "Content-Type: application/json" \
      -d '{"username":"admin","password":"admin123"}' | head -1
    
    echo "测试自定义凭据:"
    if [ -f ".env.production" ]; then
        PASSWORD=$(grep ADMIN_PASSWORD .env.production | cut -d'=' -f2)
        if [ ! -z "$PASSWORD" ]; then
            curl -s -X POST http://localhost/api/admin/auth/ \
              -H "Content-Type: application/json" \
              -d "{\"username\":\"admin\",\"password\":\"$PASSWORD\"}" | head -1
        fi
    fi
else
    echo "❌ curl 未安装，无法测试 API"
fi
echo

# 6. 提供解决建议
echo "💡 解决建议:"
echo "1. 确保 .env.production 文件存在并包含正确的变量"
echo "2. 使用正确的命令部署: docker-compose --env-file .env.production up -d"
echo "3. 如果修改了环境变量，需要重新创建容器: docker-compose up -d --force-recreate"
echo "4. 检查容器日志: docker-compose logs img-hub"
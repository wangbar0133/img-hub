#!/bin/bash

# 调试和修复环境问题的脚本

echo "🔍 Docker 环境调试工具"
echo "========================"

# 检查Docker Compose命令
if command -v docker compose &> /dev/null; then
    DC="docker compose"
else
    DC="docker-compose"
fi

echo "1. 检查容器状态..."
$DC ps

echo -e "\n2. 检查容器内权限..."
if $DC exec img-hub ls -la /app/logs/ 2>/dev/null; then
    echo "✅ 容器内日志目录权限："
    $DC exec img-hub ls -la /app/logs/
else
    echo "❌ 无法访问容器内日志目录"
fi

echo -e "\n3. 检查本地目录权限..."
echo "本地日志目录权限："
ls -la logs/ || echo "❌ 本地logs目录不存在"

echo -e "\n4. 检查Docker卷挂载..."
echo "Docker卷信息："
docker volume ls | grep logs || echo "❌ 未找到logs卷"

echo -e "\n5. 修复权限问题..."
echo "创建本地logs目录（如果不存在）..."
mkdir -p logs

echo "设置本地logs目录权限..."
chmod 777 logs  # 临时设置为全写权限
touch logs/server.log
chmod 666 logs/server.log

echo -e "\n6. 重启容器测试..."
echo "停止容器..."
$DC down

echo "重新启动容器..."
$DC up -d

echo "等待服务启动..."
sleep 10

echo -e "\n7. 验证日志文件..."
if [ -f "logs/server.log" ]; then
    echo "✅ server.log 文件已创建"
    echo "文件权限："
    ls -la logs/server.log
    echo -e "\n最新日志内容："
    tail -5 logs/server.log
else
    echo "❌ server.log 文件仍未创建"
    echo "容器日志："
    $DC logs --tail=20 img-hub
fi

echo -e "\n8. 进入容器调试（可选）..."
read -p "是否进入容器进行手动调试？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "进入容器 shell..."
    $DC exec img-hub sh
fi

echo -e "\n调试完成！"
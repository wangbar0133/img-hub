#!/bin/bash

# ImgHub 部署脚本
# 用于 ECS 或其他服务器的自动化部署

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 检查 Docker 服务状态
check_docker_service() {
    if ! systemctl is-active --quiet docker; then
        print_warning "Docker 服务未运行，正在启动..."
        sudo systemctl start docker
        sudo systemctl enable docker
    fi
}

# 清理旧容器和镜像
cleanup_old_containers() {
    print_info "清理旧容器和镜像..."
    
    # 停止并删除旧容器
    if docker ps -a | grep -q img-hub-app; then
        docker stop img-hub-app || true
        docker rm img-hub-app || true
    fi
    
    # 删除旧镜像
    if docker images | grep -q img-hub; then
        docker rmi img-hub || true
    fi
    
    # 清理未使用的资源
    docker system prune -f
}

# 构建和部署应用
deploy_app() {
    print_info "开始构建和部署应用..."
    
    # 使用 Docker Compose 部署
    if [ -f "docker-compose.yml" ]; then
        print_info "使用 Docker Compose 部署..."
        docker-compose down --remove-orphans || true
        docker-compose build --no-cache
        docker-compose up -d
    else
        print_info "使用 Docker 命令部署..."
        docker build -t img-hub .
        docker run -d \
            --name img-hub-app \
            -p 80:80 \
            --restart unless-stopped \
            img-hub
    fi
}

# 等待应用启动
wait_for_app() {
    print_info "等待应用启动..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost/health &> /dev/null; then
            print_success "应用启动成功！"
            return 0
        fi
        
        print_info "等待应用启动... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    print_error "应用启动超时"
    return 1
}

# 显示部署状态
show_status() {
    print_info "部署状态检查..."
    
    echo "=== Docker 容器状态 ==="
    docker ps | grep img-hub || echo "未找到运行中的容器"
    
    echo -e "\n=== 应用健康检查 ==="
    if curl -f http://localhost/health &> /dev/null; then
        print_success "应用运行正常"
    else
        print_error "应用健康检查失败"
    fi
    
    echo -e "\n=== 访问信息 ==="
    echo "本地访问: http://localhost"
    
    # 获取公网IP（如果可用）
    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "获取失败")
    if [ "$PUBLIC_IP" != "获取失败" ]; then
        echo "公网访问: http://$PUBLIC_IP"
    fi
}

# 主函数
main() {
    print_info "开始 ImgHub 部署流程..."
    
    # 检查必要的命令
    check_command "docker"
    check_command "curl"
    
    # 检查 Docker 服务
    check_docker_service
    
    # 清理旧资源
    cleanup_old_containers
    
    # 部署应用
    deploy_app
    
    # 等待应用启动
    if wait_for_app; then
        show_status
        print_success "🎉 ImgHub 部署完成！"
        print_info "你可以通过 http://localhost 访问网站"
    else
        print_error "部署失败，请检查日志"
        print_info "查看日志命令: docker logs img-hub-app"
        exit 1
    fi
}

# 帮助信息
show_help() {
    echo "ImgHub 部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助信息"
    echo "  -c, --clean    仅清理旧容器和镜像"
    echo "  -s, --status   仅显示当前状态"
    echo "  -r, --restart  重启应用"
    echo ""
    echo "示例:"
    echo "  $0              # 完整部署"
    echo "  $0 --clean      # 清理资源"
    echo "  $0 --status     # 查看状态"
    echo "  $0 --restart    # 重启应用"
}

# 重启应用
restart_app() {
    print_info "重启应用..."
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose restart
    else
        docker restart img-hub-app
    fi
    
    wait_for_app
    print_success "应用重启完成"
}

# 参数处理
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -c|--clean)
        cleanup_old_containers
        print_success "清理完成"
        exit 0
        ;;
    -s|--status)
        show_status
        exit 0
        ;;
    -r|--restart)
        restart_app
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "未知选项: $1"
        show_help
        exit 1
        ;;
esac 
#!/bin/bash

# ImgHub 统一图片管理工具
# 集成图片处理、影集管理、自动部署的完整解决方案
# 版本: 2.0.0

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 配置
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ALBUMS_JSON="$PROJECT_ROOT/data/albums.json"
IMAGES_DIR="$PROJECT_ROOT/public/images"
ORIGINAL_DIR="$IMAGES_DIR/original"
THUMBNAILS_DIR="$IMAGES_DIR/thumbnails"
DETAIL_DIR="$IMAGES_DIR/detail"

# 图片处理参数
THUMBNAIL_SIZE="400"
DISPLAY_SIZE="800"
DETAIL_SIZE="900"
THUMBNAIL_QUALITY="75"
DISPLAY_QUALITY="85"
DETAIL_QUALITY="90"

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${PURPLE}[STEP]${NC} $1"; }

# 本地测试模式
local_test_mode() {
    log_step "本地测试模式"
    log_info "此模式将在本地处理图片并更新数据，但不部署到服务器"
    echo ""
    
    show_albums
    
    echo "请选择测试操作:"
    echo "  1. 添加图片到现有影集（本地测试）"
    echo "  2. 创建新影集并添加图片（本地测试）"
    echo "  3. 启动本地预览服务"
    echo "  4. 查看当前数据状态"
    echo "  5. 退出"
    echo ""
    
    read -p "请选择 (1-5): " test_choice
    
    case $test_choice in
        1)
            local album_id=$(select_album)
            if [ $? -eq 0 ]; then
                read -p "图片路径 (文件或目录): " photos_path
                if [ -d "$photos_path" ]; then
                    add_photos_to_album "$photos_path" "$album_id" "true"
                else
                    add_photos_to_album "$photos_path" "$album_id" "false"
                fi
                
                log_success "图片已添加到本地影集，数据已更新"
                ask_local_preview
            fi
            ;;
        2)
            local new_album_id=$(create_album)
            read -p "图片路径 (文件或目录): " photos_path
            if [ -d "$photos_path" ]; then
                add_photos_to_album "$photos_path" "$new_album_id" "true"
            else
                add_photos_to_album "$photos_path" "$new_album_id" "false"
            fi
            
            log_success "新影集已创建，图片已处理，数据已保存到本地"
            ask_local_preview
            ;;
        3)
            start_local_preview
            ;;
        4)
            show_data_status
            ;;
        5)
            log_info "退出本地测试模式"
            exit 0
            ;;
        *)
            log_error "无效选择"
            exit 1
            ;;
    esac
}

# 询问是否启动本地预览
ask_local_preview() {
    echo ""
    read -p "是否启动本地预览服务查看效果？(y/N): " preview_choice
    if [[ "$preview_choice" =~ ^[Yy]$ ]]; then
        start_local_preview
    else
        log_info "您可以稍后运行 '$0 local-preview' 来查看效果"
    fi
}

# 启动本地预览服务
start_local_preview() {
    log_step "启动本地预览服务..."
    
    # 检查是否安装了Node.js
    if ! command -v npm &> /dev/null; then
        log_error "需要安装 Node.js 和 npm 来运行预览服务"
        echo "请访问 https://nodejs.org/ 安装 Node.js"
        return 1
    fi
    
    # 切换到项目根目录
    cd "$PROJECT_ROOT"
    
    # 检查是否已安装依赖
    if [ ! -d "node_modules" ]; then
        log_info "安装项目依赖..."
        npm install
    fi
    
    log_success "启动开发服务器..."
    log_info "预览地址: http://localhost:3000"
    log_info "按 Ctrl+C 停止服务"
    echo ""
    
    # 启动开发服务器
    npm run dev
}

# 显示数据状态
show_data_status() {
    log_step "当前数据状态"
    
    # 显示影集信息
    show_albums
    
    # 显示图片文件统计
    echo ""
    log_info "图片文件统计:"
    
    local travel_count=$(find "$IMAGES_DIR/travel" -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" 2>/dev/null | wc -l)
    local cosplay_count=$(find "$IMAGES_DIR/cosplay" -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" 2>/dev/null | wc -l)
    local detail_count=$(find "$DETAIL_DIR" -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" 2>/dev/null | wc -l)
    local original_count=$(find "$ORIGINAL_DIR" -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" 2>/dev/null | wc -l)
    local thumb_travel_count=$(find "$THUMBNAILS_DIR/travel" -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" 2>/dev/null | wc -l)
    local thumb_cosplay_count=$(find "$THUMBNAILS_DIR/cosplay" -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" 2>/dev/null | wc -l)
    
    echo "  travel/ 展示图:     $travel_count 张"
    echo "  cosplay/ 展示图:    $cosplay_count 张"
    echo "  detail/ 详情图:     $detail_count 张"
    echo "  original/ 原图:     $original_count 张"
    echo "  thumbnails/travel/: $thumb_travel_count 张"
    echo "  thumbnails/cosplay/: $thumb_cosplay_count 张"
    
    # 显示数据文件信息
    echo ""
    log_info "数据文件状态:"
    if [ -f "$ALBUMS_JSON" ]; then
        local file_size=$(du -h "$ALBUMS_JSON" | cut -f1)
        local album_count=$(jq length "$ALBUMS_JSON" 2>/dev/null || echo "0")
        echo "  albums.json: $file_size ($album_count 个影集)"
    else
        echo "  albums.json: 不存在"
    fi
    
    # 显示目录结构
    echo ""
    log_info "目录结构:"
    tree "$IMAGES_DIR" -L 3 2>/dev/null || find "$IMAGES_DIR" -type d | sort
}

# 检查依赖
check_dependencies() {
    local deps=("convert" "jq" "rsync")
    local missing=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing+=("$dep")
        fi
    done
    
    if [ ${#missing[@]} -ne 0 ]; then
        log_error "缺少依赖: ${missing[*]}"
        echo ""
        echo "安装方法："
        echo "macOS: brew install imagemagick jq rsync"
        echo "Ubuntu: sudo apt install imagemagick jq rsync"
        exit 1
    fi
}

# 初始化目录结构
init_directories() {
    log_step "初始化目录结构..."
    
    mkdir -p "$IMAGES_DIR"/{travel,cosplay,detail,thumbnails/{travel,cosplay},original}
    mkdir -p "$(dirname "$ALBUMS_JSON")"
    
    # 创建初始数据文件
    if [ ! -f "$ALBUMS_JSON" ]; then
        echo "[]" > "$ALBUMS_JSON"
        log_info "创建初始数据文件: $ALBUMS_JSON"
    fi
    
    log_success "目录结构初始化完成"
}

# 验证图片文件
validate_image() {
    local file="$1"
    
    if [ ! -f "$file" ]; then
        log_error "文件不存在: $file"
        return 1
    fi
    
    # 检查MIME类型
    local mime_type=$(file -b --mime-type "$file" 2>/dev/null || echo "unknown")
    case $mime_type in
        image/jpeg|image/jpg|image/png|image/webp|image/tiff)
            return 0
            ;;
        *)
            log_error "不支持的图片格式: $mime_type"
            return 1
            ;;
    esac
}

# 生成唯一ID
generate_id() {
    date +%s%N | cut -b1-13
}

# 压缩图片（保持比例）
compress_image_proportional() {
    local input_file="$1"
    local output_file="$2"
    local max_size="$3"
    local quality="$4"
    
    convert "$input_file" \
        -resize "${max_size}x${max_size}>" \
        -quality "$quality" \
        -strip \
        -interlace Plane \
        "$output_file"
}

# 生成正方形缩略图
generate_thumbnail() {
    local input_file="$1"
    local output_file="$2"
    
    convert "$input_file" \
        -resize "${THUMBNAIL_SIZE}x${THUMBNAIL_SIZE}^" \
        -gravity center \
        -extent "${THUMBNAIL_SIZE}x${THUMBNAIL_SIZE}" \
        -quality "$THUMBNAIL_QUALITY" \
        -strip \
        "$output_file"
}

# 提取图片元数据
extract_metadata() {
    local file="$1"
    
    # 尝试提取EXIF数据
    local camera=$(identify -verbose "$file" 2>/dev/null | grep -i "exif:Model" | cut -d: -f2- | xargs || echo "")
    local iso=$(identify -verbose "$file" 2>/dev/null | grep -i "exif:ISOSpeedRatings" | cut -d: -f2- | xargs || echo "")
    local aperture=$(identify -verbose "$file" 2>/dev/null | grep -i "exif:FNumber" | cut -d: -f2- | xargs || echo "")
    local shutter=$(identify -verbose "$file" 2>/dev/null | grep -i "exif:ExposureTime" | cut -d: -f2- | xargs || echo "")
    
    # 构建设置字符串
    local settings=""
    [ -n "$aperture" ] && settings+="f/$aperture"
    [ -n "$shutter" ] && [ -n "$settings" ] && settings+=", ${shutter}s" || settings+="${shutter}s"
    [ -n "$iso" ] && [ -n "$settings" ] && settings+=", ISO $iso" || settings+="ISO $iso"
    
    echo "$camera|$settings"
}

# 处理单张图片
process_image() {
    local image_path="$1"
    local category="$2"
    local title="$3"
    local description="$4"
    local location="$5"
    local tags="$6"
    
    # 验证图片
    validate_image "$image_path" || return 1
    
    # 生成文件信息
    local photo_id=$(generate_id)
    local extension="${image_path##*.}"
    local filename="${category}_${photo_id}.${extension}"
    
    # 目标路径
    local original_dest="$ORIGINAL_DIR/$filename"
    local display_dest="$IMAGES_DIR/$category/$filename"
    local detail_dest="$DETAIL_DIR/$filename"
    local thumbnail_dest="$THUMBNAILS_DIR/$category/$filename"
    
    log_info "处理图片: $(basename "$image_path")"
    
    # 复制原图
    cp "$image_path" "$original_dest"
    
    # 生成各种尺寸
    compress_image_proportional "$image_path" "$display_dest" "$DISPLAY_SIZE" "$DISPLAY_QUALITY"
    compress_image_proportional "$image_path" "$detail_dest" "$DETAIL_SIZE" "$DETAIL_QUALITY"
    generate_thumbnail "$image_path" "$thumbnail_dest"
    
    # 提取元数据
    local metadata=$(extract_metadata "$image_path")
    local camera=$(echo "$metadata" | cut -d'|' -f1)
    local settings=$(echo "$metadata" | cut -d'|' -f2)
    
    # 构建照片数据
    local photo_data=$(cat << EOF
{
    "id": $photo_id,
    "src": "/images/$category/$filename",
    "detailSrc": "/images/detail/$filename",
    "originalSrc": "/images/original/$filename",
    "thumbnail": "/images/thumbnails/$category/$filename",
    "alt": "$title",
    "title": "$title",
    "description": "$description",
    "location": "$location",
    "camera": "$camera",
    "settings": "$settings",
    "tags": [$(echo "$tags" | sed 's/,/","/g' | sed 's/^/"/' | sed 's/$/"/' | sed 's/^""$//')],
    "addedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
)
    
    log_success "图片处理完成: $photo_id"
    echo "$photo_data"
}

# 显示现有影集
show_albums() {
    log_info "当前影集列表:"
    if [ -f "$ALBUMS_JSON" ] && [ -s "$ALBUMS_JSON" ]; then
        jq -r '.[] | "  \(.id) - \(.title) (\(.category)) - \(.photoCount)张照片"' "$ALBUMS_JSON"
    else
        log_warning "暂无影集"
    fi
    echo ""
}

# 交互式选择影集
select_album() {
    local albums=($(jq -r '.[].id' "$ALBUMS_JSON" 2>/dev/null || echo ""))
    
    if [ ${#albums[@]} -eq 0 ]; then
        log_warning "没有现有影集，请先创建一个"
        return 1
    fi
    
    echo ""
    log_info "请选择目标影集:"
    for i in "${!albums[@]}"; do
        local album_id="${albums[$i]}"
        local album_info=$(jq -r ".[] | select(.id==\"$album_id\") | \"\(.title) (\(.category))\"" "$ALBUMS_JSON")
        echo "  $((i+1)). $album_id - $album_info"
    done
    echo ""
    
    while true; do
        read -p "请输入选择 (1-${#albums[@]}): " choice
        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le ${#albums[@]} ]; then
            echo "${albums[$((choice-1))]}"
            return 0
        else
            log_error "无效选择，请输入 1-${#albums[@]} 之间的数字"
        fi
    done
}

# 创建新影集
create_album() {
    echo ""
    log_step "创建新影集"
    
    read -p "影集ID (英文，用-连接): " album_id
    read -p "影集标题: " album_title
    read -p "影集描述: " album_description
    
    echo ""
    log_info "请选择分类:"
    echo "  1. travel (旅行)"
    echo "  2. cosplay (Cosplay)"
    echo ""
    
    while true; do
        read -p "请选择 (1-2): " category_choice
        case $category_choice in
            1) album_category="travel"; break;;
            2) album_category="cosplay"; break;;
            *) log_error "无效选择，请输入1或2";;
        esac
    done
    
    read -p "拍摄地点 (可选): " album_location
    
    echo ""
    read -p "是否设为精选影集？(y/N): " featured_choice
    local album_featured="false"
    [[ "$featured_choice" =~ ^[Yy]$ ]] && album_featured="true"
    
    # 创建新影集
    local new_album=$(cat << EOF
{
    "id": "$album_id",
    "title": "$album_title", 
    "description": "$album_description",
    "coverImage": "",
    "category": "$album_category",
    "featured": $album_featured,
    "location": "$album_location",
    "createdAt": "$(date -u +%Y-%m-%d)",
    "photoCount": 0,
    "photos": []
}
EOF
)
    
    # 添加到albums.json
    local temp_file=$(mktemp)
    if [ -s "$ALBUMS_JSON" ]; then
        jq ". + [$new_album]" "$ALBUMS_JSON" > "$temp_file"
    else
        echo "[$new_album]" > "$temp_file"
    fi
    mv "$temp_file" "$ALBUMS_JSON"
    
    log_success "新影集创建成功: $album_id"
    echo "$album_id"
}

# 添加图片到影集
add_photos_to_album() {
    local photos_path="$1"
    local album_id="$2"
    local is_batch="$3"
    
    # 获取影集信息
    local album_info=$(jq -r ".[] | select(.id==\"$album_id\")" "$ALBUMS_JSON")
    if [ -z "$album_info" ]; then
        log_error "影集不存在: $album_id"
        return 1
    fi
    
    local album_category=$(echo "$album_info" | jq -r '.category')
    local photos_data="[]"
    
    log_step "添加图片到影集: $album_id"
    
    if [ "$is_batch" = "true" ]; then
        # 批量处理
        log_info "批量处理目录: $photos_path"
        find "$photos_path" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.tiff" \) | while read -r image_file; do
            local basename=$(basename "$image_file" | sed 's/\.[^.]*$//')
            log_info "处理: $(basename "$image_file")"
            
            local photo_data=$(process_image "$image_file" "$album_category" "$basename" "批量上传的图片" "" "")
            if [ $? -eq 0 ]; then
                photos_data=$(echo "$photos_data" | jq ". + [$photo_data]")
            fi
        done
    else
        # 单个文件
        local basename=$(basename "$photos_path" | sed 's/\.[^.]*$//')
        read -p "图片标题 [$basename]: " photo_title
        photo_title="${photo_title:-$basename}"
        
        read -p "图片描述 (可选): " photo_description
        read -p "拍摄地点 (可选): " photo_location
        read -p "标签 (用逗号分隔，可选): " photo_tags
        
        local photo_data=$(process_image "$photos_path" "$album_category" "$photo_title" "$photo_description" "$photo_location" "$photo_tags")
        if [ $? -eq 0 ]; then
            photos_data="[$photo_data]"
        fi
    fi
    
    # 更新影集
    if [ "$photos_data" != "[]" ]; then
        update_album_with_photos "$album_id" "$photos_data"
    fi
}

# 更新影集数据
update_album_with_photos() {
    local album_id="$1"
    local photos_data="$2"
    
    log_step "更新影集数据..."
    
    local temp_file=$(mktemp)
    jq "map(if .id == \"$album_id\" then 
        .photos += $photos_data |
        .photoCount = (.photos | length) |
        (if .coverImage == \"\" then .coverImage = .photos[0].src else . end)
    else . end)" "$ALBUMS_JSON" > "$temp_file"
    
    mv "$temp_file" "$ALBUMS_JSON"
    log_success "影集数据更新完成"
}

# 部署到服务器
deploy_to_server() {
    log_step "部署到服务器..."
    
    # 检查配置文件
    local env_file="$PROJECT_ROOT/.env.deploy"
    if [ -f "$env_file" ]; then
        source "$env_file"
    fi
    
    if [ -z "$DEPLOY_HOST" ]; then
        log_warning "未配置部署服务器"
        read -p "服务器地址 (user@host): " DEPLOY_HOST
        read -p "服务器路径: " DEPLOY_PATH
        read -p "SSH密钥路径 (可选): " SSH_KEY
        
        # 保存配置
        cat > "$env_file" << EOF
DEPLOY_HOST="$DEPLOY_HOST"
DEPLOY_PATH="$DEPLOY_PATH"
SSH_KEY="$SSH_KEY"
EOF
        log_info "配置已保存到 $env_file"
    fi
    
    # 同步文件
    local rsync_opts="-avz --progress --delete"
    if [ -n "$SSH_KEY" ]; then
        rsync_opts="$rsync_opts -e 'ssh -i $SSH_KEY'"
    fi
    
    log_info "同步图片文件..."
    eval "rsync $rsync_opts '$IMAGES_DIR/' '$DEPLOY_HOST:$DEPLOY_PATH/public/images/'"
    
    log_info "同步数据文件..."
    eval "rsync $rsync_opts '$ALBUMS_JSON' '$DEPLOY_HOST:$DEPLOY_PATH/data/'"
    
    # 重新构建应用
    log_info "重新构建应用..."
    if [ -n "$SSH_KEY" ]; then
        ssh -i "$SSH_KEY" "$DEPLOY_HOST" "cd $DEPLOY_PATH && docker-compose up -d --build"
    else
        ssh "$DEPLOY_HOST" "cd $DEPLOY_PATH && docker-compose up -d --build"
    fi
    
    log_success "部署完成"
}

# 显示帮助
show_help() {
    cat << EOF
${CYAN}ImgHub 统一图片管理工具 v2.1${NC}

${YELLOW}使用方法:${NC}
  $0                          # 交互式操作
  $0 upload <路径> [影集ID]     # 快速上传
  $0 create                   # 创建新影集
  $0 list                     # 显示影集列表
  $0 deploy                   # 部署到服务器
  $0 local-test               # 本地测试模式
  $0 local-preview            # 启动本地预览
  $0 status                   # 查看数据状态
  $0 help                     # 显示帮助

${YELLOW}快速命令:${NC}
  # 交互式上传
  $0

  # 快速上传到现有影集
  $0 upload ./photos/ mountain-landscapes

  # 上传单张图片（会询问目标影集）
  $0 upload ./photo.jpg

  # 创建新影集
  $0 create

  # 本地测试模式（推荐用于开发）
  $0 local-test

${YELLOW}功能特性:${NC}
  ✅ 自动生成4种图片尺寸（400px缩略图、800px展示图、900px详情图、原图）
  ✅ 自动提取EXIF数据（相机型号、拍摄参数）
  ✅ 支持批量处理和单张上传
  ✅ 智能影集管理（JSON格式，自动更新）
  ✅ 一键部署到服务器
  ✅ 本地测试模式，无需部署即可预览
  ✅ 完全自动化工作流程

${YELLOW}本地测试特性:${NC}
  🧪 本地图片处理和数据管理
  🔍 实时预览服务（http://localhost:3000）
  📊 数据状态查看和统计
  ⚡ 快速开发测试环境

EOF
}

# 主函数
main() {
    case "${1:-interactive}" in
        "help"|"-h"|"--help")
            show_help
            ;;
        "list"|"-l")
            show_albums
            ;;
        "create")
            check_dependencies
            init_directories
            create_album
            ;;
        "upload")
            check_dependencies
            init_directories
            
            if [ -z "$2" ]; then
                log_error "请指定图片路径"
                echo "用法: $0 upload <路径> [影集ID]"
                exit 1
            fi
            
            local photos_path="$2"
            local album_id="$3"
            
            # 如果没有指定影集ID，则交互式选择
            if [ -z "$album_id" ]; then
                show_albums
                album_id=$(select_album)
                if [ $? -ne 0 ]; then
                    log_info "创建新影集..."
                    album_id=$(create_album)
                fi
            fi
            
            # 判断是文件还是目录
            if [ -d "$photos_path" ]; then
                add_photos_to_album "$photos_path" "$album_id" "true"
            else
                add_photos_to_album "$photos_path" "$album_id" "false"
            fi
            
            read -p "是否部署到服务器？(y/N): " deploy_choice
            [[ "$deploy_choice" =~ ^[Yy]$ ]] && deploy_to_server
            ;;
        "deploy")
            deploy_to_server
            ;;
        "local-test")
            check_dependencies
            init_directories
            local_test_mode
            ;;
        "local-preview")
            start_local_preview
            ;;
        "status")
            show_data_status
            ;;
        "interactive"|*)
            # 交互式模式
            check_dependencies
            init_directories
            
            echo ""
            log_info "ImgHub 图片管理工具"
            echo ""
            
            show_albums
            
            echo "请选择操作:"
            echo "  1. 添加图片到现有影集"
            echo "  2. 创建新影集并添加图片"
            echo "  3. 仅部署到服务器"
            echo "  4. 本地测试模式"
            echo "  5. 退出"
            echo ""
            
            read -p "请选择 (1-5): " action_choice
            
            case $action_choice in
                1)
                    local album_id=$(select_album)
                    if [ $? -eq 0 ]; then
                        read -p "图片路径 (文件或目录): " photos_path
                        if [ -d "$photos_path" ]; then
                            add_photos_to_album "$photos_path" "$album_id" "true"
                        else
                            add_photos_to_album "$photos_path" "$album_id" "false"
                        fi
                        
                        read -p "是否部署到服务器？(y/N): " deploy_choice
                        [[ "$deploy_choice" =~ ^[Yy]$ ]] && deploy_to_server
                    fi
                    ;;
                2)
                    local new_album_id=$(create_album)
                    read -p "图片路径 (文件或目录): " photos_path
                    if [ -d "$photos_path" ]; then
                        add_photos_to_album "$photos_path" "$new_album_id" "true"
                    else
                        add_photos_to_album "$photos_path" "$new_album_id" "false"
                    fi
                    
                    read -p "是否部署到服务器？(y/N): " deploy_choice
                    [[ "$deploy_choice" =~ ^[Yy]$ ]] && deploy_to_server
                    ;;
                3)
                    deploy_to_server
                    ;;
                4)
                    local_test_mode
                    ;;
                5)
                    log_info "退出"
                    exit 0
                    ;;
                *)
                    log_error "无效选择"
                    exit 1
                    ;;
            esac
            ;;
    esac
    
    log_success "操作完成！🎉"
}

# 运行主函数
main "$@" 
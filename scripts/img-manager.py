#!/usr/bin/env python3
"""
ImgHub 图片管理工具
专注于图片处理和影集管理的本地工具
版本: 5.0.0
"""

import os
import sys
import json
import shutil
import subprocess
import argparse
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

# 颜色定义
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    PURPLE = '\033[0;35m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'  # No Color

class ImgManager:
    def __init__(self):
        # 基础配置
        self.script_dir = Path(__file__).parent
        self.project_root = self.script_dir.parent
        
        # 项目目录
        self.project_albums_json = self.project_root / "public" / "albums.json"
        self.project_images_dir = self.project_root / "public" / "images"
        
        # 图片处理参数
        self.thumbnail_size = 400
        self.display_size = 800
        self.detail_size = 900
        self.thumbnail_quality = 75
        self.display_quality = 85
        self.detail_quality = 90
        self.original_quality = 95
        
        # 原图处理配置
        self.compress_original = False
        self.original_max_size = 2000
        
        # 支持的分类
        self.categories = ["travel", "cosplay"]
        
        # 依赖检查
        self.required_deps = ["convert", "identify", "exiftool"]

    def log_step(self, message: str):
        """打印步骤信息"""
        print(f"{Colors.BLUE}[STEP]{Colors.NC} {message}")
        
    def log_info(self, message: str):
        """打印信息"""
        print(f"{Colors.CYAN}[INFO]{Colors.NC} {message}")
        
    def log_success(self, message: str):
        """打印成功信息"""
        print(f"{Colors.GREEN}[SUCCESS]{Colors.NC} {message}")
        
    def log_warning(self, message: str):
        """打印警告信息"""
        print(f"{Colors.YELLOW}[WARNING]{Colors.NC} {message}")
        
    def log_error(self, message: str):
        """打印错误信息"""
        print(f"{Colors.RED}[ERROR]{Colors.NC} {message}")

    def check_dependencies(self) -> bool:
        """检查依赖工具"""
        missing = []
        for dep in self.required_deps:
            if not shutil.which(dep):
                missing.append(dep)
        
        if missing:
            self.log_error(f"缺少依赖: {', '.join(missing)}")
            print("\n安装方法:")
            print("macOS: brew install imagemagick exiftool")
            print("Ubuntu: sudo apt install imagemagick libimage-exiftool-perl")
            return False
        return True

    def get_directories(self):
        """获取项目目录结构"""
        return {
            'albums_json': self.project_albums_json,
            'images_dir': self.project_images_dir,
            'original_dir': self.project_images_dir / "original",
            'thumbnails_dir': self.project_images_dir / "thumbnails",
            'detail_dir': self.project_images_dir / "detail"
        }

    def init_directories(self):
        """初始化目录结构"""
        self.log_step("初始化项目目录结构...")
        
        dirs = self.get_directories()
        
        # 创建目录
        directories = [
            dirs['images_dir'] / "travel",
            dirs['images_dir'] / "cosplay", 
            dirs['detail_dir'],
            dirs['original_dir'],
            dirs['thumbnails_dir'] / "travel",
            dirs['thumbnails_dir'] / "cosplay"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
        
        # 创建数据目录
        dirs['albums_json'].parent.mkdir(parents=True, exist_ok=True)
        
        # 创建初始数据文件
        if not dirs['albums_json'].exists():
            with open(dirs['albums_json'], 'w', encoding='utf-8') as f:
                json.dump([], f, ensure_ascii=False, indent=2)
            self.log_info(f"创建初始数据文件: {dirs['albums_json']}")
        
        self.log_success("项目目录结构初始化完成")

    def validate_image(self, file_path: Path) -> bool:
        """验证图片文件"""
        if not file_path.exists():
            self.log_error(f"文件不存在: {file_path}")
            return False
        
        # 检查文件类型
        try:
            result = subprocess.run(
                ["identify", "-format", "%m", str(file_path)],
                capture_output=True, text=True, check=True
            )
            format_type = result.stdout.strip().lower()
            if format_type in ["jpeg", "jpg", "png", "webp", "tiff"]:
                return True
            else:
                self.log_error(f"不支持的图片格式: {format_type}")
                return False
        except subprocess.CalledProcessError:
            self.log_error(f"无法识别图片格式: {file_path}")
            return False

    def generate_id(self) -> int:
        """生成唯一ID"""
        import time
        return int(time.time() * 1000)

    def compress_image(self, input_file: Path, output_file: Path, 
                      max_size: int, quality: int):
        """压缩图片（保持比例）"""
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        cmd = [
            "convert", str(input_file),
            "-resize", f"{max_size}x{max_size}>",
            "-quality", str(quality),
            "-strip",
            "-interlace", "Plane",
            str(output_file)
        ]
        
        subprocess.run(cmd, check=True)

    def copy_original_image(self, input_file: Path, output_file: Path):
        """复制原图，不进行任何压缩或处理"""
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        # 使用shutil.copy2保持文件的元数据
        shutil.copy2(input_file, output_file)
        
        self.log_info(f"原图已保存: {output_file.name} (无压缩)")

    def generate_thumbnail(self, input_file: Path, output_file: Path):
        """生成保持原始比例的缩略图"""
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        cmd = [
            "convert", str(input_file),
            "-resize", f"{self.thumbnail_size}x{self.thumbnail_size}>",
            "-quality", str(self.thumbnail_quality),
            "-strip",
            "-interlace", "Plane",
            str(output_file)
        ]
        
        subprocess.run(cmd, check=True)

    def extract_metadata(self, file_path: Path) -> Dict[str, str]:
        """提取图片元数据"""
        metadata = {}
        
        try:
            # 使用 exiftool 提取 EXIF 数据
            result = subprocess.run([
                "exiftool", "-json", str(file_path)
            ], capture_output=True, text=True, check=True)
            
            exif_data = json.loads(result.stdout)[0]
            
            # 提取常用信息
            metadata["camera"] = exif_data.get("Model", "Unknown")
            metadata["lens"] = exif_data.get("LensModel", "")
            
            # 拍摄设置
            aperture = exif_data.get("FNumber", "")
            shutter = exif_data.get("ExposureTime", "")
            iso = exif_data.get("ISO", "")
            
            settings_parts = []
            if aperture:
                settings_parts.append(f"f/{aperture}")
            if shutter:
                settings_parts.append(f"{shutter}s")
            if iso:
                settings_parts.append(f"ISO {iso}")
            
            metadata["settings"] = ", ".join(settings_parts) if settings_parts else "Unknown"
            
            # 拍摄时间
            metadata["date_taken"] = exif_data.get("CreateDate", "")
            
        except (subprocess.CalledProcessError, json.JSONDecodeError, KeyError):
            metadata = {
                "camera": "Unknown",
                "lens": "",
                "settings": "Unknown",
                "date_taken": ""
            }
        
        return metadata

    def process_image(self, image_path: Path, category: str, 
                     album_id: str) -> Optional[Dict[str, Any]]:
        """处理单张图片"""
        if not self.validate_image(image_path):
            return None
        
        # 生成文件名
        photo_id = self.generate_id()
        ext = image_path.suffix.lower()
        if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
            ext = '.jpg'
        
        filename = f"{category}_{photo_id}{ext}"
        
        dirs = self.get_directories()
        
        # 处理不同尺寸的图片
        try:
            # 展示图 (800px)
            display_path = dirs['images_dir'] / category / filename
            self.compress_image(image_path, display_path, 
                              self.display_size, self.display_quality)
            
            # 详情图 (900px)
            detail_path = dirs['detail_dir'] / filename
            self.compress_image(image_path, detail_path, 
                              self.detail_size, self.detail_quality)
            
            # 原图处理
            original_path = dirs['original_dir'] / filename
            if self.compress_original:
                # 压缩原图
                self.compress_image(image_path, original_path, 
                                  self.original_max_size, self.original_quality)
            else:
                # 不压缩，直接复制原图
                self.copy_original_image(image_path, original_path)
            
            # 缩略图
            thumbnail_path = dirs['thumbnails_dir'] / category / filename
            self.generate_thumbnail(image_path, thumbnail_path)
            
            # 提取元数据
            metadata = self.extract_metadata(image_path)
            
            # 构建照片数据
            photo_data = {
                "id": photo_id,
                "src": f"/images/{category}/{filename}",
                "detailSrc": f"/images/detail/{filename}",
                "originalSrc": f"/images/original/{filename}",
                "thumbnail": f"/images/thumbnails/{category}/{filename}",
                "alt": image_path.stem,
                "title": image_path.stem,
                "description": "",
                "location": "",
                "camera": metadata["camera"],
                "settings": metadata["settings"],
                "tags": []
            }
            
            self.log_success(f"图片处理完成: {filename}")
            return photo_data
            
        except subprocess.CalledProcessError as e:
            self.log_error(f"图片处理失败: {e}")
            return None

    def load_albums(self) -> List[Dict[str, Any]]:
        """加载影集数据"""
        try:
            with open(self.project_albums_json, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def save_albums(self, albums: List[Dict[str, Any]]):
        """保存影集数据"""
        with open(self.project_albums_json, 'w', encoding='utf-8') as f:
            json.dump(albums, f, ensure_ascii=False, indent=2)

    def show_albums(self):
        """显示现有影集"""
        self.log_info("当前影集列表:")
        albums = self.load_albums()
        
        if not albums:
            self.log_warning("暂无影集")
            return
        
        for album in albums:
            print(f"  {album['id']} - {album['title']} ({album['category']}) - {album['photoCount']}张照片")
        print()

    def select_album(self) -> Optional[str]:
        """交互式选择影集"""
        albums = self.load_albums()
        
        if not albums:
            self.log_warning("没有现有影集，请先创建一个")
            return None
        
        print()
        self.log_info("请选择目标影集:")
        for i, album in enumerate(albums, 1):
            print(f"  {i}. {album['id']} - {album['title']} ({album['category']})")
        print()
        
        while True:
            try:
                choice = input(f"请输入选择 (1-{len(albums)}): ")
                index = int(choice) - 1
                if 0 <= index < len(albums):
                    return albums[index]['id']
                else:
                    self.log_error(f"无效选择，请输入 1-{len(albums)} 之间的数字")
            except (ValueError, KeyboardInterrupt):
                self.log_error("无效输入")
                return None

    def create_album(self) -> Optional[str]:
        """创建新影集"""
        self.log_step("创建新影集")
        
        try:
            # 获取基本信息
            album_id = input("影集ID (英文，用于URL): ").strip()
            if not album_id:
                self.log_error("影集ID不能为空")
                return None
            
            title = input("影集标题: ").strip()
            if not title:
                self.log_error("影集标题不能为空")
                return None
            
            description = input("影集描述 (可选): ").strip()
            
            # 选择分类
            print("\n可选分类:")
            for i, cat in enumerate(self.categories, 1):
                print(f"  {i}. {cat}")
            
            while True:
                try:
                    cat_choice = input(f"选择分类 (1-{len(self.categories)}): ")
                    cat_index = int(cat_choice) - 1
                    if 0 <= cat_index < len(self.categories):
                        category = self.categories[cat_index]
                        break
                    else:
                        self.log_error("无效选择")
                except ValueError:
                    self.log_error("请输入数字")
            
            location = input("拍摄地点 (可选): ").strip()
            
            featured_input = input("是否为精选影集? (y/N): ").strip().lower()
            featured = featured_input in ['y', 'yes']
            
            # 创建影集数据
            album_data = {
                "id": album_id,
                "title": title,
                "description": description,
                "coverImage": "",
                "category": category,
                "featured": featured,
                "location": location,
                "createdAt": datetime.now().strftime("%Y-%m-%d"),
                "photoCount": 0,
                "photos": []
            }
            
            # 保存到文件
            albums = self.load_albums()
            
            # 检查ID是否已存在
            if any(album['id'] == album_id for album in albums):
                self.log_error(f"影集ID '{album_id}' 已存在")
                return None
            
            albums.append(album_data)
            self.save_albums(albums)
            
            self.log_success(f"影集 '{title}' 创建成功")
            return album_id
            
        except KeyboardInterrupt:
            self.log_info("\n操作已取消")
            return None

    def add_photos_to_album(self, photos_path: str, album_id: str, is_directory: bool):
        """添加照片到影集"""
        self.log_step(f"添加照片到影集: {album_id}")
        
        albums = self.load_albums()
        album_index = None
        album = None
        
        # 找到目标影集
        for i, a in enumerate(albums):
            if a['id'] == album_id:
                album_index = i
                album = a
                break
        
        if album is None:
            self.log_error(f"影集不存在: {album_id}")
            return False
        
        # 获取图片路径列表
        image_paths = []
        if is_directory:
            photos_dir = Path(photos_path)
            if not photos_dir.exists():
                self.log_error(f"目录不存在: {photos_path}")
                return False
            
            for ext in ['*.jpg', '*.jpeg', '*.png', '*.webp', '*.tiff']:
                image_paths.extend(photos_dir.glob(ext))
                image_paths.extend(photos_dir.glob(ext.upper()))
        else:
            image_path = Path(photos_path)
            if image_path.exists():
                image_paths = [image_path]
            else:
                self.log_error(f"文件不存在: {photos_path}")
                return False
        
        if not image_paths:
            self.log_warning("未找到图片文件")
            return False
        
        # 处理图片
        processed_count = 0
        new_photos = []
        
        for image_path in image_paths:
            self.log_info(f"处理图片: {image_path.name}")
            photo_data = self.process_image(image_path, album['category'], album_id)
            
            if photo_data:
                new_photos.append(photo_data)
                processed_count += 1
        
        if processed_count == 0:
            self.log_warning("没有成功处理任何图片")
            return False
        
        # 更新影集数据
        album['photos'].extend(new_photos)
        album['photoCount'] = len(album['photos'])
        
        # 设置封面图片（如果还没有）
        if not album['coverImage'] and new_photos:
            album['coverImage'] = new_photos[0]['src']
        
        albums[album_index] = album
        self.save_albums(albums)
        
        self.log_success(f"成功处理 {processed_count} 张图片")
        return True

    def show_data_status(self):
        """显示数据状态"""
        self.log_step("当前数据状态")
        
        # 显示影集信息
        self.show_albums()
        
        # 显示图片文件统计
        print()
        self.log_info("图片文件统计:")
        
        dirs = self.get_directories()
        
        def count_images(directory: Path) -> int:
            if not directory.exists():
                return 0
            count = 0
            for ext in ['*.jpg', '*.jpeg', '*.png', '*.webp']:
                count += len(list(directory.glob(ext)))
                count += len(list(directory.glob(ext.upper())))
            return count
        
        travel_count = count_images(dirs['images_dir'] / "travel")
        cosplay_count = count_images(dirs['images_dir'] / "cosplay")
        detail_count = count_images(dirs['detail_dir'])
        original_count = count_images(dirs['original_dir'])
        thumb_travel_count = count_images(dirs['thumbnails_dir'] / "travel")
        thumb_cosplay_count = count_images(dirs['thumbnails_dir'] / "cosplay")
        
        print(f"  travel/ 展示图:     {travel_count} 张")
        print(f"  cosplay/ 展示图:    {cosplay_count} 张")
        print(f"  detail/ 详情图:     {detail_count} 张")
        print(f"  original/ 原图:     {original_count} 张")
        print(f"  thumbnails/travel/: {thumb_travel_count} 张")
        print(f"  thumbnails/cosplay/: {thumb_cosplay_count} 张")
        
        # 显示数据文件信息
        print()
        self.log_info("数据文件状态:")
        if dirs['albums_json'].exists():
            file_size = f"{dirs['albums_json'].stat().st_size / 1024:.1f}K"
            albums = self.load_albums()
            print(f"  albums.json: {file_size} ({len(albums)} 个影集)")
        else:
            print("  albums.json: 不存在")

    def start_local_preview(self):
        """启动本地预览服务"""
        self.log_step("启动本地预览服务...")
        
        # 检查 Node.js
        if not shutil.which('npm'):
            self.log_error("需要安装 Node.js 和 npm 来运行预览服务")
            print("请访问 https://nodejs.org/ 安装 Node.js")
            return
        
        # 切换到项目根目录
        os.chdir(self.project_root)
        
        # 检查依赖
        if not (self.project_root / "node_modules").exists():
            self.log_info("安装项目依赖...")
            subprocess.run(["npm", "install"], check=True)
        
        self.log_success("启动开发服务器...")
        self.log_info("预览地址: http://localhost:3000")
        self.log_info("按 Ctrl+C 停止服务")
        print()
        
        # 启动开发服务器
        try:
            subprocess.run(["npm", "run", "dev"], check=True)
        except KeyboardInterrupt:
            self.log_info("\n预览服务已停止")

    def main_menu(self):
        """主菜单"""
        self.log_step("ImgHub 图片管理工具")
        self.log_info("请选择操作:")
        
        print("\n" + "="*50)
        print("📋 操作选项:")
        print("  1. 添加图片到现有影集")
        print("  2. 创建新影集并添加图片")
        print("  3. 查看数据状态")
        print("  4. 启动本地预览")
        print("  5. 退出")
        print("="*50)
        
        try:
            choice = input("\n请选择 (1-5): ").strip()
            
            if choice == '1':
                self.add_photos_interactive()
            elif choice == '2':
                self.create_new_album_interactive()
            elif choice == '3':
                self.show_data_status()
            elif choice == '4':
                self.start_local_preview()
            elif choice == '5':
                self.log_info("退出程序")
                return
            else:
                self.log_warning("无效选择")
                self.main_menu()
        except KeyboardInterrupt:
            self.log_info("\n操作已取消")

    def add_photos_interactive(self) -> bool:
        """交互式添加图片到现有影集"""
        self.init_directories()
        album_id = self.select_album()
        if album_id:
            photos_path = input("图片路径 (文件或目录): ").strip()
            is_directory = Path(photos_path).is_dir()
            
            if self.add_photos_to_album(photos_path, album_id, is_directory):
                self.log_success("图片已添加到影集")
                return True
        return False
    
    def create_new_album_interactive(self) -> bool:
        """交互式创建新影集并添加图片"""
        self.init_directories()
        album_id = self.create_album()
        if album_id:
            photos_path = input("图片路径 (文件或目录): ").strip()
            is_directory = Path(photos_path).is_dir()
            
            if self.add_photos_to_album(photos_path, album_id, is_directory):
                self.log_success("新影集已创建，图片已处理")
                return True
        return False

    def show_help(self):
        """显示帮助信息"""
        print(f"""
{Colors.CYAN}ImgHub 图片管理工具 v5.0.0{Colors.NC}
{Colors.YELLOW}专注于图片处理和影集管理的本地工具{Colors.NC}

{Colors.GREEN}命令说明:{Colors.NC}
  {Colors.BLUE}menu{Colors.NC}          - 显示交互菜单（默认）
  {Colors.BLUE}add{Colors.NC}           - 添加图片到现有影集
  {Colors.BLUE}create{Colors.NC}        - 创建新影集并添加图片
  {Colors.BLUE}status{Colors.NC}        - 查看数据状态（影集和图片统计）
  {Colors.BLUE}preview{Colors.NC}       - 启动本地预览服务器
  {Colors.BLUE}help{Colors.NC}          - 显示此帮助信息

{Colors.GREEN}使用示例:{Colors.NC}
  python3 scripts/img-manager.py                    # 交互菜单
  python3 scripts/img-manager.py add                # 添加图片到现有影集
  python3 scripts/img-manager.py create             # 创建新影集
  python3 scripts/img-manager.py status             # 查看状态
  python3 scripts/img-manager.py preview            # 启动本地预览

{Colors.GREEN}功能特点:{Colors.NC}
  • 🖼️  智能图片处理 - 自动生成4种尺寸图片
  • 📁 项目目录管理 - 直接在项目目录处理图片
  • 🎯 简化操作流程 - 专注于核心图片处理功能
  • 📊 完整数据管理 - 自动更新albums.json

{Colors.GREEN}图片处理:{Colors.NC}
  • 缩略图: 400px 等比缩放，75% 质量
  • 显示图: 800px 等比缩放，85% 质量  
  • 详情图: 900px 等比缩放，90% 质量
  • 原图: 完整保存，无压缩

{Colors.GREEN}目录结构:{Colors.NC}
  ./public/
    ├── albums.json       # 影集数据文件
    └── images/          # 图片文件
        ├── travel/      # 旅行分类显示图
        ├── cosplay/     # Cosplay分类显示图
        ├── detail/      # 详情图(900px)
        ├── original/    # 原图
        └── thumbnails/  # 缩略图
            ├── travel/
            └── cosplay/

{Colors.GREEN}依赖要求:{Colors.NC}
  • Python 3.6+
  • ImageMagick (convert, identify)
  • ExifTool
  • Node.js & npm (用于本地预览)
""")

    def main(self):
        """主函数"""
        parser = argparse.ArgumentParser(description="ImgHub 图片管理工具")
        parser.add_argument('command', nargs='?', choices=[
            'menu', 'add', 'create', 'status', 'preview', 'help'
        ], default='menu', help='命令')
        
        args = parser.parse_args()
        
        if args.command == 'help':
            self.show_help()
        elif args.command == 'menu':
            if not self.check_dependencies():
                sys.exit(1)
            self.main_menu()
        elif args.command == 'add':
            if not self.check_dependencies():
                sys.exit(1)
            self.add_photos_interactive()
        elif args.command == 'create':
            if not self.check_dependencies():
                sys.exit(1)
            self.create_new_album_interactive()
        elif args.command == 'status':
            self.init_directories()
            self.show_data_status()
        elif args.command == 'preview':
            self.start_local_preview()

if __name__ == "__main__":
    manager = ImgManager()
    manager.main()

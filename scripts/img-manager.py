#!/usr/bin/env python3
"""
ImgHub 增强图片管理工具 (Enhanced版本)
集成图片处理、影集管理、临时存储、直接ECS上传的完整解决方案
版本: 4.0.0
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

class ImgManagerEnhanced:
    def __init__(self):
        # 基础配置
        self.script_dir = Path(__file__).parent
        self.project_root = self.script_dir.parent
        
        # 临时工作目录 - 不影响项目public文件夹
        self.work_dir = Path.home() / ".img-hub-workspace"
        self.work_dir.mkdir(exist_ok=True)
        
        # 临时目录结构（用于本地测试）
        self.temp_albums_json = self.work_dir / "albums.json"
        self.temp_images_dir = self.work_dir / "images"
        self.temp_original_dir = self.temp_images_dir / "original"
        self.temp_thumbnails_dir = self.temp_images_dir / "thumbnails"
        self.temp_detail_dir = self.temp_images_dir / "detail"
        
        # 项目原始目录（仅用于直接上传模式）
        self.project_albums_json = self.project_root / "public" / "albums.json"
        self.project_images_dir = self.project_root / "public" / "images"
        
        # ECS配置文件
        self.deploy_config_file = self.project_root / ".env.deploy"
        
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
        
        # 当前工作模式
        self.current_mode = "local_test"  # local_test 或 direct_upload

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

    def get_active_directories(self):
        """根据当前模式获取活动目录"""
        if self.current_mode == "direct_upload":
            return {
                'albums_json': self.project_albums_json,
                'images_dir': self.project_images_dir,
                'original_dir': self.project_images_dir / "original",
                'thumbnails_dir': self.project_images_dir / "thumbnails",
                'detail_dir': self.project_images_dir / "detail"
            }
        else:  # local_test
            return {
                'albums_json': self.temp_albums_json,
                'images_dir': self.temp_images_dir,
                'original_dir': self.temp_original_dir,
                'thumbnails_dir': self.temp_thumbnails_dir,
                'detail_dir': self.temp_detail_dir
            }

    def init_directories(self):
        """初始化目录结构"""
        self.log_step("初始化目录结构...")
        
        dirs = self.get_active_directories()
        
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
        
        mode_name = "项目目录" if self.current_mode == "direct_upload" else "临时工作目录"
        self.log_success(f"目录结构初始化完成 ({mode_name})")

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
        """生成正方形缩略图"""
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        cmd = [
            "convert", str(input_file),
            "-resize", f"{self.thumbnail_size}x{self.thumbnail_size}^",
            "-gravity", "center",
            "-extent", f"{self.thumbnail_size}x{self.thumbnail_size}",
            "-quality", str(self.thumbnail_quality),
            "-strip",
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
        
        dirs = self.get_active_directories()
        
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
            
            mode_info = f"({'项目目录' if self.current_mode == 'direct_upload' else '临时目录'})"
            self.log_success(f"图片处理完成: {filename} {mode_info}")
            return photo_data
            
        except subprocess.CalledProcessError as e:
            self.log_error(f"图片处理失败: {e}")
            return None

    def load_albums(self) -> List[Dict[str, Any]]:
        """加载影集数据"""
        dirs = self.get_active_directories()
        try:
            with open(dirs['albums_json'], 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def save_albums(self, albums: List[Dict[str, Any]]):
        """保存影集数据"""
        dirs = self.get_active_directories()
        with open(dirs['albums_json'], 'w', encoding='utf-8') as f:
            json.dump(albums, f, ensure_ascii=False, indent=2)

    def show_albums(self):
        """显示现有影集"""
        mode_info = "项目目录" if self.current_mode == "direct_upload" else "临时目录"
        self.log_info(f"当前影集列表 ({mode_info}):")
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
            
            mode_info = f"({'项目目录' if self.current_mode == 'direct_upload' else '临时目录'})"
            self.log_success(f"影集 '{title}' 创建成功 {mode_info}")
            return album_id
            
        except KeyboardInterrupt:
            self.log_info("\n操作已取消")
            return None

    def add_photos_to_album(self, photos_path: str, album_id: str, is_directory: bool):
        """添加照片到影集"""
        mode_info = f"({'项目目录' if self.current_mode == 'direct_upload' else '临时目录'})"
        self.log_step(f"添加照片到影集: {album_id} {mode_info}")
        
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
        mode_info = "项目目录" if self.current_mode == "direct_upload" else "临时目录"
        self.log_step(f"当前数据状态 ({mode_info})")
        
        # 显示影集信息
        self.show_albums()
        
        # 显示图片文件统计
        print()
        self.log_info("图片文件统计:")
        
        dirs = self.get_active_directories()
        
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
        
        # 如果是临时目录模式，需要先复制数据到项目目录
        if self.current_mode == "local_test":
            self.copy_temp_to_project()
        
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

    def copy_temp_to_project(self):
        """将临时目录的数据复制到项目目录（用于预览）"""
        self.log_step("复制临时数据到项目目录...")
        
        # 复制albums.json
        if self.temp_albums_json.exists():
            shutil.copy2(self.temp_albums_json, self.project_albums_json)
        
        # 复制images目录
        if self.temp_images_dir.exists():
            if self.project_images_dir.exists():
                shutil.rmtree(self.project_images_dir)
            shutil.copytree(self.temp_images_dir, self.project_images_dir)
        
        self.log_success("临时数据已复制到项目目录")

    def cleanup_project_data(self):
        """清理项目目录中的测试数据"""
        self.log_step("清理项目目录...")
        
        try:
            # 恢复原始albums.json
            if self.project_albums_json.exists():
                with open(self.project_albums_json, 'w', encoding='utf-8') as f:
                    json.dump([], f, ensure_ascii=False, indent=2)
            
            # 清理images目录中的测试图片
            if self.project_images_dir.exists():
                for category in self.categories:
                    cat_dir = self.project_images_dir / category
                    if cat_dir.exists():
                        shutil.rmtree(cat_dir)
                        cat_dir.mkdir(exist_ok=True)
                
                # 清理其他目录
                for subdir in ["detail", "original"]:
                    sub_path = self.project_images_dir / subdir
                    if sub_path.exists():
                        shutil.rmtree(sub_path)
                        sub_path.mkdir(exist_ok=True)
                
                # 清理thumbnails
                thumb_dir = self.project_images_dir / "thumbnails"
                if thumb_dir.exists():
                    shutil.rmtree(thumb_dir)
                    thumb_dir.mkdir(exist_ok=True)
                    for category in self.categories:
                        (thumb_dir / category).mkdir(exist_ok=True)
            
            self.log_success("项目目录已清理")
        except Exception as e:
            self.log_error(f"清理失败: {e}")

    def main_menu(self):
        """主菜单"""
        self.log_step("ImgHub 增强图片管理工具")
        self.log_info("请选择操作模式:")
        
        print("\n" + "="*50)
        print("📋 操作模式:")
        print("  1. 本地测试模式 (临时目录，不影响项目)")
        print("  2. 直接上传模式 (处理后快速上传图片数据)")
        print("  3. 查看数据状态")
        print("  4. 启动本地预览")
        print("  5. 清理项目目录")
        print("  6. ECS配置管理")
        print("  7. 退出")
        print("="*50)
        
        try:
            choice = input("\n请选择 (1-7): ").strip()
            
            if choice == '1':
                self.current_mode = "local_test"
                self.local_test_mode()
            elif choice == '2':
                self.current_mode = "direct_upload"
                self.direct_upload_mode()
            elif choice == '3':
                self.show_status_menu()
            elif choice == '4':
                self.start_local_preview()
            elif choice == '5':
                confirm = input("确定要清理项目目录吗？(y/N): ").strip().lower()
                if confirm in ['y', 'yes']:
                    self.cleanup_project_data()
            elif choice == '6':
                self.ecs_config_menu()
            elif choice == '7':
                self.log_info("退出程序")
                return
            else:
                self.log_warning("无效选择")
                self.main_menu()
        except KeyboardInterrupt:
            self.log_info("\n操作已取消")

    def show_status_menu(self):
        """显示状态菜单"""
        print("\n" + "="*50)
        print("📊 数据状态:")
        print("  1. 临时目录状态")
        print("  2. 项目目录状态")
        print("  3. 返回主菜单")
        print("="*50)
        
        try:
            choice = input("\n请选择 (1-3): ").strip()
            
            if choice == '1':
                self.current_mode = "local_test"
                self.init_directories()
                self.show_data_status()
            elif choice == '2':
                self.current_mode = "direct_upload"
                self.init_directories()
                self.show_data_status()
            elif choice == '3':
                self.main_menu()
            else:
                self.log_warning("无效选择")
                self.show_status_menu()
        except KeyboardInterrupt:
            self.log_info("\n操作已取消")

    def local_test_mode(self):
        """本地测试模式"""
        self.init_directories()
        self.log_step("本地测试模式 (临时目录)")
        self.log_info(f"工作目录: {self.work_dir}")
        self.log_info("此模式在临时目录处理图片，不影响项目public文件夹")
        
        # 显示当前影集
        self.show_albums()
        
        print()
        self.log_info("请选择测试操作:")
        print("  1. 添加图片到现有影集")
        print("  2. 创建新影集并添加图片")
        print("  3. 启动本地预览服务")
        print("  4. 复制数据到项目目录")
        print("  5. 上传到ECS（完整部署）")
        print("  6. 仅上传图片数据到ECS")
        print("  7. 返回主菜单")
        print()
        
        try:
            choice = input("请选择 (1-7): ").strip()
            
            if choice == '1':
                self.add_photos_interactive()
            elif choice == '2':
                self.create_new_album_interactive()
            elif choice == '3':
                self.start_local_preview()
            elif choice == '4':
                self.copy_temp_to_project()
                self.log_success("数据已复制到项目目录")
            elif choice == '5':
                self.upload_temp_to_ecs()
            elif choice == '6':
                # 先复制到项目目录，然后仅上传数据
                self.copy_temp_to_project()
                if self.check_deploy_dependencies():
                    self.upload_data_only_to_ecs()
                else:
                    self.log_error("部署依赖缺失，无法上传")
            elif choice == '7':
                self.main_menu()
            else:
                self.log_warning("无效选择")
                self.local_test_mode()
        except KeyboardInterrupt:
            self.log_info("\n操作已取消")

    def direct_upload_mode(self):
        """直接上传模式"""
        self.init_directories()
        self.log_step("直接上传模式 (项目目录)")
        self.log_info("此模式直接在项目目录处理图片，支持快速上传图片数据到ECS")
        
        # 显示当前影集
        self.show_albums()
        
        print()
        self.log_info("请选择操作:")
        print("  1. 添加图片到现有影集")
        print("  2. 创建新影集并添加图片")
        print("  3. 上传图片数据到ECS（推荐）")
        print("  4. 完整部署到ECS（代码更新时使用）")
        print("  5. 启动本地预览")
        print("  6. 返回主菜单")
        print()
        
        try:
            choice = input("请选择 (1-6): ").strip()
            
            if choice == '1':
                if self.add_photos_interactive():
                    self.ask_immediate_upload()
            elif choice == '2':
                if self.create_new_album_interactive():
                    self.ask_immediate_upload()
            elif choice == '3':
                if self.check_deploy_dependencies():
                    self.upload_data_only_to_ecs()
                else:
                    self.log_error("部署依赖缺失，无法上传")
            elif choice == '4':
                if self.check_deploy_dependencies():
                    self.deploy_to_ecs()
                else:
                    self.log_error("部署依赖缺失，无法上传")
            elif choice == '5':
                self.start_local_preview()
            elif choice == '6':
                self.main_menu()
            else:
                self.log_warning("无效选择")
                self.direct_upload_mode()
        except KeyboardInterrupt:
            self.log_info("\n操作已取消")

    def ask_immediate_upload(self):
        """询问是否立即上传"""
        print()
        try:
            print("选择上传方式:")
            print("  1. 仅上传图片数据（推荐，快速更新）")
            print("  2. 完整部署（代码+数据+重启容器）")
            print("  3. 跳过上传")
            
            choice = input("请选择 (1-3): ").strip()
            
            if choice == '1':
                if self.check_deploy_dependencies():
                    self.upload_data_only_to_ecs()
                else:
                    self.log_error("部署依赖缺失，无法上传")
            elif choice == '2':
                if self.check_deploy_dependencies():
                    self.deploy_to_ecs()
                else:
                    self.log_error("部署依赖缺失，无法上传")
            elif choice == '3':
                self.log_info("跳过上传")
            else:
                self.log_warning("无效选择，跳过上传")
        except KeyboardInterrupt:
            self.log_info("\n操作已取消")

    def upload_temp_to_ecs(self):
        """上传临时目录数据到ECS"""
        self.log_step("上传临时目录数据到ECS...")
        
        # 先复制到项目目录
        self.copy_temp_to_project()
        
        # 然后部署到ECS
        if self.check_deploy_dependencies():
            self.deploy_to_ecs()
        else:
            self.log_error("部署依赖缺失，无法上传")

    def upload_data_only_to_ecs(self):
        """仅上传图片和数据文件到ECS（不重启镜像）"""
        try:
            # 加载ECS配置
            config = self.load_deploy_config()
            if not config.get('ECS_HOST'):
                config = self.interactive_ecs_config()
            
            self.log_step("仅上传图片和数据文件到ECS...")
            self.log_info("当前ECS配置:")
            self.log_info(f"  主机: {config.get('ECS_HOST')}")
            self.log_info(f"  用户: {config.get('ECS_USER')}")
            self.log_info(f"  路径: {config.get('DEPLOY_PATH')}")
            
            # 检查连接
            if not self.check_ecs_connection(config):
                return False
            
            # 上传图片文件
            if not self.sync_images_to_ecs(config):
                return False
            
            # 上传albums.json
            if not self.sync_albums_json_to_ecs(config):
                return False
            
            self.log_success("🎉 图片和数据文件上传完成！")
            self.log_info("容器会自动读取新的数据文件，无需重启")
            return True
            
        except KeyboardInterrupt:
            self.log_info("\n上传已取消")
            return False
        except Exception as e:
            self.log_error(f"上传过程出错: {e}")
            return False

    def sync_images_to_ecs(self, config: dict) -> bool:
        """同步图片文件到ECS"""
        self.log_step("同步图片文件到ECS...")
        
        try:
            # 构建rsync命令 - 只同步图片目录
            rsync_cmd = ['rsync', '-avz', '--progress']
            
            if config.get('SSH_KEY'):
                rsync_cmd.extend(['-e', f"ssh -i {config['SSH_KEY']}"])
            
            # 源路径：项目的images目录
            source = str(self.project_images_dir) + "/"
            # 目标路径：ECS上的images目录
            target = f"{config['ECS_USER']}@{config['ECS_HOST']}:{config['DEPLOY_PATH']}/public/images/"
            
            rsync_cmd.extend([source, target])
            
            self.log_info("同步图片文件到ECS...")
            self.log_info(f"命令: {' '.join(rsync_cmd)}")
            
            result = subprocess.run(rsync_cmd)
            if result.returncode == 0:
                self.log_success("图片文件同步完成")
                return True
            else:
                self.log_error("图片文件同步失败")
                return False
                
        except Exception as e:
            self.log_error(f"图片同步过程出错: {e}")
            return False

    def sync_albums_json_to_ecs(self, config: dict) -> bool:
        """同步albums.json到ECS"""
        self.log_step("同步albums.json到ECS...")
        
        try:
            # 构建rsync命令 - 只同步albums.json
            rsync_cmd = ['rsync', '-avz', '--progress']
            
            if config.get('SSH_KEY'):
                rsync_cmd.extend(['-e', f"ssh -i {config['SSH_KEY']}"])
            
            # 源路径：项目的albums.json
            source = str(self.project_albums_json)
            # 目标路径：ECS上的albums.json
            target = f"{config['ECS_USER']}@{config['ECS_HOST']}:{config['DEPLOY_PATH']}/public/albums.json"
            
            rsync_cmd.extend([source, target])
            
            self.log_info("同步albums.json到ECS...")
            self.log_info(f"命令: {' '.join(rsync_cmd)}")
            
            result = subprocess.run(rsync_cmd)
            if result.returncode == 0:
                self.log_success("albums.json同步完成")
                return True
            else:
                self.log_error("albums.json同步失败")
                return False
                
        except Exception as e:
            self.log_error(f"albums.json同步过程出错: {e}")
            return False

    def add_photos_interactive(self) -> bool:
        """交互式添加图片到现有影集"""
        album_id = self.select_album()
        if album_id:
            photos_path = input("图片路径 (文件或目录): ").strip()
            is_directory = Path(photos_path).is_dir()
            
            if self.add_photos_to_album(photos_path, album_id, is_directory):
                mode_info = f"({'项目目录' if self.current_mode == 'direct_upload' else '临时目录'})"
                self.log_success(f"图片已添加到影集，数据已更新到{mode_info}")
                return True
        return False
    
    def create_new_album_interactive(self) -> bool:
        """交互式创建新影集并添加图片"""
        album_id = self.create_album()
        if album_id:
            photos_path = input("图片路径 (文件或目录): ").strip()
            is_directory = Path(photos_path).is_dir()
            
            if self.add_photos_to_album(photos_path, album_id, is_directory):
                mode_info = f"({'项目目录' if self.current_mode == 'direct_upload' else '临时目录'})"
                self.log_success(f"新影集已创建，图片已处理，数据已保存到{mode_info}")
                return True
        return False

    def ecs_config_menu(self):
        """ECS配置管理菜单"""
        print("\n" + "="*50)
        print("⚙️ ECS配置管理:")
        print("  1. 查看当前配置")
        print("  2. 重新配置ECS")
        print("  3. 测试ECS连接")
        print("  4. 返回主菜单")
        print("="*50)
        
        try:
            choice = input("\n请选择 (1-4): ").strip()
            
            if choice == '1':
                self.show_ecs_config()
            elif choice == '2':
                self.interactive_ecs_config()
            elif choice == '3':
                if self.check_deploy_dependencies():
                    config = self.load_deploy_config()
                    if config.get('ECS_HOST'):
                        self.check_ecs_connection(config)
                    else:
                        self.log_error("请先配置ECS信息")
                else:
                    self.log_error("部署依赖缺失")
            elif choice == '4':
                self.main_menu()
            else:
                self.log_warning("无效选择")
                self.ecs_config_menu()
        except KeyboardInterrupt:
            self.log_info("\n操作已取消")

    def show_ecs_config(self):
        """显示ECS配置"""
        config = self.load_deploy_config()
        if not config:
            self.log_warning("未找到ECS配置")
            return
        
        self.log_info("当前ECS配置:")
        for key, value in config.items():
            if key in ['SSH_KEY']:
                print(f"  {key}: {'已设置' if value else '未设置'}")
            else:
                print(f"  {key}: {value}")

    # ==================== ECS 部署功能 ====================
    
    def load_deploy_config(self) -> Dict[str, str]:
        """加载ECS部署配置"""
        config = {}
        if self.deploy_config_file.exists():
            try:
                with open(self.deploy_config_file, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            key, value = line.split('=', 1)
                            config[key.strip()] = value.strip().strip('"\'')
            except Exception as e:
                self.log_warning(f"读取配置文件失败: {e}")
        return config
    
    def save_deploy_config(self, config: Dict[str, str]):
        """保存ECS部署配置"""
        try:
            with open(self.deploy_config_file, 'w', encoding='utf-8') as f:
                f.write("# ImgHub ECS 部署配置\n")
                for key, value in config.items():
                    f.write(f'{key}="{value}"\n')
            self.log_success(f"配置已保存到 {self.deploy_config_file}")
        except Exception as e:
            self.log_error(f"保存配置文件失败: {e}")
    
    def interactive_ecs_config(self) -> Dict[str, str]:
        """交互式ECS配置"""
        self.log_step("ECS 部署配置")
        config = self.load_deploy_config()
        
        # ECS连接信息
        if not config.get('ECS_HOST'):
            config['ECS_HOST'] = input("ECS 主机地址 (IP或域名): ").strip()
        
        if not config.get('ECS_USER'):
            user = input("ECS 用户名 [root]: ").strip()
            config['ECS_USER'] = user if user else 'root'
        
        if not config.get('SSH_KEY'):
            ssh_key = input("SSH 私钥路径 (可选): ").strip()
            if ssh_key:
                config['SSH_KEY'] = ssh_key
        
        if not config.get('DEPLOY_PATH'):
            path = input("ECS 部署路径 [/opt/img-hub]: ").strip()
            config['DEPLOY_PATH'] = path if path else '/opt/img-hub'
        
        # 保存配置
        self.save_deploy_config(config)
        return config
    
    def ssh_exec(self, command: str, config: Dict[str, str]) -> bool:
        """执行SSH命令"""
        try:
            ssh_cmd = ['ssh']
            if config.get('SSH_KEY'):
                ssh_cmd.extend(['-i', config['SSH_KEY']])
            ssh_cmd.append(f"{config['ECS_USER']}@{config['ECS_HOST']}")
            ssh_cmd.append(command)
            
            result = subprocess.run(ssh_cmd, capture_output=True, text=True)
            if result.returncode != 0:
                self.log_error(f"SSH命令执行失败: {result.stderr}")
                return False
            return True
        except Exception as e:
            self.log_error(f"SSH连接失败: {e}")
            return False
    
    def check_ecs_connection(self, config: Dict[str, str]) -> bool:
        """检查ECS连接"""
        self.log_step("检查ECS连接...")
        if self.ssh_exec("echo 'ECS连接测试成功'", config):
            self.log_success("ECS连接正常")
            return True
        else:
            self.log_error("无法连接到ECS，请检查配置")
            return False
    
    def sync_to_ecs(self, config: Dict[str, str]) -> bool:
        """同步源码到ECS进行远程构建"""
        self.log_step("同步源码到ECS...")
        
        try:
            # 检查本地数据
            if not self.project_albums_json.exists():
                self.log_warning("本地albums.json不存在，创建空文件")
                self.project_albums_json.write_text("[]", encoding='utf-8')
            
            # 构建rsync命令 - 同步整个项目
            rsync_cmd = ['rsync', '-avz', '--progress', '--delete']
            
            # 排除不需要的文件
            rsync_cmd.extend([
                '--exclude=.git',
                '--exclude=node_modules',
                '--exclude=.next',
                '--exclude=out',
                '--exclude=*.log',
                '--exclude=.DS_Store',
                '--exclude=.img-hub-workspace',  # 排除临时工作目录
                '--exclude=public/images/',      # 排除图片文件（ECS上独立管理）
                '--exclude=public/albums.json'   # 排除数据文件（ECS上独立管理）
            ])
            
            if config.get('SSH_KEY'):
                rsync_cmd.extend(['-e', f"ssh -i {config['SSH_KEY']}"])
            
            # 源路径：整个项目目录
            source = str(self.project_root) + "/"
            # 目标路径：ECS上的部署目录
            target = f"{config['ECS_USER']}@{config['ECS_HOST']}:{config['DEPLOY_PATH']}/"
            
            rsync_cmd.extend([source, target])
            
            self.log_info("同步项目源码到ECS...")
            self.log_info(f"命令: {' '.join(rsync_cmd)}")
            
            result = subprocess.run(rsync_cmd)
            if result.returncode == 0:
                self.log_success("源码同步完成")
                return True
            else:
                self.log_error("源码同步失败")
                return False
                
        except Exception as e:
            self.log_error(f"同步过程出错: {e}")
            return False
    
    def build_on_ecs(self, config: Dict[str, str]) -> bool:
        """在ECS上构建Docker镜像"""
        self.log_step("在ECS上构建Docker镜像...")
        
        build_command = f"""
            cd {config['DEPLOY_PATH']} && \\
            echo "清理旧镜像..." && \\
            docker rmi img-hub:latest 2>/dev/null || true && \\
            echo "开始构建Docker镜像..." && \\
            docker build --no-cache -t img-hub:latest . && \\
            echo "构建完成"
        """
        
        if self.ssh_exec(build_command, config):
            self.log_success("Docker镜像构建完成")
            return True
        else:
            self.log_error("Docker镜像构建失败")
            return False
    
    def restart_ecs_service(self, config: Dict[str, str]) -> bool:
        """重启ECS上的服务"""
        self.log_step("启动/重启ECS服务...")
        
        # 更新docker-compose.yml中的镜像名称，然后重启服务
        restart_command = f"""
            cd {config['DEPLOY_PATH']} && \\
            sed -i 's|image:.*|image: img-hub:latest|' docker-compose.yml && \\
            docker-compose down && \\
            docker-compose up -d --force-recreate && \\
            echo "服务启动完成"
        """
        
        if self.ssh_exec(restart_command, config):
            self.log_success("服务启动完成")
            return True
        else:
            self.log_error("服务启动失败")
            return False
    
    def check_ecs_docker(self, config: Dict[str, str]) -> bool:
        """检查ECS上的Docker环境"""
        self.log_step("检查ECS Docker环境...")
        
        docker_check_command = """
            if command -v docker >/dev/null 2>&1 && command -v docker-compose >/dev/null 2>&1; then
                echo "Docker环境检查通过"
                docker --version
                docker-compose --version
            else
                echo "Docker环境不完整"
                exit 1
            fi
        """
        
        if self.ssh_exec(docker_check_command, config):
            self.log_success("ECS Docker环境正常")
            return True
        else:
            self.log_error("ECS上Docker环境不完整")
            self.log_info("请在ECS上安装Docker和Docker Compose")
            return False
    
    def prepare_ecs_structure(self, config: Dict[str, str]) -> bool:
        """准备ECS目录结构"""
        self.log_step("准备ECS目录结构...")
        
        prepare_command = f"""
            mkdir -p {config['DEPLOY_PATH']} && \\
            echo "ECS目录结构准备完成"
        """
        
        if self.ssh_exec(prepare_command, config):
            self.log_success("ECS目录结构准备完成")
            return True
        else:
            self.log_error("ECS目录结构准备失败")
            return False

    def deploy_to_ecs(self):
        """部署到ECS的完整流程（远程构建方案）"""
        try:
            # 加载或配置ECS信息
            config = self.load_deploy_config()
            if not config.get('ECS_HOST'):
                config = self.interactive_ecs_config()
            
            # 显示配置信息
            self.log_info("当前ECS配置:")
            self.log_info(f"  主机: {config.get('ECS_HOST')}")
            self.log_info(f"  用户: {config.get('ECS_USER')}")
            self.log_info(f"  路径: {config.get('DEPLOY_PATH')}")
            self.log_info("  方案: ECS远程构建")
            
            # 检查连接
            if not self.check_ecs_connection(config):
                return False
            
            # 检查ECS Docker环境
            if not self.check_ecs_docker(config):
                return False
            
            # 准备ECS目录结构
            if not self.prepare_ecs_structure(config):
                return False
            
            # 同步源码到ECS
            if not self.sync_to_ecs(config):
                return False
            
            # 在ECS上构建镜像
            if not self.build_on_ecs(config):
                return False
            
            # 启动服务
            if not self.restart_ecs_service(config):
                return False
            
            self.log_success("🎉 ECS远程构建部署完成！")
            self.log_info(f"访问地址: http://{config['ECS_HOST']}")
            return True
            
        except KeyboardInterrupt:
            self.log_info("\n部署已取消")
            return False
        except Exception as e:
            self.log_error(f"部署过程出错: {e}")
            return False

    def check_deploy_dependencies(self) -> bool:
        """检查部署相关依赖"""
        deps = ["rsync"]
        missing = []
        
        for dep in deps:
            try:
                subprocess.run([dep, '--version'], capture_output=True, check=True)
            except (subprocess.CalledProcessError, FileNotFoundError):
                missing.append(dep)
        
        if missing:
            self.log_error(f"缺少部署依赖: {', '.join(missing)}")
            self.log_info("请安装缺少的依赖:")
            self.log_info("macOS: brew install rsync openssh")
            self.log_info("Ubuntu: sudo apt install rsync openssh-client")
            return False
        
        return True

    def show_help(self):
        """显示帮助信息"""
        print(f"""
{Colors.CYAN}ImgHub 增强图片管理工具 v4.0.0{Colors.NC}
{Colors.YELLOW}Enhanced版本 - 临时目录 + 直接上传 + 项目目录保护{Colors.NC}

{Colors.GREEN}命令说明:{Colors.NC}
  {Colors.BLUE}menu{Colors.NC}          - 显示交互菜单（默认）
  {Colors.BLUE}local-test{Colors.NC}    - 本地测试模式，在临时目录处理图片
  {Colors.BLUE}direct-upload{Colors.NC} - 直接上传模式，在项目目录处理并立即上传
  {Colors.BLUE}local-preview{Colors.NC} - 启动本地预览服务器
  {Colors.BLUE}status{Colors.NC}        - 查看数据状态（影集和图片统计）
  {Colors.BLUE}deploy{Colors.NC}        - 部署到ECS（同步代码+构建+重启）
  {Colors.BLUE}upload-data{Colors.NC}   - 仅上传图片和数据文件到ECS（不重启容器）
  {Colors.BLUE}ecs-config{Colors.NC}    - 配置ECS连接信息
  {Colors.BLUE}help{Colors.NC}          - 显示此帮助信息

{Colors.GREEN}使用示例:{Colors.NC}
  python3 scripts/img-manager.py                    # 交互菜单
  python3 scripts/img-manager.py local-test         # 本地测试模式
  python3 scripts/img-manager.py deploy             # 完整部署到ECS
  python3 scripts/img-manager.py upload-data        # 仅上传图片数据
  python3 scripts/img-manager.py status             # 查看状态

{Colors.GREEN}功能特点:{Colors.NC}
  • 🛡️  临时目录模式 - 不影响项目public文件夹
  • 🚀 直接上传模式 - 处理后立即上传到ECS
  • 📁 智能目录管理 - 自动切换工作目录
  • 🎯 便捷操作流程 - 一站式图片处理和部署
  • 🔄 自动更新albums.json - 图片上传时自动更新数据文件

{Colors.GREEN}操作模式详解:{Colors.NC}
  {Colors.BLUE}本地测试模式{Colors.NC} - 在~/.img-hub-workspace/临时目录处理图片
    ├── 创建新影集或添加照片到现有影集
    ├── 自动生成4种尺寸图片（缩略图、显示图、详情图、原图）
    ├── 提取EXIF信息和生成图片元数据
    └── 可选择上传到ECS或本地预览

  {Colors.BLUE}直接上传模式{Colors.NC} - 在项目public/目录直接处理图片
    ├── 直接在项目目录生成图片文件
    ├── 更新项目的albums.json文件
    ├── 默认仅上传图片数据（推荐，快速生效）
    └── 可选择完整部署（代码更新时使用）

  {Colors.BLUE}ECS部署流程{Colors.NC} - 代码同步、Docker构建、服务重启
    ├── rsync同步项目代码（排除数据文件）
    ├── 远程构建Docker镜像（强制清除缓存）
    └── 重启Docker容器（强制重建）

{Colors.GREEN}目录结构:{Colors.NC}
  临时目录: ~/.img-hub-workspace/
    ├── albums.json        # 临时影集数据
    ├── images/           # 临时图片文件
    │   ├── original/     # 原图
    │   ├── detail/       # 详情图(900px)
    │   └── thumbnails/   # 缩略图(400px)
    └── [category]/       # 显示图(800px)

  项目目录: ./public/
    ├── albums.json       # 项目影集数据
    └── images/          # 项目图片文件

{Colors.GREEN}典型工作流程:{Colors.NC}
  {Colors.BLUE}开发测试:{Colors.NC} local-test → local-preview → 确认效果 → upload-data
  {Colors.BLUE}图片快传:{Colors.NC} direct-upload → upload-data → 立即生效（推荐）
  {Colors.BLUE}代码部署:{Colors.NC} 代码更新后 → deploy → 重启生效

{Colors.GREEN}依赖要求:{Colors.NC}
  • 本地: Python 3.6+, ImageMagick, ExifTool, rsync, ssh
  • ECS: Docker, Docker Compose
""")

    def main(self):
        """主函数"""
        parser = argparse.ArgumentParser(description="ImgHub 增强图片管理工具")
        parser.add_argument('command', nargs='?', choices=[
            'menu', 'local-test', 'direct-upload', 'local-preview', 'status', 'deploy', 'upload-data', 'ecs-config', 'help'
        ], default='menu', help='命令')
        
        args = parser.parse_args()
        
        if args.command == 'help':
            self.show_help()
        elif args.command == 'menu':
            if not self.check_dependencies():
                sys.exit(1)
            self.main_menu()
        elif args.command == 'local-test':
            if not self.check_dependencies():
                sys.exit(1)
            self.current_mode = "local_test"
            self.local_test_mode()
        elif args.command == 'direct-upload':
            if not self.check_dependencies():
                sys.exit(1)
            self.current_mode = "direct_upload"
            self.direct_upload_mode()
        elif args.command == 'status':
            self.show_status_menu()
        elif args.command == 'local-preview':
            self.start_local_preview()
        elif args.command == 'deploy':
            if not self.check_deploy_dependencies():
                sys.exit(1)
            self.deploy_to_ecs()
        elif args.command == 'upload-data':
            if not self.check_deploy_dependencies():
                sys.exit(1)
            self.upload_data_only_to_ecs()
        elif args.command == 'ecs-config':
            config = self.interactive_ecs_config()
            self.log_success("ECS配置已更新")

if __name__ == "__main__":
    manager = ImgManagerEnhanced()
    manager.main() 

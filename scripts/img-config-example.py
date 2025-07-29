#!/usr/bin/env python3
"""
ImgHub 图片管理工具配置示例
用于演示如何自定义图片处理参数
"""

# 导入主脚本
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

# 注意：由于主文件名为 img-manager.py，需要使用importlib导入
import importlib.util
spec = importlib.util.spec_from_file_location("img_manager", Path(__file__).parent / "img-manager.py")
img_manager_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(img_manager_module)

ImgManager = img_manager_module.ImgManager

class CustomImgManager(ImgManager):
    """自定义图片管理器，可以修改处理参数"""
    
    def __init__(self):
        super().__init__()
        
        # 自定义图片处理参数
        # self.thumbnail_size = 500          # 缩略图尺寸 (默认: 400)
        # self.display_size = 1000           # 展示图尺寸 (默认: 800)
        # self.detail_size = 1200            # 详情图尺寸 (默认: 900)
        
        # 自定义图片质量
        # self.thumbnail_quality = 80        # 缩略图质量 (默认: 75)
        # self.display_quality = 90          # 展示图质量 (默认: 85)
        # self.detail_quality = 95           # 详情图质量 (默认: 90)
        
        # 原图处理配置
        # self.compress_original = True      # 是否压缩原图 (默认: False)
        # self.original_max_size = 3000      # 原图最大尺寸 (默认: 2000)
        # self.original_quality = 98         # 原图压缩质量 (默认: 95)

def main():
    """使用自定义配置运行图片管理器"""
    manager = CustomImgManager()
    
    print("📋 当前图片处理配置:")
    print(f"  缩略图: {manager.thumbnail_size}px, 质量: {manager.thumbnail_quality}%")
    print(f"  展示图: {manager.display_size}px, 质量: {manager.display_quality}%")
    print(f"  详情图: {manager.detail_size}px, 质量: {manager.detail_quality}%")
    print(f"  原图压缩: {'是' if manager.compress_original else '否'}")
    if manager.compress_original:
        print(f"  原图尺寸: {manager.original_max_size}px, 质量: {manager.original_quality}%")
    else:
        print(f"  原图处理: 无损复制（保持完全原始质量）")
    
    print("\n🚀 启动图片管理器...")
    manager.main()

if __name__ == "__main__":
    main() 
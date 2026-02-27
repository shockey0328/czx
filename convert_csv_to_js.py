#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSV转JavaScript数据文件工具
将CSV文件转换为JavaScript数据，使看板可以离线使用
"""

import os
import sys
import json
import csv
from pathlib import Path

def csv_to_json(csv_file):
    """将CSV文件转换为JSON格式"""
    data = []
    try:
        with open(csv_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data.append(row)
        return data
    except Exception as e:
        print(f"  ✗ 读取失败: {csv_file} - {e}")
        return None

def convert_dashboard_data(dashboard_path):
    """转换指定看板目录下的所有CSV文件"""
    dashboard_path = Path(dashboard_path)
    
    if not dashboard_path.exists():
        print(f"✗ 目录不存在: {dashboard_path}")
        return False
    
    print(f"正在处理: {dashboard_path.name}")
    
    # 查找所有CSV文件
    csv_files = list(dashboard_path.glob('*.csv'))
    
    if not csv_files:
        print(f"  ⚠ 未找到CSV文件")
        return True
    
    # 转换所有CSV文件
    all_data = {}
    for csv_file in csv_files:
        print(f"  处理: {csv_file.name}")
        data = csv_to_json(csv_file)
        if data is not None:
            # 使用文件名（不含扩展名）作为键
            key = csv_file.stem
            all_data[key] = data
            print(f"  ✓ 成功: {len(data)} 条数据")
    
    if not all_data:
        print(f"  ✗ 没有成功转换的数据")
        return False
    
    # 生成JavaScript文件
    js_file = dashboard_path / 'data.js'
    try:
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write('// 自动生成的数据文件\n')
            f.write('// 生成时间: ' + str(Path(__file__).stat().st_mtime) + '\n\n')
            f.write('const dashboardData = ')
            json.dump(all_data, f, ensure_ascii=False, indent=2)
            f.write(';\n\n')
            f.write('// 导出数据\n')
            f.write('if (typeof module !== "undefined" && module.exports) {\n')
            f.write('  module.exports = dashboardData;\n')
            f.write('}\n')
        
        print(f"  ✓ 已生成: {js_file.name}")
        return True
        
    except Exception as e:
        print(f"  ✗ 生成失败: {e}")
        return False

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python convert_csv_to_js.py <看板目录>")
        print("示例: python convert_csv_to_js.py \"搜索数据看板（周度）\"")
        return 1
    
    dashboard_path = sys.argv[1]
    success = convert_dashboard_data(dashboard_path)
    
    return 0 if success else 1

if __name__ == '__main__':
    sys.exit(main())

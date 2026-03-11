# -*- coding: utf-8 -*-
"""
从 趋势分析 文件夹下的各月 Excel 读取全国省份核心指标，生成 trend-data.js 供看板使用。
运行：在「分省数据看板（月度）」目录下执行  python 趋势分析/build_trend_data.py
输出：趋势分析/trend-data.js
"""
import os
import re
import json
import glob

try:
    import pandas as pd
except ImportError:
    print('请先安装 pandas 和 openpyxl: pip install pandas openpyxl')
    exit(1)

# 当前脚本所在目录 = 趋势分析/
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_JS = os.path.join(SCRIPT_DIR, 'trend-data.js')

# 可能的列名映射（Excel 列名 -> 标准字段）
PROVINCE_KEYS = ['地区', '省份', '省', '区域', 'province']
ACTIVE_KEYS = ['活跃用户', '月活', '活跃']
REVENUE_KEYS = ['订单营收', '营收', '收入', 'revenue']
RATE_KEYS = ['使用率', '使用率%', '渗透率']
ARPU_KEYS = ['ARPU', 'arpu']


def find_column(row, keys):
    """在表头行中查找匹配的列名（不区分大小写）。"""
    for c in row:
        if c is None or (isinstance(c, float) and pd.isna(c)):
            continue
        s = str(c).strip()
        for k in keys:
            if k in s or s in k:
                return c
    return None


def read_month_sheet(path):
    """读取单月 Excel，返回 [(省份, 活跃用户, 营收, 使用率, ARPU), ...]"""
    df = pd.read_excel(path, sheet_name=0, header=None)
    if df.empty or len(df) < 2:
        return []
    # 第一行作为表头
    header = df.iloc[0]
    col_prov = find_column(header, PROVINCE_KEYS)
    col_active = find_column(header, ACTIVE_KEYS)
    col_rev = find_column(header, REVENUE_KEYS)
    col_rate = find_column(header, RATE_KEYS)
    col_arpu = find_column(header, ARPU_KEYS)
    if col_prov is None:
        # 尝试第一列作为省份
        col_prov = header.iloc[0] if len(header) > 0 else None
    prov_idx = list(header).index(col_prov) if col_prov is not None else 0
    active_idx = list(header).index(col_active) if col_active is not None else None
    rev_idx = list(header).index(col_rev) if col_rev is not None else None
    rate_idx = list(header).index(col_rate) if col_rate is not None else None
    arpu_idx = list(header).index(col_arpu) if col_arpu is not None else None

    rows = []
    for i in range(1, len(df)):
        row = df.iloc[i]
        prov = row.iloc[prov_idx] if prov_idx is not None else None
        if prov is None or (isinstance(prov, float) and pd.isna(prov)):
            continue
        prov = str(prov).strip()
        if not prov or prov.startswith('同比') or prov.startswith('环比'):
            continue
        try:
            active = float(row.iloc[active_idx]) if active_idx is not None and active_idx < len(row) else 0
        except (ValueError, TypeError):
            active = 0
        try:
            rev = float(row.iloc[rev_idx]) if rev_idx is not None and rev_idx < len(row) else 0
        except (ValueError, TypeError):
            rev = 0
        try:
            rate = float(row.iloc[rate_idx]) if rate_idx is not None and rate_idx < len(row) else 0
        except (ValueError, TypeError):
            rate = 0
        try:
            arpu = float(row.iloc[arpu_idx]) if arpu_idx is not None and arpu_idx < len(row) else 0
        except (ValueError, TypeError):
            arpu = 0
        rows.append((prov, active, rev, rate, arpu))
    return rows


def main():
    # 匹配 25年1月.xlsx ~ 26年2月.xlsx
    pattern = os.path.join(SCRIPT_DIR, '*.xlsx')
    files = sorted(glob.glob(pattern))
    month_files = []
    for f in files:
        base = os.path.basename(f)
        m = re.match(r'(\d{2})年(\d{1,2})月\.xlsx', base)
        if m:
            month_files.append((f, f'{m.group(1)}年{m.group(2)}月'))

    if not month_files:
        print('未找到 趋势分析/*.xlsx 文件')
        return

    # 按月份排序（25年1月 ... 26年2月）
    def month_key(t):
        a, b = re.match(r'(\d{2})年(\d{1,2})月', t[1]).groups()
        return (int(a), int(b))
    month_files.sort(key=month_key)

    # 构建 provinceTrendData: { 省份: [ {月份, 活跃用户, 营收, 使用率, ARPU}, ... ] }
    province_trend = {}
    # 构建 coreData: { 月份: { 省份: { 活跃用户, 订单营收, 使用率, ARPU, ... } } }
    core_data = {}

    for path, month_label in month_files:
        core_data[month_label] = {}
        rows = read_month_sheet(path)
        for prov, active, rev, rate, arpu in rows:
            if prov not in province_trend:
                province_trend[prov] = []
            province_trend[prov].append({
                '月份': month_label,
                '活跃用户': int(active) if active == int(active) else round(active, 2),
                '营收': round(rev, 2) if isinstance(rev, float) else rev,
                '使用率': round(rate, 1) if isinstance(rate, float) else rate,
                'ARPU': round(arpu, 2) if isinstance(arpu, float) else arpu
            })
            core_data[month_label][prov] = {
                '活跃用户': int(active) if active == int(active) else round(active, 2),
                '订单营收': round(rev, 2) if isinstance(rev, float) else rev,
                '使用率': round(rate, 1) if isinstance(rate, float) else rate,
                'ARPU': round(arpu, 2) if isinstance(arpu, float) else arpu,
                '深度访问率': 0, '新用户': 0, '老用户': 0,
                '同比活跃': 0, '环比活跃': 0, '同比营收': 0, '环比营收': 0,
                '同比使用率': 0, '环比使用率': 0, '同比ARPU': 0, '环比ARPU': 0
            }

    # 保证每个省份的趋势按月份顺序一致
    all_months = [m for _, m in month_files]
    for prov in province_trend:
        by_month = {x['月份']: x for x in province_trend[prov]}
        province_trend[prov] = []
        for m in all_months:
            if m in by_month:
                province_trend[prov].append(by_month[m])
            else:
                province_trend[prov].append({
                    '月份': m, '活跃用户': 0, '营收': 0, '使用率': 0, 'ARPU': 0
                })

    provinces = sorted(province_trend.keys())
    print(f'共 {len(provinces)} 个省份/地区，{len(all_months)} 个月份')
    print('省份:', provinces[:10], '...' if len(provinces) > 10 else '')

    # 输出 trend-data.js
    js_content = '''// 由 趋势分析/build_trend_data.py 自动生成，请勿直接编辑
// 全国各省份趋势数据与核心指标（25年1月～26年2月）

const TREND_PROVINCES = ''' + json.dumps(provinces, ensure_ascii=False, indent=2) + ''';

const provinceTrendData = ''' + json.dumps(province_trend, ensure_ascii=False, indent=2) + ''';

const coreDataFromTrend = ''' + json.dumps(core_data, ensure_ascii=False, indent=2) + ''';

const TREND_MONTHS = ''' + json.dumps(all_months, ensure_ascii=False) + ''';
'''

    with open(OUTPUT_JS, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print('已生成:', OUTPUT_JS)


if __name__ == '__main__':
    main()

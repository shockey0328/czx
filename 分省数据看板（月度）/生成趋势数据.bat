@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在从「趋势分析」文件夹的 Excel 生成 trend-data.js（34省）...
echo.
node 趋势分析\build_trend_data.js 2>nul
if errorlevel 1 (
    python 趋势分析\build_trend_data.py 2>nul
)
if exist "趋势分析\trend-data.js" (
    echo.
    echo 已生成 趋势分析\trend-data.js，刷新看板页面即可看到全国34省数据。
) else (
    echo.
    echo 未生成成功。请先在本目录执行: npm install
    echo 再执行: node 趋势分析\build_trend_data.js
    echo 或使用 Python: python 趋势分析\build_trend_data.py
)
echo.
pause

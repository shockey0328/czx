@echo off
chcp 65001 >nul
echo ========================================
echo 验证搜索数据看板修复
echo ========================================
echo.

echo [1/3] 检查文件是否存在...
if exist "搜索数据看板（周度）\app.js" (
    echo ✓ app.js 存在
) else (
    echo ✗ app.js 不存在
    pause
    exit /b 1
)

if exist "搜索数据看板（周度）\index.html" (
    echo ✓ index.html 存在
) else (
    echo ✗ index.html 不存在
    pause
    exit /b 1
)

echo.
echo [2/3] 检查 CSV 文件...
dir "搜索数据看板（周度）\*.csv" /b
echo.

echo [3/3] 启动本地服务器进行测试...
echo.
echo 服务器将在 http://localhost:8000 启动
echo 请在浏览器中访问并测试搜索数据看板
echo.
echo 测试步骤:
echo 1. 访问 http://localhost:8000
echo 2. 确保"周度"按钮已选中
echo 3. 在下拉选择器中选择"搜索数据"
echo 4. 检查是否显示数据和图表
echo.
echo 按任意键启动服务器，或关闭窗口取消...
pause >nul

echo.
echo 正在启动服务器...
python -m http.server 8000

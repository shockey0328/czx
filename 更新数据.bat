@echo off
chcp 65001 >nul

echo ========================================
echo 橙子学数据看板 - 数据更新工具
echo ========================================
echo.
echo 此工具会将CSV文件转换为JavaScript数据
echo 转换后可以直接双击打开HTML文件使用
echo.
echo ========================================
echo.

echo [1/4] 转换搜索数据看板的CSV文件...
powershell -ExecutionPolicy Bypass -File "convert_csv_to_js_v2.ps1" -FolderPath "搜索数据看板（周度）"
if %errorlevel% equ 0 (
    echo ✓ 搜索数据转换完成
) else (
    echo ✗ 搜索数据转换失败
)
echo.

echo [2/4] 转换核心数据看板（周度）的CSV文件...
powershell -ExecutionPolicy Bypass -File "convert_csv_to_js_v2.ps1" -FolderPath "核心数据看板（周度）"
if %errorlevel% equ 0 (
    echo ✓ 核心数据（周度）转换完成
) else (
    echo ✗ 核心数据（周度）转换失败
)
echo.

echo [3/4] 转换核心数据看板（月度）的CSV文件...
powershell -ExecutionPolicy Bypass -File "convert_csv_to_js_v2.ps1" -FolderPath "核心数据看板（月度）/public"
if %errorlevel% equ 0 (
    echo ✓ 核心数据（月度）转换完成
    echo 正在复制到主目录...
    copy "核心数据看板（月度）\public\data.js" "核心数据看板（月度）\data.js" >nul
    echo ✓ 文件复制完成
) else (
    echo ✗ 核心数据（月度）转换失败
)
echo.

echo [4/4] 转换渗透率看板的CSV文件...
powershell -ExecutionPolicy Bypass -File "convert_csv_to_js_v2.ps1" -FolderPath "各模块渗透率看板（月度）"
if %errorlevel% equ 0 (
    echo ✓ 渗透率数据转换完成
) else (
    echo ✗ 渗透率数据转换失败
)
echo.

echo ========================================
echo 数据更新完成！
echo ========================================
echo.
echo 现在可以直接双击打开 index.html 使用
echo 无需启动HTTP服务器
echo.
pause

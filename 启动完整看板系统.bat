@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║          橙子学数据看板 - 完整系统启动                ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo [提示] 此脚本将启动两个服务器：
echo        1. 主看板服务器 (端口 8000)
echo        2. 用户行为看板服务器 (端口 3001)
echo.
echo [注意] 请保持此窗口打开，关闭将停止所有服务
echo.
pause
echo.

REM 检查Python是否安装
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python，无法启动主看板服务器
    echo [提示] 请安装Python或手动启动HTTP服务器
    pause
    exit /b 1
)

echo [1/2] 启动主看板服务器...
start "主看板服务器" cmd /k "echo 主看板服务器运行在 http://localhost:8000 && echo 请访问: http://localhost:8000/index.html && echo. && python -m http.server 8000"

timeout /t 2 >nul

echo [2/2] 启动用户行为看板服务器...
start "用户行为看板服务器" cmd /k "cd 用户行为看板（周度） && node server-with-db.js"

timeout /t 3 >nul

echo.
echo ════════════════════════════════════════════════════════
echo.
echo ✅ 所有服务器已启动！
echo.
echo 📊 主看板地址: http://localhost:8000/index.html
echo 👤 用户行为看板: http://localhost:3001/dashboard-db.html
echo.
echo 💡 使用说明:
echo    1. 在浏览器中访问主看板地址
echo    2. 选择"周度" → "用户行为"即可查看用户行为看板
echo    3. 其他看板可直接访问，无需额外服务器
echo.
echo ⚠️  关闭此窗口将停止所有服务器
echo.
echo ════════════════════════════════════════════════════════
echo.
pause

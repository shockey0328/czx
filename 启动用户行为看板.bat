@echo off
chcp 65001 >nul
echo ========================================
echo   用户行为看板 - 启动服务器
echo ========================================
echo.
echo 正在启动用户行为看板服务器...
echo 服务器地址: http://localhost:3001
echo 看板地址: http://localhost:3001/dashboard-db.html
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

cd "用户行为看板（周度）"

if not exist "node_modules" (
    echo 首次运行，正在安装依赖...
    call npm install
    echo.
)

echo 启动服务器...
node server-with-db.js

pause

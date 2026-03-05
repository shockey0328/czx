@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║          用户行为看板 - 服务器启动工具                ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo [信息] 正在检查环境...
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    echo [提示] 下载地址: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [成功] Node.js 已安装
node --version
echo.

REM 切换到看板目录
cd "用户行为看板（周度）"
if %errorlevel% neq 0 (
    echo [错误] 无法进入用户行为看板目录
    pause
    exit /b 1
)

REM 检查并安装依赖
if not exist "node_modules" (
    echo [信息] 首次运行，正在安装依赖包...
    echo [提示] 这可能需要几分钟时间，请耐心等待
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [错误] 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
    echo.
    echo [成功] 依赖安装完成
    echo.
)

echo ════════════════════════════════════════════════════════
echo.
echo [启动] 正在启动用户行为看板服务器...
echo.
echo [地址] http://localhost:3001/dashboard-db.html
echo [提示] 服务器启动后，请在浏览器中访问上述地址
echo [提示] 或在主看板中选择"用户行为"看板
echo.
echo [操作] 按 Ctrl+C 可停止服务器
echo.
echo ════════════════════════════════════════════════════════
echo.

REM 启动服务器
node server-with-db.js

echo.
echo [信息] 服务器已停止
pause

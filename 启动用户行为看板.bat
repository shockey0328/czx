@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║          用户行为看板 - 服务器启动工具                ║
echo ╚════════════════════════════════════════════════════════╝
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    pause
    exit /b 1
)

cd /d "%~dp0用户行为看板（周度）"
if %errorlevel% neq 0 (
    echo [错误] 无法进入用户行为看板目录
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [信息] 首次运行，正在安装依赖包...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

REM 统一端口 3001，与开机自启动服务一致
if not defined PORT set PORT=3001

echo.
echo [启动] 端口 %PORT%
echo [地址] http://localhost:%PORT%/dashboard-db.html
echo [内网] http://172.16.32.24:%PORT%/dashboard-db.html
echo [提示] 门户「用户行为」经 user-behavior.html 跳转到 intranet-user-behavior.json 配置的地址
echo [操作] 按 Ctrl+C 可停止服务器
echo.

node server-with-db.js
echo.
echo [信息] 服务器已停止
pause

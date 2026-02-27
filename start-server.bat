@echo off
chcp 65001 >nul
echo ========================================
echo 橙子学数据看板 - 启动服务器
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [√] 检测到Python，正在启动服务器...
    echo [√] 服务器地址: http://localhost:8000
    echo [√] 按 Ctrl+C 停止服务器
    echo.
    timeout /t 2 /nobreak >nul
    start http://localhost:8000/dashboard.html
    python -m http.server 8000
    goto :end
)

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [√] 检测到Node.js，正在启动服务器...
    echo [√] 服务器地址: http://localhost:8000
    echo [√] 按 Ctrl+C 停止服务器
    echo.
    timeout /t 2 /nobreak >nul
    start http://localhost:8000/dashboard.html
    npx http-server -p 8000
    goto :end
)

REM 如果都没有安装
echo [×] 错误: 未检测到Python或Node.js
echo.
echo 请安装以下任一工具:
echo   1. Python 3.x - https://www.python.org/downloads/
echo   2. Node.js - https://nodejs.org/
echo.
pause
goto :end

:end

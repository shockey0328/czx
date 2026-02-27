@echo off
chcp 65001 >nul
echo ========================================
echo 橙子学数据看板 - 本地服务器
echo ========================================
echo.

REM 检查 Python 是否安装
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [√] 检测到 Python，正在启动服务器...
    echo.
    echo 服务器地址: http://localhost:8000
    echo 按 Ctrl+C 停止服务器
    echo.
    python -m http.server 8000
    goto :end
)

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo [√] 检测到 Node.js，正在启动服务器...
    echo.
    echo 服务器地址: http://localhost:8000
    echo 按 Ctrl+C 停止服务器
    echo.
    npx http-server -p 8000
    goto :end
)

REM 都没有安装
echo [×] 未检测到 Python 或 Node.js
echo.
echo 请安装以下任一工具：
echo 1. Python: https://www.python.org/downloads/
echo 2. Node.js: https://nodejs.org/
echo.
pause
goto :end

:end

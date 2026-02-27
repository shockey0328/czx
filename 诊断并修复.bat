@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo 橙子学数据看板 - 自动诊断和修复工具
echo ========================================
echo.

:: 检查Python是否安装
echo [1/5] 检查Python环境...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Python已安装
    set PYTHON_OK=1
) else (
    echo ✗ Python未安装
    set PYTHON_OK=0
)
echo.

:: 检查Node.js是否安装
echo [2/5] 检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Node.js已安装
    set NODE_OK=1
) else (
    echo ✗ Node.js未安装
    set NODE_OK=0
)
echo.

:: 检查端口占用
echo [3/5] 检查端口占用情况...
netstat -ano | findstr :8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ! 端口8000已被占用
    echo   正在尝试结束占用进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 >nul
    echo ✓ 端口已释放
) else (
    echo ✓ 端口8000可用
)
echo.

:: 检查文件完整性
echo [4/5] 检查文件完整性...
set FILES_OK=1

if not exist "index.html" (
    echo ✗ 缺少文件: index.html
    set FILES_OK=0
)

if not exist "main.js" (
    echo ✗ 缺少文件: main.js
    set FILES_OK=0
)

if not exist "搜索数据看板（周度）\index.html" (
    echo ✗ 缺少文件: 搜索数据看板（周度）\index.html
    set FILES_OK=0
)

if not exist "搜索数据看板（周度）\app.js" (
    echo ✗ 缺少文件: 搜索数据看板（周度）\app.js
    set FILES_OK=0
)

if not exist "搜索数据看板（周度）\第1周搜索词.csv" (
    echo ✗ 缺少文件: 搜索数据看板（周度）\第1周搜索词.csv
    set FILES_OK=0
)

if !FILES_OK! equ 1 (
    echo ✓ 所有必需文件完整
) else (
    echo ! 部分文件缺失，但将继续尝试启动
)
echo.

:: 启动服务器
echo [5/5] 启动HTTP服务器...
echo.

if !PYTHON_OK! equ 1 (
    echo 使用Python启动服务器...
    echo 服务器地址: http://localhost:8000
    echo.
    echo ========================================
    echo 服务器已启动！
    echo ========================================
    echo.
    echo 请在浏览器中访问以下地址：
    echo.
    echo   主看板: http://localhost:8000
    echo   测试页面: http://localhost:8000/测试搜索看板.html
    echo   搜索看板: http://localhost:8000/搜索数据看板（周度）/index.html
    echo.
    echo 按 Ctrl+C 停止服务器
    echo ========================================
    echo.
    
    :: 等待2秒后自动打开浏览器
    timeout /t 2 >nul
    start http://localhost:8000/测试搜索看板.html
    
    :: 启动Python服务器
    python -m http.server 8000
    
) else if !NODE_OK! equ 1 (
    echo 使用Node.js启动服务器...
    echo 服务器地址: http://localhost:8000
    echo.
    echo ========================================
    echo 服务器已启动！
    echo ========================================
    echo.
    echo 请在浏览器中访问: http://localhost:8000
    echo.
    echo 按 Ctrl+C 停止服务器
    echo ========================================
    echo.
    
    timeout /t 2 >nul
    start http://localhost:8000/测试搜索看板.html
    
    npx http-server -p 8000
    
) else (
    echo.
    echo ========================================
    echo ✗ 错误：未找到Python或Node.js
    echo ========================================
    echo.
    echo 请安装以下工具之一：
    echo.
    echo 1. Python 3.x
    echo    下载地址: https://www.python.org/downloads/
    echo.
    echo 2. Node.js
    echo    下载地址: https://nodejs.org/
    echo.
    echo 安装完成后，重新运行此脚本。
    echo.
    pause
    exit /b 1
)

endlocal

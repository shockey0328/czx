@echo off
chcp 65001 >nul

echo ========================================
echo 橙子学数据看板 - 简单启动
echo ========================================
echo.

echo 正在检查Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ✗ 未找到Python！
    echo.
    echo 请先安装Python：
    echo 1. 访问 https://www.python.org/downloads/
    echo 2. 下载并安装最新版本
    echo 3. 安装时勾选 "Add Python to PATH"
    echo 4. 重启电脑后再运行此脚本
    echo.
    pause
    exit /b 1
)

echo ✓ Python已安装
echo.

echo 正在启动HTTP服务器...
echo 服务器地址: http://localhost:8000
echo.
echo ========================================
echo 重要提示：
echo ========================================
echo.
echo 1. 请保持此窗口打开（不要关闭）
echo 2. 在浏览器中访问: http://localhost:8000
echo 3. 如果无法访问，尝试: http://127.0.0.1:8000
echo 4. 按 Ctrl+C 可以停止服务器
echo.
echo ========================================
echo.

:: 等待3秒
timeout /t 3 >nul

:: 尝试打开浏览器
start http://localhost:8000 2>nul
if %errorlevel% neq 0 (
    echo 提示: 请手动在浏览器中访问 http://localhost:8000
    echo.
)

:: 启动Python服务器
echo 服务器正在运行...
echo.
python -m http.server 8000

:: 如果服务器停止
echo.
echo 服务器已停止
pause

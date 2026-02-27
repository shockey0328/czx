@echo off
chcp 65001 >nul

echo ========================================
echo 月度核心数据看板 - 启动工具
echo ========================================
echo.
echo 此看板是React应用，需要Node.js环境
echo.
echo ========================================
echo.

echo [检查] 检查Node.js环境...
echo.

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ 未检测到Node.js
    echo.
    echo 请先安装Node.js：
    echo 1. 访问 https://nodejs.org/
    echo 2. 下载并安装LTS版本
    echo 3. 重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js已安装
node --version
echo.

echo [检查] 检查npm环境...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ npm未正确安装
    pause
    exit /b 1
)

echo ✓ npm已安装
npm --version
echo.

echo [步骤1] 进入项目目录...
cd "核心数据看板（月度）"
if %errorlevel% neq 0 (
    echo ✗ 目录不存在
    pause
    exit /b 1
)
echo ✓ 已进入目录
echo.

echo [步骤2] 检查依赖...
if not exist "node_modules" (
    echo 首次运行，需要安装依赖...
    echo 这可能需要几分钟时间，请耐心等待...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo ✗ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✓ 依赖安装完成
    echo.
) else (
    echo ✓ 依赖已安装
    echo.
)

echo [步骤3] 启动开发服务器...
echo.
echo ========================================
echo 服务器即将启动
echo ========================================
echo.
echo 启动后：
echo 1. 浏览器会自动打开 http://localhost:3000
echo 2. 或者在统一看板中刷新页面
echo 3. 按 Ctrl+C 可以停止服务器
echo.
echo ========================================
echo.

npm start

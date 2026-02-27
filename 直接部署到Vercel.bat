@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   直接部署到 Vercel（跳过 GitHub）
echo ========================================
echo.
echo 正在检查 Node.js 和 npm...
echo.

REM 检查 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Node.js
    echo.
    echo 请先安装 Node.js：
    echo https://nodejs.org/
    echo.
    echo 安装完成后重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
node --version
echo.

REM 检查 npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm 未找到
    pause
    exit /b 1
)

echo ✅ npm 已安装
npm --version
echo.

echo ========================================
echo   步骤 1：安装 Vercel CLI
echo ========================================
echo.
echo 正在安装 Vercel CLI...
echo.

npm install -g vercel

if %errorlevel% neq 0 (
    echo.
    echo ❌ 安装失败
    echo.
    echo 请尝试手动安装：
    echo npm install -g vercel
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Vercel CLI 安装成功
echo.

echo ========================================
echo   步骤 2：登录 Vercel
echo ========================================
echo.
echo 即将打开浏览器进行登录...
echo 请在浏览器中完成登录授权
echo.
pause

vercel login

if %errorlevel% neq 0 (
    echo.
    echo ❌ 登录失败
    pause
    exit /b 1
)

echo.
echo ✅ 登录成功
echo.

echo ========================================
echo   步骤 3：部署到 Vercel
echo ========================================
echo.
echo 正在部署...
echo.

vercel --prod

if %errorlevel% neq 0 (
    echo.
    echo ❌ 部署失败
    echo.
    echo 请查看错误信息
    pause
    exit /b 1
)

echo.
echo ========================================
echo   🎉 部署成功！
echo ========================================
echo.
echo 你的看板已经上线！
echo.
echo 访问地址已显示在上方
echo.
pause

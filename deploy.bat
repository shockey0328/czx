@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   橙子学数据看板 - 快速部署
echo ========================================
echo.

REM 检查是否已初始化 Git
if not exist ".git" (
    echo [1/5] 初始化 Git 仓库...
    git init
    echo ✓ Git 仓库初始化完成
    echo.
) else (
    echo [1/5] Git 仓库已存在
    echo.
)

REM 添加远程仓库
echo [2/5] 配置远程仓库...
set /p GITHUB_USERNAME="请输入你的 GitHub 用户名: "
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USERNAME%/czx-dashboard.git
echo ✓ 远程仓库配置完成
echo.

REM 添加所有文件
echo [3/5] 添加文件到 Git...
git add .
echo ✓ 文件添加完成
echo.

REM 提交更改
echo [4/5] 提交更改...
set /p COMMIT_MSG="请输入提交信息 (默认: Update dashboard): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Update dashboard
git commit -m "%COMMIT_MSG%"
echo ✓ 提交完成
echo.

REM 推送到 GitHub
echo [5/5] 推送到 GitHub...
git branch -M main
git push -u origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo   ✓ 部署成功！
    echo ========================================
    echo.
    echo 下一步：
    echo 1. 访问 https://vercel.com
    echo 2. 使用 GitHub 账号登录
    echo 3. 导入 czx-dashboard 仓库
    echo 4. 点击 Deploy 完成部署
    echo.
    echo GitHub 仓库: https://github.com/%GITHUB_USERNAME%/czx-dashboard
    echo.
) else (
    echo ========================================
    echo   ✗ 部署失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. GitHub 仓库不存在或无权限
    echo 2. 需要配置 Git 凭据
    echo 3. 网络连接问题
    echo.
    echo 请查看错误信息并重试
    echo.
)

pause

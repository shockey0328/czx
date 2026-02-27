@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   修复 GitHub 远程仓库地址
echo ========================================
echo.
echo 当前远程地址配置错误：
echo https://github.com/czx-dashboard/czx-dashboard.git
echo.
echo 这里 czx-dashboard 被当成了用户名
echo 但实际上它是仓库名
echo.
echo ========================================
echo.
echo 请输入你的 GitHub 用户名：
echo （就是你登录 GitHub 时使用的用户名）
echo.
set /p USERNAME="GitHub 用户名: "
echo.

if "%USERNAME%"=="" (
    echo ❌ 用户名不能为空
    pause
    exit /b 1
)

echo.
echo 正在更新远程地址为：
echo https://github.com/%USERNAME%/czx-dashboard.git
echo.
pause

git remote set-url origin https://github.com/%USERNAME%/czx-dashboard.git

if %errorlevel% neq 0 (
    echo.
    echo ❌ 更新失败
    pause
    exit /b 1
)

echo.
echo ✅ 远程地址已更新
echo.
echo 验证新地址：
git remote -v
echo.
echo ========================================
echo   现在可以推送到 GitHub 了
echo ========================================
echo.
echo 请在 GitHub Desktop 中：
echo 1. 关闭错误提示
echo 2. 点击 "Publish branch" 或 "Push origin"
echo.
echo 或者在命令行运行：
echo git push -u origin main
echo.
pause

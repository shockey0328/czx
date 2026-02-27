@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   部署到 Vercel
echo ========================================
echo.
echo 正在打开 Vercel 网站...
echo.

start https://vercel.com

echo.
echo 请在打开的页面中：
echo.
echo 1. 使用 GitHub 账号登录
echo 2. 点击 "Add New..." → "Project"
echo 3. 选择 czx-dashboard 仓库
echo 4. 点击 "Import"
echo 5. 保持默认设置，点击 "Deploy"
echo.
echo 等待 1-2 分钟，部署完成！
echo.
echo 详细步骤请查看：Vercel部署指南.md
echo.
echo ========================================
echo.
pause

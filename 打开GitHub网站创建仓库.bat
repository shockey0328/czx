@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   在 GitHub 创建新仓库
echo ========================================
echo.
echo 正在打开 GitHub 创建仓库页面...
echo.

start https://github.com/new

echo.
echo 请在打开的页面中：
echo.
echo 1. Repository name: czx-dashboard
echo 2. Description: 橙子学数据看板系统
echo 3. 选择 Public 或 Private
echo 4. ❌ 不要勾选 "Initialize this repository with a README"
echo 5. 点击 "Create repository"
echo.
echo 创建完成后，记下你的 GitHub 用户名
echo 然后运行：推送到GitHub.bat
echo.
echo ========================================
echo.
pause

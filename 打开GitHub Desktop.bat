@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   橙子学数据看板 - GitHub Desktop 部署
echo ========================================
echo.
echo 正在尝试打开 GitHub Desktop...
echo.

REM 尝试打开 GitHub Desktop
start "" "github-desktop://openRepo/%CD%"

timeout /t 2 >nul

echo.
echo 如果 GitHub Desktop 没有打开，请：
echo.
echo 1. 下载并安装 GitHub Desktop
echo    https://desktop.github.com/
echo.
echo 2. 手动打开 GitHub Desktop
echo    - File → Add Local Repository
echo    - 选择此文件夹
echo    - 点击 "Publish repository"
echo.
echo ========================================
echo.
pause

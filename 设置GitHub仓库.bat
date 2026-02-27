@echo off
chcp 65001 >nul
echo ========================================
echo GitHub 仓库设置助手
echo ========================================
echo.

echo 当前远程仓库配置:
git remote -v
echo.

echo ----------------------------------------
echo 选择操作:
echo ----------------------------------------
echo 1. 检查仓库状态
echo 2. 创建新的 GitHub 仓库并连接
echo 3. 推送到 GitHub
echo 4. 查看提交历史
echo 5. 退出
echo.

set /p choice="请输入选项 (1-5): "

if "%choice%"=="1" goto check
if "%choice%"=="2" goto setup
if "%choice%"=="3" goto push
if "%choice%"=="4" goto log
if "%choice%"=="5" goto end

:check
echo.
echo [检查仓库状态]
echo.
git status
echo.
pause
goto end

:setup
echo.
echo [设置新仓库]
echo.
echo 请先在 GitHub 上创建仓库: https://github.com/new
echo 仓库名称建议: czx-dashboard
echo.
set /p repo_url="请输入仓库地址 (例如: https://github.com/username/czx-dashboard.git): "
echo.
echo 移除旧的远程仓库...
git remote remove origin 2>nul
echo.
echo 添加新的远程仓库...
git remote add origin %repo_url%
echo.
echo 验证配置...
git remote -v
echo.
echo [完成] 远程仓库已设置
echo.
pause
goto end

:push
echo.
echo [推送到 GitHub]
echo.
echo 当前分支: 
git branch --show-current
echo.
echo 开始推送...
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo [成功] 推送完成！
) else (
    echo [失败] 推送失败，请检查网络连接或使用 GitHub Desktop
)
echo.
pause
goto end

:log
echo.
echo [最近10次提交]
echo.
git log --oneline -10
echo.
pause
goto end

:end
echo.
echo 感谢使用！
echo.

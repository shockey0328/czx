@echo off
chcp 65001 >nul
echo ========================================
echo 快速推送到 GitHub
echo ========================================
echo.

REM 检查是否有修改
git status --short
if %errorlevel% neq 0 (
    echo [错误] Git 仓库状态异常
    pause
    exit /b 1
)

echo.
echo ----------------------------------------
echo 当前修改的文件:
echo ----------------------------------------
git status --short
echo.

REM 询问提交信息
set /p commit_msg="请输入提交说明: "

if "%commit_msg%"=="" (
    echo [错误] 提交说明不能为空
    pause
    exit /b 1
)

echo.
echo [1/3] 添加文件...
git add .

echo [2/3] 提交更改...
git commit -m "%commit_msg%"

echo [3/3] 推送到 GitHub...
git push

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✓ 推送成功！
    echo ========================================
    echo.
    echo Vercel 将在几秒钟后自动部署
    echo 访问 https://vercel.com/dashboard 查看部署状态
    echo.
) else (
    echo.
    echo ========================================
    echo ✗ 推送失败
    echo ========================================
    echo.
    echo 可能的原因:
    echo 1. 网络连接问题
    echo 2. 需要先设置远程仓库
    echo 3. 需要先拉取远程更新
    echo.
    echo 建议:
    echo - 使用 GitHub Desktop（更稳定）
    echo - 或运行 "设置GitHub仓库.bat" 检查配置
    echo.
)

pause

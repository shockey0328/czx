@echo off
chcp 65001 >nul
echo ========================================
echo   GitHub 推送脚本
echo ========================================
echo.

echo [1/3] 检查Git状态...
git status
echo.

echo [2/3] 尝试推送到GitHub...
git push origin master

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   ✅ 推送成功！
    echo ========================================
    echo.
    echo 请访问查看: https://github.com/shockey0328/monthly-dashboard
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ 推送失败
    echo ========================================
    echo.
    echo 可能的原因:
    echo 1. 网络连接问题
    echo 2. 需要身份验证
    echo 3. 远程仓库有冲突
    echo.
    echo 请查看 GitHub推送指南.md 获取详细帮助
    echo.
)

echo [3/3] 查看最近的提交...
git log --oneline -3
echo.

pause
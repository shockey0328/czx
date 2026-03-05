@echo off
chcp 65001 >nul
echo ========================================
echo 推送Railway部署修复到GitHub
echo ========================================
echo.

echo 正在推送...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 推送成功！
    echo ========================================
    echo.
    echo Railway会自动检测更新并重新部署
    echo 预计2-3分钟后完成
    echo.
    echo 测试地址：
    echo https://czx-production.up.railway.app/dashboard-db.html
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ 推送失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. GitHub服务不可用
    echo 3. 需要配置代理
    echo.
    echo 请稍后重试，或使用Git客户端推送
    echo.
)

pause

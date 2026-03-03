@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    推送各模块渗透率看板更新到GitHub
echo ========================================
echo.
echo 正在推送到GitHub...
echo.

git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✓ 推送成功！
    echo ========================================
    echo.
    echo 更新内容：
    echo - 各模块渗透率看板添加26年2月数据
    echo - 更新data.js文件
    echo - 更新index.html月份选择器
    echo - 添加测试和启动脚本
    echo.
    echo 线上看板将自动更新（如已部署到Vercel）
    echo.
) else (
    echo.
    echo ========================================
    echo ✗ 推送失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. GitHub访问受限
    echo 3. 认证信息过期
    echo.
    echo 解决方法：
    echo 1. 检查网络连接
    echo 2. 稍后重试
    echo 3. 使用GitHub Desktop推送
    echo.
)

echo 按任意键关闭此窗口...
pause >nul

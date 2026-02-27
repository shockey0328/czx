@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   验证AI位置修复
echo ========================================
echo.
echo 正在打开验证页面...
echo.

start "" "验证AI位置修复.html"

timeout /t 2 >nul

echo.
echo ✓ 验证页面已打开
echo.
echo 请按照页面上的步骤进行验证：
echo 1. 点击"打开月度看板"按钮
echo 2. 检查B端数据在AI分析上面
echo 3. 确认AI分析显示正常
echo.
pause

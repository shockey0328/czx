@echo off
chcp 65001 >nul

echo ========================================
echo 橙子学数据看板 - 一键测试
echo ========================================
echo.
echo 正在启动服务器和测试页面...
echo.

:: 启动Python服务器（后台运行）
start /B python -m http.server 8000 >nul 2>&1

:: 等待服务器启动
timeout /t 3 >nul

:: 打开测试页面
start http://localhost:8000/测试搜索看板.html

echo.
echo ========================================
echo 测试页面已打开！
echo ========================================
echo.
echo 如果浏览器没有自动打开，请手动访问：
echo http://localhost:8000/测试搜索看板.html
echo.
echo 按任意键关闭此窗口（服务器将继续运行）
pause >nul

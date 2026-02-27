@echo off
chcp 65001 >nul
echo ========================================
echo 橙子学数据看板 - 启动脚本
echo ========================================
echo.

echo [1/2] 启动主看板服务器...
echo.
start "主看板服务器" cmd /k "python -m http.server 8000 || npx http-server -p 8000"

timeout /t 2 >nul

echo [2/2] 启动月度核心数据看板（React）...
echo.
start "月度核心数据看板" cmd /k "cd 核心数据看板（月度） && npm start"

timeout /t 3 >nul

echo.
echo ========================================
echo 启动完成！
echo ========================================
echo.
echo 主看板地址: http://localhost:8000
echo 月度核心数据看板: http://localhost:3000
echo.
echo 请在浏览器中访问主看板地址
echo 按任意键退出此窗口...
pause >nul

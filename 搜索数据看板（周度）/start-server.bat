@echo off
chcp 65001 >nul
echo 正在启动本地服务器...
echo.
echo 服务器地址: http://localhost:8000
echo 按 Ctrl+C 停止服务器
echo.

node server.js

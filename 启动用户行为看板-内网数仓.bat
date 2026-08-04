@echo off
chcp 65001 >nul
cd /d "%~dp0用户行为看板（周度）"

if not defined PORT set PORT=3010

echo ========================================
echo  用户行为看板（数仓 MCP / 内网模式）
echo ========================================
echo.
echo 请确认本目录已有 .env：
echo   DATA_SOURCE=warehouse
echo   MCP_KEY=...
echo   DEEPSEEK_API_KEY=...
echo.
echo 启动后本机访问：
echo   http://localhost:%PORT%/dashboard-db.html
echo.
echo 内网同事访问：
echo   http://172.16.32.24:%PORT%/dashboard-db.html
echo.
echo 门户集合页跳转已指向 intranet-user-behavior.json（当前 %PORT%）
echo ========================================
echo.

node server-with-db.js
pause

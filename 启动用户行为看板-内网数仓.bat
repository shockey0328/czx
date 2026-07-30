@echo off
chcp 65001 >nul
cd /d "%~dp0用户行为看板（周度）"

echo ========================================
echo  用户行为看板（数仓 MCP / 内网模式）
echo ========================================
echo.
echo 请确认本目录已有 .env：
echo   DATA_SOURCE=warehouse
echo   MCP_KEY=（与 Cursor mcp.json 的 X-MCP-Key 一致）
echo.
echo 启动后本机访问：
echo   http://localhost:3001/dashboard-db.html
echo.
echo 内网其他同事访问（把下面 IP 换成这台机器局域网 IP）：
echo   http://你的内网IP:3001/dashboard-db.html
echo.
echo 查本机 IP 可执行：ipconfig
echo 然后把该地址写入仓库根目录 intranet-user-behavior.json 并发布。
echo ========================================
echo.

node server-with-db.js
pause

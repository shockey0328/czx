@echo off
chcp 65001 >nul
cd /d "%~dp0"

REM 统一端口 3001，与开机自启动服务一致
if not defined PORT set PORT=3001

echo 结束占用 %PORT% 的旧进程（如有）...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr LISTENING') do (
  echo kill PID %%a
  taskkill /F /PID %%a >nul 2>&1
)
npx --yes kill-port %PORT% >nul 2>&1
timeout /t 1 /nobreak >nul

echo 启动用户行为服务 PORT=%PORT% ...
node server-with-db.js
pause

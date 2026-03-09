@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 仅导入新增日期的 Excel（16GB 内存，适合大文件如 3月8日）...
echo.
node --max-old-space-size=16384 db-manager.js import-new
echo.
pause

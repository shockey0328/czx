@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 全量导入所有日期的 Excel（16GB 内存，处理大文件如 3月8 日不易卡住）...
echo.
node --max-old-space-size=16384 db-manager.js import
echo.
pause

@echo off
chcp 65001 >nul
echo ========================================
echo   仅导入新增日期的 Excel（含 3月8 日）
echo   已分配 4GB 内存，请勿关闭本窗口
echo ========================================
echo.

cd /d "%~dp0"
node --max-old-space-size=4096 db-manager.js import-new

echo.
echo ========================================
echo   执行完毕，请查看上方输出的「当前共 X 天」确认是否成功
echo ========================================
pause

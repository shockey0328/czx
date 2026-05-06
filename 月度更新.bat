@echo off
chcp 65001 >nul
title Monthly dashboard update
echo.
echo ========================================
echo   橙子学数据看板 - 月度更新
echo   核心数据 / 渗透率 / 分省数据
echo ========================================
echo.

cd /d "%~dp0"

where powershell >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 PowerShell。
    pause
    exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 node，请先安装 Node.js。
    pause
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\update_monthly.ps1"
set PS_EXIT=%ERRORLEVEL%

echo.
if not "%PS_EXIT%"=="0" echo [提示] PowerShell 退出码: %PS_EXIT%
echo 按任意键关闭窗口...
pause >nul

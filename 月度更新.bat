@echo off
chcp 65001 >nul
title 月度看板一键更新
echo.
echo  ╔══════════════════════════════════════╗
echo  ║      橙子学数据看板 — 月度更新       ║
echo  ║  核心数据 / 渗透率 / 分省数据        ║
echo  ╚══════════════════════════════════════╝
echo.

:: 以脚本所在目录为工作目录
cd /d "%~dp0"

:: 检查 PowerShell 是否可用
where powershell >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 PowerShell，请确认系统已安装 PowerShell 5.1 或以上版本。
    pause
    exit /b 1
)

:: 检查 Node.js 是否可用
where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 node 命令，请先安装 Node.js（https://nodejs.org）。
    pause
    exit /b 1
)

:: 运行 PowerShell 脚本（绕过执行策略限制）
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\update_monthly.ps1"

echo.
echo  按任意键关闭窗口...
pause >nul

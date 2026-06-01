@echo off
chcp 65001 >nul
title 月度看板一键更新
echo.
echo ========================================
echo   橙子学数据看板 - 月度更新
echo   核心数据 / 渗透率 / 分省数据
echo ========================================
echo.

cd /d "%~dp0"

where powershell >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 PowerShell，请确认系统已安装 PowerShell 5.1 或以上版本。
    pause
    exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 node 命令，请先安装 Node.js 或激活 Conda 环境后再运行。
    echo        若使用 Conda，可先打开 Anaconda Prompt 再双击本脚本。
    pause
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\update_monthly.ps1"
set PS_EXIT=%ERRORLEVEL%

echo.
if not "%PS_EXIT%"=="0" (
    echo [提示] 脚本退出码: %PS_EXIT% （请查看上方 [FAIL] 行）
) else (
    echo [完成] 本地 data.js 已更新；若需上线请确认 git push 成功。
)
echo.
echo 按任意键关闭窗口...
pause >nul
exit /b %PS_EXIT%

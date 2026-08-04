@echo off
chcp 65001 >nul
title 月度看板一键更新

echo.
echo ========================================
echo   橙子学数据看板 - 月度更新
echo   核心数据 / 渗透率 / 分省数据
echo ========================================
echo.
echo   默认拉取「上一自然月」MaxCompute 数据
echo   （自 2026年7月起），再转换并推送 GitHub
echo.
echo   整次可能需要 30~60 分钟，请保持窗口打开
echo.
echo   可选参数:
echo     2026-07          指定月份
echo     --skip-fetch     跳过拉数，仅转换+推送
echo     --skip-git       跳过 Git 提交推送
echo     --refresh        分省忽略缓存重查
echo.

cd /d "%~dp0"

where powershell >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 PowerShell
    pause
    exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 node，请先安装 Node.js
    pause
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\update_monthly.ps1" %*
set PS_EXIT=%ERRORLEVEL%

echo.
if not "%PS_EXIT%"=="0" (
    echo [提示] 脚本退出码: %PS_EXIT% （请查看上方 [FAIL] 行）
) else (
    echo [完成] 月度数据已更新；请确认 git push 成功后刷新看板。
)

echo.
echo 按任意键关闭窗口...
pause >nul
exit /b %PS_EXIT%

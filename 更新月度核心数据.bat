@echo off
chcp 65001 >nul
title 更新月度核心数据（MaxCompute）

echo.
echo ========================================
echo   橙子学数据看板 - 月度核心数据更新
echo   默认拉取「上一自然月」指标并写入 CSV
echo   （B端核心数据不改动）
echo ========================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 node，请先安装 Node.js。
    pause
    exit /b 1
)

REM 可选参数：年月 如 2026-07 ；或 --dry-run
set ARGS=%*

echo [提示] 若 CSV 正被 WPS/Excel 打开，请先关闭再运行，否则主文件可能写不入。
echo.
echo [1/1] 从 MaxCompute 拉数并写 CSV ...
echo.
node "%~dp0核心数据看板（月度）\scripts\update_core_metrics_from_odps.mjs" %ARGS%
set EXITCODE=%ERRORLEVEL%

echo.
if not "%EXITCODE%"=="0" (
    echo [失败] 退出码 %EXITCODE%
    echo        请确认已配置 MCP_KEY（用户行为看板/.env 或本看板 .env）
) else (
    echo [完成] 月度核心数据已更新。全量月度看板请再运行「月度更新.bat」。
)
echo.
pause
exit /b %EXITCODE%

@echo off
chcp 65001 >nul
title 更新各模块渗透率（MaxCompute）
cd /d "%~dp0"

echo.
echo ========================================
echo   各模块渗透率看板 - 更新上一自然月
echo   查 MaxCompute → 写 CSV → 转 data.js
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 node
    pause
    exit /b 1
)

set ARGS=%*
echo [1/1] 拉取渗透率并更新 CSV ...
echo.
node "%~dp0scripts\update_penetration_from_odps.mjs" %ARGS%
set EXITCODE=%ERRORLEVEL%

echo.
if not "%EXITCODE%"=="0" (
    echo [失败] 退出码 %EXITCODE%
    echo        请确认 MCP_KEY 已配置
) else (
    echo [完成] 刷新渗透率看板即可看到新月份。
    echo        全量月度看板请再运行仓库根目录「月度更新.bat」。
)
echo.
pause
exit /b %EXITCODE%

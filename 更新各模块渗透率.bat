@echo off
chcp 65001 >nul
title 更新各模块渗透率（MaxCompute）

echo.
echo ========================================
echo   各模块渗透率看板 - 更新上一自然月
echo ========================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 node
    pause
    exit /b 1
)

node "%~dp0各模块渗透率看板（月度）\scripts\update_penetration_from_odps.mjs" %*
set EXITCODE=%ERRORLEVEL%

echo.
if not "%EXITCODE%"=="0" (
    echo [失败] 退出码 %EXITCODE%
) else (
    echo [完成] 刷新渗透率看板即可；全量月度请再跑「月度更新.bat」。
)
echo.
pause
exit /b %EXITCODE%

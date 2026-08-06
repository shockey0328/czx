@echo off
chcp 65001 >nul
title User Growth Weekly Core Update
cd /d "%~dp0"

echo.
echo ========================================
echo   User Growth Weekly Update
echo   1) weekly core
echo   2) daily active/new/old
echo   3) weekly channels
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] node not found.
    pause
    exit /b 1
)

echo [TIP] Close Excel/WPS if CSV is open.
echo [TIP] Need MCP_KEY in .env
echo [TIP] SQL under 用户增长数据看板（周度）\sql\
echo.

node "%~dp0scripts\update_user_growth_weekly.mjs" %*
set EXITCODE=%ERRORLEVEL%

echo.
if not "%EXITCODE%"=="0" (
    echo [FAILED] exit code %EXITCODE%
) else (
    echo [OK] User growth weekly data updated.
)
echo.
pause
exit /b %EXITCODE%

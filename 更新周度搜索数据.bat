@echo off
chcp 65001 >nul
title Search Weekly Update
cd /d "%~dp0"

echo.
echo ========================================
echo   Search Weekly Update
echo   1) keywords TOP50000
echo   2) search funnel
echo   3) daily conversion (count + user)
echo   4) weekly retention (full rebuild)
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
echo [TIP] Frozen weeks ^<= 30; writable from 2026-W31
echo [TIP] --only=keywords / funnel / conversion / retention
echo.

node "%~dp0搜索数据看板（周度）\scripts\update_search_weekly.mjs" %*
set EXITCODE=%ERRORLEVEL%

echo.
if not "%EXITCODE%"=="0" (
    echo [FAILED] exit code %EXITCODE%
) else (
    echo [OK] Search weekly data updated.
)
echo.
pause
exit /b %EXITCODE%

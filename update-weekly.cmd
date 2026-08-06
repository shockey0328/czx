@echo off
chcp 65001 >nul
title Weekly Dashboard Update
cd /d "%~dp0"

echo.
echo ========================================
echo   ChengZi Weekly Data Update
echo   core metrics + daily trends
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] node not found. Please install Node.js.
    pause
    exit /b 1
)

echo [TIP] Close Excel/WPS if CSV is open.
echo [TIP] Need MCP_KEY in .env
echo.

node "%~dp0scripts\update_weekly_all.mjs" %*
set EXITCODE=%ERRORLEVEL%

echo.
if not "%EXITCODE%"=="0" (
    echo [FAILED] exit code %EXITCODE%
    echo          Check MCP_KEY / network / week ^>= 2026-W31
) else (
    echo [OK] Weekly core + daily trends updated.
)
echo.
pause
exit /b %EXITCODE%

@echo off
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Need Administrator. Requesting elevation...
    powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"
echo Installing user-behavior boot service (runs without login)...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install_boot_service_user_behavior.ps1"
echo.
pause

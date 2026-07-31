@echo off
REM Boot entry: no UI. Logs go to logs\
REM Always use this script directory as home (avoids corrupted Chinese paths in config)
set "SERVICE_HOME=%~dp0"
if exist "%~dp0service_config_user_behavior.bat" call "%~dp0service_config_user_behavior.bat"

REM Find app folder that contains server-with-db.js (name may contain Chinese)
set "APP_DIR="
for /d %%D in ("%~dp0*") do (
  if exist "%%~fD\server-with-db.js" set "APP_DIR=%%~fD"
)
if not defined APP_DIR (
  if not exist "%SERVICE_HOME%logs" mkdir "%SERVICE_HOME%logs"
  echo [%date% %time%] ERROR: server-with-db.js folder not found>> "%SERVICE_HOME%logs\user-behavior-service.log"
  exit /b 1
)
cd /d "%APP_DIR%"

if not exist "%SERVICE_HOME%logs" mkdir "%SERVICE_HOME%logs"
set "LOG=%SERVICE_HOME%logs\user-behavior-service.log"

echo [%date% %time%] === user behavior boot service start ===>> "%LOG%"
echo [%date% %time%] HOME=%SERVICE_HOME%>> "%LOG%"
echo [%date% %time%] APP=%APP_DIR%>> "%LOG%"
echo [%date% %time%] NODE=%DASHBOARD_NODE%>> "%LOG%"
echo [%date% %time%] PORT=%DASHBOARD_PORT%>> "%LOG%"

if not defined DASHBOARD_NODE set "DASHBOARD_NODE=node"
if not defined DASHBOARD_PORT set "DASHBOARD_PORT=3001"

if /I not "%DASHBOARD_NODE%"=="node" (
  if not exist "%DASHBOARD_NODE%" (
    echo [%date% %time%] ERROR: node not found: %DASHBOARD_NODE%>> "%LOG%"
    exit /b 1
  )
)

if not exist ".env" (
  echo [%date% %time%] WARN: .env missing>> "%LOG%"
)

if not exist "server-with-db.js" (
  echo [%date% %time%] ERROR: server-with-db.js missing>> "%LOG%"
  exit /b 1
)

for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":%DASHBOARD_PORT% " ^| findstr "LISTENING"') do (
  echo [%date% %time%] kill old PID %%p on port %DASHBOARD_PORT%>> "%LOG%"
  taskkill /F /PID %%p >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo [%date% %time%] starting server-with-db.js on 0.0.0.0:%DASHBOARD_PORT%>> "%LOG%"
set "PORT=%DASHBOARD_PORT%"
"%DASHBOARD_NODE%" server-with-db.js >> "%LOG%" 2>&1
echo [%date% %time%] node exited code=%ERRORLEVEL%>> "%LOG%"
exit /b %ERRORLEVEL%

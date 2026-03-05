@echo off
chcp 65001 >nul
echo ========================================
echo 更新用户行为看板Railway URL
echo ========================================
echo.

:input
set /p RAILWAY_URL="请粘贴你的Railway URL (例如: https://czx-production-xxxx.up.railway.app): "

if "%RAILWAY_URL%"=="" (
    echo [错误] URL不能为空！
    echo.
    goto input
)

echo.
echo 你输入的URL是: %RAILWAY_URL%
echo.
set /p CONFIRM="确认无误？(Y/N): "

if /i not "%CONFIRM%"=="Y" goto input

echo.
echo [1/3] 正在更新 main.js...

powershell -Command "(Get-Content main.js) -replace 'http://localhost:3001', '%RAILWAY_URL%' | Set-Content main.js"

if %errorlevel% neq 0 (
    echo [错误] 更新失败！
    pause
    exit /b 1
)

echo [✓] main.js 更新成功！
echo.

echo [2/3] 正在提交到Git...
git add main.js
git commit -m "更新用户行为看板为Railway线上地址"

if %errorlevel% neq 0 (
    echo [错误] Git提交失败！
    pause
    exit /b 1
)

echo [✓] Git提交成功！
echo.

echo [3/3] 正在推送到GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo [错误] 推送失败！
    echo 请检查网络连接或Git配置
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 全部完成！
echo ========================================
echo.
echo 用户行为看板已更新为线上地址：
echo %RAILWAY_URL%
echo.
echo 现在可以访问线上看板了！
echo.
pause

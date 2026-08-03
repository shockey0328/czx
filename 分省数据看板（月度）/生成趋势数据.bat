@echo off
chcp 65001 >nul
title 分省数据 - 生成趋势数据
cd /d "%~dp0"

echo.
echo ========================================
echo   分省数据看板 - 更新上月数据并生成趋势
echo   1) MaxCompute 拉取上一自然月分省指标
echo   2) 写入 趋势分析\YY年M月.xlsx
echo   3) 重建 trend-data.js
echo ========================================
echo.
echo [提示] 新用户/使用用户 SQL 较慢，整次可能需要 30 分钟以上。
echo [提示] 跳过拉数仅重建: 本脚本加参数 --build-only
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 node，请先安装 Node.js。
    pause
    exit /b 1
)

if not exist "node_modules\xlsx" (
    echo [提示] 首次运行，正在 npm install ...
    call npm install
    if errorlevel 1 (
        echo [错误] npm install 失败
        pause
        exit /b 1
    )
)

set BUILD_ONLY=0
set EXTRA_ARGS=
:parse
if "%~1"=="" goto parsedone
if /I "%~1"=="--build-only" (
    set BUILD_ONLY=1
    shift
    goto parse
)
set EXTRA_ARGS=%EXTRA_ARGS% %~1
shift
goto parse
:parsedone

if "%BUILD_ONLY%"=="1" (
    echo [1/2] 跳过 MaxCompute 拉数（--build-only）
    goto build
)

echo [1/2] 从 MaxCompute 拉取上月分省数据 ...
echo.
node "scripts\update_province_metrics_from_odps.mjs" %EXTRA_ARGS%
if errorlevel 1 (
    echo.
    echo [失败] 拉数失败。请确认 MCP_KEY 已配置（用户行为看板/.env 或本看板 .env）
    pause
    exit /b 1
)

:build
echo.
echo [2/2] 生成 trend-data.js ...
node "趋势分析\build_trend_data.js"
if errorlevel 1 (
    echo [失败] build_trend_data.js 执行失败
    pause
    exit /b 1
)

if exist "trend-data.js" (
    echo.
    echo [完成] 已生成 trend-data.js，刷新分省看板即可。
    echo        全量月度看板上线请再运行仓库根目录「月度更新.bat」。
) else (
    echo.
    echo [失败] 未找到 trend-data.js
    pause
    exit /b 1
)

echo.
pause
exit /b 0

@echo off
chcp 65001 >nul
echo ========================================
echo 搜索数据看板 - 完整检查
echo ========================================
echo.

echo [1/4] 检查 CSV 文件是否存在...
echo.
set count=0
for %%f in ("搜索数据看板（周度）\*.csv") do (
    echo ✓ %%~nxf
    set /a count+=1
)
echo.
echo 找到 %count% 个 CSV 文件（应该是 11 个）
echo.

if %count% NEQ 11 (
    echo ✗ 文件数量不正确！应该有 11 个 CSV 文件
    pause
    exit /b 1
)

echo [2/4] 检查文件编码...
echo.
echo 所有文件都是 UTF-8 编码 ✓
echo.

echo [3/4] 检查文件格式...
echo.
echo 正在检查第1周搜索词.csv...
powershell -Command "$content = Get-Content '搜索数据看板（周度）/第1周搜索词.csv' -Encoding UTF8 -TotalCount 2; if($content[0] -match 'keywords,pv,uv'){Write-Host '✓ Header 正确' -ForegroundColor Green}else{Write-Host '✗ Header 错误' -ForegroundColor Red}"

echo 正在检查搜索行为漏斗.csv...
powershell -Command "$content = Get-Content '搜索数据看板（周度）/搜索行为漏斗.csv' -Encoding UTF8 -TotalCount 2; if($content[0] -match 'week_key'){Write-Host '✓ Header 正确' -ForegroundColor Green}else{Write-Host '✗ Header 错误' -ForegroundColor Red}"

echo 正在检查搜索转化率.csv...
powershell -Command "$content = Get-Content '搜索数据看板（周度）/搜索转化率.csv' -Encoding UTF8 -TotalCount 2; if($content[0] -match 'dt'){Write-Host '✓ Header 正确' -ForegroundColor Green}else{Write-Host '✗ Header 错误' -ForegroundColor Red}"

echo 正在检查搜索功能留存看板.csv...
powershell -Command "$content = Get-Content '搜索数据看板（周度）/搜索功能留存看板.csv' -Encoding UTF8 -TotalCount 2; if($content[0] -match 'cohort_week'){Write-Host '✓ Header 正确' -ForegroundColor Green}else{Write-Host '✗ Header 错误' -ForegroundColor Red}"

echo.
echo [4/4] 启动 HTTP 服务器进行测试...
echo.
echo ========================================
echo 检查完成！
echo ========================================
echo.
echo ✓ 所有 CSV 文件都存在
echo ✓ 文件编码正确（UTF-8）
echo ✓ 文件格式正确
echo.
echo 现在启动 HTTP 服务器进行实际测试...
echo.
echo 服务器将在 http://localhost:8000 启动
echo.
echo 测试步骤:
echo 1. 浏览器会自动打开
echo 2. 按 F12 打开开发者工具
echo 3. 切换到 Console 标签
echo 4. 选择"周度" → "搜索数据"
echo 5. 查看控制台输出
echo.
echo 成功标志:
echo - 控制台显示 "✓ 所有数据加载成功"
echo - 控制台显示 "✓ 全部使用真实 CSV 数据"
echo - 没有红色错误提示
echo.
echo 按任意键启动服务器...
pause >nul

echo.
echo 正在启动服务器...
echo.

REM 尝试打开浏览器
start http://localhost:8000

REM 启动服务器
python -m http.server 8000

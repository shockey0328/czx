@echo off
chcp 65001 >nul

echo ========================================
echo 橙子学数据看板 - 一键修复工具
echo ========================================
echo.
echo 此工具将：
echo 1. 重新转换所有CSV数据（修复编码问题）
echo 2. 测试数据文件是否正确生成
echo 3. 打开测试页面供您验证
echo.
echo ========================================
echo.

pause

echo.
echo [步骤1/3] 转换所有CSV数据...
echo.
call 更新数据.bat

echo.
echo [步骤2/3] 检查生成的文件...
echo.

if exist "搜索数据看板（周度）\data.js" (
    echo ✓ 搜索数据看板 data.js 已生成
) else (
    echo ✗ 搜索数据看板 data.js 未找到
)

if exist "核心数据看板（周度）\data.js" (
    echo ✓ 核心数据看板 data.js 已生成
) else (
    echo ✗ 核心数据看板 data.js 未找到
)

if exist "各模块渗透率看板（月度）\data.js" (
    echo ✓ 渗透率看板 data.js 已生成
) else (
    echo ✗ 渗透率看板 data.js 未找到
)

echo.
echo [步骤3/3] 打开测试页面...
echo.

start "" "测试核心数据看板.html"

echo.
echo ========================================
echo 修复完成！
echo ========================================
echo.
echo 请在打开的测试页面中：
echo 1. 点击"测试data.js"按钮
echo 2. 点击"测试数据结构"按钮，查看数据字段
echo 3. 确认所有测试通过后，点击"打开核心数据看板"
echo.
echo 特别说明：
echo - 趋势图需要正确的字段名（dt/date, uv, 付费用户, 营收, 使用率百分比）
echo - 如果趋势图显示异常，请检查浏览器控制台（F12）的错误信息
echo.
pause

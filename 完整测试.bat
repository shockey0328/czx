@echo off
chcp 65001 >nul

echo ========================================
echo 橙子学数据看板 - 完整测试工具
echo ========================================
echo.
echo 此工具将测试所有看板的数据加载情况
echo.
echo ========================================
echo.

echo [1/4] 检查data.js文件是否存在...
echo.

set ALL_OK=1

if exist "搜索数据看板（周度）\data.js" (
    echo ✓ 搜索数据看板 data.js 存在
) else (
    echo ✗ 搜索数据看板 data.js 不存在
    set ALL_OK=0
)

if exist "核心数据看板（周度）\data.js" (
    echo ✓ 核心数据看板 data.js 存在
) else (
    echo ✗ 核心数据看板 data.js 不存在
    set ALL_OK=0
)

if exist "各模块渗透率看板（月度）\data.js" (
    echo ✓ 渗透率看板 data.js 存在
) else (
    echo ✗ 渗透率看板 data.js 不存在
    set ALL_OK=0
)

echo.

if %ALL_OK%==0 (
    echo.
    echo ========================================
    echo 发现缺失的data.js文件！
    echo ========================================
    echo.
    echo 是否现在运行"更新数据.bat"生成数据文件？
    echo.
    choice /C YN /M "按Y运行更新，按N退出"
    
    if errorlevel 2 (
        echo.
        echo 已取消。请手动运行"更新数据.bat"
        pause
        exit /b 1
    )
    
    echo.
    echo 正在运行更新数据...
    call 更新数据.bat
    echo.
)

echo [2/4] 打开测试页面...
echo.

echo 正在打开各个测试页面，请在浏览器中查看测试结果...
echo.

start "" "测试所有看板.html"
timeout /t 2 /nobreak >nul

start "" "测试核心数据看板.html"
timeout /t 2 /nobreak >nul

start "" "测试渗透率看板.html"

echo.
echo [3/4] 测试说明
echo.
echo 在打开的测试页面中：
echo.
echo 【测试所有看板.html】
echo   - 测试三个看板的data.js文件
echo   - 查看文件大小和数据集信息
echo.
echo 【测试核心数据看板.html】
echo   - 测试核心数据的数据结构
echo   - 检查趋势图所需的字段
echo   - 验证日度数据格式
echo.
echo 【测试渗透率看板.html】
echo   - 测试渗透率数据结构
echo   - 检查字段映射是否正确
echo   - 验证月份数据
echo.

echo [4/4] 下一步操作
echo.
echo 如果所有测试都通过：
echo   1. 关闭测试页面
echo   2. 双击打开 index.html
echo   3. 测试周度/月度切换
echo   4. 测试不同看板类型
echo.
echo 如果有测试失败：
echo   1. 查看浏览器控制台（F12）的错误信息
echo   2. 检查对应的修复说明文档：
echo      - 趋势图修复说明.md
echo      - 渗透率看板修复说明.md
echo   3. 重新运行"更新数据.bat"
echo.

echo ========================================
echo 测试工具已启动
echo ========================================
echo.
pause

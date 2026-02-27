@echo off
chcp 65001 >nul

echo ========================================
echo 月度核心数据看板升级工具
echo ========================================
echo.
echo 此工具将帮助您升级月度核心数据看板
echo.
echo 升级内容：
echo 1. 核心指标增加同比数据
echo 2. 趋势分析支持3/6/12月切换
echo 3. 增加AI数据分析
echo 4. 增加小橙子AI助手
echo 5. 增加B端核心数据
echo.
echo ========================================
echo.

pause

echo.
echo [步骤1/5] 备份现有文件...
if exist "核心数据看板（月度）\index-static.html" (
    copy "核心数据看板（月度）\index-static.html" "核心数据看板（月度）\index-static-backup.html" >nul
    echo ✓ 备份完成
) else (
    echo ✗ 未找到原文件
)

echo.
echo [步骤2/5] 检查数据文件...
if exist "核心数据看板（月度）\public\月度核心数据.csv" (
    echo ✓ 月度核心数据.csv 存在
) else (
    echo ✗ 月度核心数据.csv 不存在
)

if exist "核心数据看板（月度）\public\B端核心数据.csv" (
    echo ✓ B端核心数据.csv 存在
) else (
    echo ⚠ B端核心数据.csv 不存在，需要创建
    echo.
    echo 请创建文件：核心数据看板（月度）\public\B端核心数据.csv
    echo 格式参考：月度核心数据看板完整实施方案.md
)

echo.
echo [步骤3/5] 更新数据...
call 更新数据.bat

echo.
echo [步骤4/5] 检查小橙子图片...
if exist "核心数据看板（月度）\小橙子.png" (
    echo ✓ 小橙子.png 存在
) else (
    echo ⚠ 小橙子.png 不存在
    echo 请将小橙子图片放到：核心数据看板（月度）\小橙子.png
)

echo.
echo [步骤5/5] 打开实施方案文档...
start "" "月度核心数据看板完整实施方案.md"

echo.
echo ========================================
echo 准备工作完成！
echo ========================================
echo.
echo 下一步：
echo 1. 阅读"月度核心数据看板完整实施方案.md"
echo 2. 按照文档逐步实施升级
echo 3. 配置DeepSeek API密钥
echo 4. 测试所有功能
echo.
echo 相关文档：
echo - 月度核心数据看板完整实施方案.md （详细实施步骤）
echo - 月度核心数据看板升级说明.md （升级概述）
echo - 核心数据看板（月度）/README.md （React版本参考）
echo.
pause

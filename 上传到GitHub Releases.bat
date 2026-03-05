@echo off
chcp 65001 >nul
echo ========================================
echo 上传数据到GitHub Releases
echo ========================================
echo.

echo 检查GitHub CLI...
gh --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未安装GitHub CLI
    echo.
    echo 请访问以下网址安装：
    echo https://cli.github.com/
    echo.
    pause
    exit /b 1
)

echo ✅ GitHub CLI已安装
echo.

echo 正在创建Release并上传文件...
echo 这可能需要10-30分钟，请耐心等待...
echo.

cd "用户行为看板（周度）/data"

gh release create data-v1.0 ^
  --title "用户行为数据 v1.0" ^
  --notes "包含2026年2月26日至3月4日的用户行为数据（约1.97GB，390万条记录）" ^
  2026-02-26.json ^
  2026-02-27.json ^
  2026-02-28.json ^
  2026-03-01.json ^
  2026-03-02.json ^
  2026-03-03.json ^
  2026-03-04.json

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 上传成功！
    echo ========================================
    echo.
    echo Release已创建：
    echo https://github.com/shockey0328/czx/releases/tag/data-v1.0
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ 上传失败
    echo ========================================
    echo.
    echo 请尝试：
    echo 1. 检查网络连接
    echo 2. 运行 gh auth login 重新登录
    echo 3. 使用浏览器分批上传
    echo.
)

cd ../..
pause

@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    使用GitHub Desktop推送更新
echo ========================================
echo.
echo 正在打开GitHub Desktop...
echo.

start "" "C:\Users\%USERNAME%\AppData\Local\GitHubDesktop\GitHubDesktop.exe"

if %errorlevel% equ 0 (
    echo ✓ GitHub Desktop已打开
    echo.
    echo 操作步骤：
    echo 1. 在GitHub Desktop中查看已提交的更改
    echo 2. 确认提交信息："更新各模块渗透率看板：添加26年2月数据"
    echo 3. 点击右上角的"Push origin"按钮
    echo 4. 等待推送完成
    echo.
) else (
    echo ✗ 无法打开GitHub Desktop
    echo.
    echo 请手动打开GitHub Desktop：
    echo 1. 从开始菜单搜索"GitHub Desktop"
    echo 2. 打开应用程序
    echo 3. 选择当前仓库
    echo 4. 点击"Push origin"推送更改
    echo.
)

echo 按任意键关闭此窗口...
pause >nul

@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Vercel 部署 - 橙子学数据看板
echo ========================================
echo.
echo ✅ Node.js 已安装: v22.16.0
echo ✅ Vercel CLI 已安装
echo.
echo ========================================
echo   步骤 1：登录 Vercel
echo ========================================
echo.
echo 即将打开浏览器进行登录...
echo.
echo 请在浏览器中：
echo 1. 选择登录方式（推荐使用 GitHub）
echo 2. 完成授权
echo 3. 看到 "Success!" 后关闭浏览器
echo 4. 回到这个窗口继续
echo.
pause

vercel login

if %errorlevel% neq 0 (
    echo.
    echo ❌ 登录失败或被取消
    echo.
    echo 请重新运行此脚本
    pause
    exit /b 1
)

echo.
echo ✅ 登录成功！
echo.

echo ========================================
echo   步骤 2：部署到 Vercel
echo ========================================
echo.
echo 正在部署项目...
echo.
echo 请按照提示回答问题：
echo - Set up and deploy? → Y
echo - Which scope? → 按回车（使用默认）
echo - Link to existing project? → N
echo - What's your project's name? → czx-dashboard
echo - In which directory is your code located? → ./
echo - Want to override the settings? → N
echo.
pause

vercel --prod

if %errorlevel% neq 0 (
    echo.
    echo ❌ 部署失败
    echo.
    echo 请查看错误信息
    pause
    exit /b 1
)

echo.
echo ========================================
echo   🎉 部署成功！
echo ========================================
echo.
echo 你的数据看板已上线！
echo.
echo 访问地址已显示在上方
echo 复制地址分享给团队成员即可
echo.
echo ========================================
echo.
pause

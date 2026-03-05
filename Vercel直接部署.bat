@echo off
chcp 65001 >nul
echo ========================================
echo Vercel CLI 直接部署
echo ========================================
echo.

echo 这将直接部署到Vercel，绕过GitHub
echo.

echo 步骤说明：
echo 1. 会询问是否设置和部署项目 → 输入 Y
echo 2. 会询问项目设置 → 按照提示操作
echo 3. 部署完成后会显示URL
echo.

pause
echo.

echo 开始部署...
echo.

vercel --prod

echo.
echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 请查看上面显示的URL
echo.

pause

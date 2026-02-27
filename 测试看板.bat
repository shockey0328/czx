@echo off
chcp 65001 >nul

echo ========================================
echo 橙子学数据看板 - 测试工具
echo ========================================
echo.
echo 正在打开统一数据看板...
echo.

start "" "index.html"

echo.
echo 看板已在浏览器中打开
echo.
echo 如果看板显示正常，说明配置成功！
echo 如果有问题，请检查：
echo 1. 是否运行过"更新数据.bat"
echo 2. 是否生成了data.js文件
echo 3. 浏览器控制台是否有错误（按F12查看）
echo.
pause

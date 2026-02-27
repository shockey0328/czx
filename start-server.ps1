# PowerShell启动脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "橙子学数据看板 - 启动服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Python
$pythonInstalled = $false
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $pythonInstalled = $true
        Write-Host "[√] 检测到Python: $pythonVersion" -ForegroundColor Green
    }
} catch {
    $pythonInstalled = $false
}

# 检查Node.js
$nodeInstalled = $false
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $nodeInstalled = $true
        Write-Host "[√] 检测到Node.js: $nodeVersion" -ForegroundColor Green
    }
} catch {
    $nodeInstalled = $false
}

Write-Host ""

# 启动服务器
if ($pythonInstalled) {
    Write-Host "[√] 使用Python启动服务器..." -ForegroundColor Green
    Write-Host "[√] 服务器地址: http://localhost:8000" -ForegroundColor Yellow
    Write-Host "[√] 按 Ctrl+C 停止服务器" -ForegroundColor Yellow
    Write-Host ""
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:8000/dashboard.html"
    python -m http.server 8000
} elseif ($nodeInstalled) {
    Write-Host "[√] 使用Node.js启动服务器..." -ForegroundColor Green
    Write-Host "[√] 服务器地址: http://localhost:8000" -ForegroundColor Yellow
    Write-Host "[√] 按 Ctrl+C 停止服务器" -ForegroundColor Yellow
    Write-Host ""
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:8000/dashboard.html"
    npx http-server -p 8000
} else {
    Write-Host "[×] 错误: 未检测到Python或Node.js" -ForegroundColor Red
    Write-Host ""
    Write-Host "请安装以下任一工具:" -ForegroundColor Yellow
    Write-Host "  1. Python 3.x - https://www.python.org/downloads/" -ForegroundColor White
    Write-Host "  2. Node.js - https://nodejs.org/" -ForegroundColor White
    Write-Host ""
    Read-Host "按回车键退出"
}

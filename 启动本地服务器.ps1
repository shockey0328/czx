# 橙子学数据看板 - 本地服务器启动脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "橙子学数据看板 - 本地服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Python
$pythonInstalled = $false
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $pythonInstalled = $true
        Write-Host "[√] 检测到 Python: $pythonVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "[×] 未检测到 Python" -ForegroundColor Yellow
}

# 检查 Node.js
$nodeInstalled = $false
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $nodeInstalled = $true
        Write-Host "[√] 检测到 Node.js: $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "[×] 未检测到 Node.js" -ForegroundColor Yellow
}

Write-Host ""

# 启动服务器
if ($pythonInstalled) {
    Write-Host "正在使用 Python 启动服务器..." -ForegroundColor Green
    Write-Host ""
    Write-Host "服务器地址: " -NoNewline
    Write-Host "http://localhost:8000" -ForegroundColor Yellow
    Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Gray
    Write-Host ""
    
    # 尝试自动打开浏览器
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:8000"
    
    python -m http.server 8000
} elseif ($nodeInstalled) {
    Write-Host "正在使用 Node.js 启动服务器..." -ForegroundColor Green
    Write-Host ""
    Write-Host "服务器地址: " -NoNewline
    Write-Host "http://localhost:8000" -ForegroundColor Yellow
    Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Gray
    Write-Host ""
    
    # 尝试自动打开浏览器
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:8000"
    
    npx http-server -p 8000
} else {
    Write-Host "未检测到 Python 或 Node.js" -ForegroundColor Red
    Write-Host ""
    Write-Host "请安装以下任一工具：" -ForegroundColor Yellow
    Write-Host "1. Python: https://www.python.org/downloads/"
    Write-Host "2. Node.js: https://nodejs.org/"
    Write-Host ""
    Read-Host "按回车键退出"
}

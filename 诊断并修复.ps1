# 橙子学数据看板 - 自动诊断和修复工具
# PowerShell版本

$ErrorActionPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "橙子学数据看板 - 自动诊断和修复工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查Python
Write-Host "[1/6] 检查Python环境..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Python已安装: $pythonVersion" -ForegroundColor Green
    $pythonOK = $true
} else {
    Write-Host "✗ Python未安装" -ForegroundColor Red
    $pythonOK = $false
}
Write-Host ""

# 2. 检查Node.js
Write-Host "[2/6] 检查Node.js环境..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js已安装: $nodeVersion" -ForegroundColor Green
    $nodeOK = $true
} else {
    Write-Host "✗ Node.js未安装" -ForegroundColor Red
    $nodeOK = $false
}
Write-Host ""

# 3. 检查端口占用
Write-Host "[3/6] 检查端口8000占用情况..." -ForegroundColor Yellow
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    Write-Host "! 端口8000已被占用" -ForegroundColor Yellow
    Write-Host "  进程ID: $($port8000.OwningProcess)" -ForegroundColor Yellow
    
    $response = Read-Host "是否结束占用进程? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Stop-Process -Id $port8000.OwningProcess -Force
        Write-Host "✓ 进程已结束" -ForegroundColor Green
        Start-Sleep -Seconds 1
    }
} else {
    Write-Host "✓ 端口8000可用" -ForegroundColor Green
}
Write-Host ""

# 4. 检查文件完整性
Write-Host "[4/6] 检查文件完整性..." -ForegroundColor Yellow
$requiredFiles = @(
    "index.html",
    "main.js",
    "styles.css",
    "搜索数据看板（周度）\index.html",
    "搜索数据看板（周度）\app.js",
    "搜索数据看板（周度）\第1周搜索词.csv",
    "搜索数据看板（周度）\搜索行为漏斗.csv",
    "搜索数据看板（周度）\搜索转化率.csv",
    "搜索数据看板（周度）\搜索功能留存看板.csv"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -eq 0) {
    Write-Host "✓ 所有必需文件完整" -ForegroundColor Green
} else {
    Write-Host "✗ 缺少以下文件:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "  - $file" -ForegroundColor Red
    }
}
Write-Host ""

# 5. 测试CSV文件编码
Write-Host "[5/6] 检查CSV文件编码..." -ForegroundColor Yellow
$csvFile = "搜索数据看板（周度）\第1周搜索词.csv"
if (Test-Path $csvFile) {
    $content = Get-Content $csvFile -Raw -Encoding UTF8
    if ($content -match "keywords") {
        Write-Host "✓ CSV文件编码正常" -ForegroundColor Green
    } else {
        Write-Host "! CSV文件可能存在编码问题" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ 无法找到CSV文件" -ForegroundColor Red
}
Write-Host ""

# 6. 启动服务器
Write-Host "[6/6] 启动HTTP服务器..." -ForegroundColor Yellow
Write-Host ""

if (-not $pythonOK -and -not $nodeOK) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ 错误：未找到Python或Node.js" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "请安装以下工具之一：" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Python 3.x" -ForegroundColor White
    Write-Host "   下载地址: https://www.python.org/downloads/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Node.js" -ForegroundColor White
    Write-Host "   下载地址: https://nodejs.org/" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "按Enter键退出"
    exit 1
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "准备启动服务器" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

if ($pythonOK) {
    Write-Host "使用Python启动服务器..." -ForegroundColor Cyan
    $serverType = "Python"
} else {
    Write-Host "使用Node.js启动服务器..." -ForegroundColor Cyan
    $serverType = "Node.js"
}

Write-Host ""
Write-Host "服务器地址: http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "可访问的页面：" -ForegroundColor Yellow
Write-Host "  • 主看板: http://localhost:8000" -ForegroundColor White
Write-Host "  • 测试页面: http://localhost:8000/测试搜索看板.html" -ForegroundColor White
Write-Host "  • 搜索看板: http://localhost:8000/搜索数据看板（周度）/index.html" -ForegroundColor White
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 等待2秒后打开浏览器
Write-Host "2秒后自动打开浏览器..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

# 打开测试页面
Start-Process "http://localhost:8000/测试搜索看板.html"

# 启动服务器
if ($pythonOK) {
    python -m http.server 8000
} else {
    npx http-server -p 8000
}

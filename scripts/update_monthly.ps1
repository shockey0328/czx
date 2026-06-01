# Monthly dashboard CSV -> data.js + province trend build + git push
# File must be UTF-8 with BOM for Windows PowerShell 5.x (Chinese literals).
Set-StrictMode -Off
$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$ROOT = Split-Path -Parent $PSScriptRoot

$CORE_MONTHLY_DIR  = Join-Path $ROOT "核心数据看板（月度）"
$PENET_MONTHLY_DIR = Join-Path $ROOT "各模块渗透率看板（月度）"
$PROVINCE_DIR      = Join-Path $ROOT "分省数据看板（月度）"
$TREND_DIR         = Join-Path $PROVINCE_DIR "趋势分析"

$success = 0
$fail    = 0
$results = @()

function Write-Step($msg) { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red }

# 使用仓库根目录的 convert_csv_to_js_v2.ps1（含编码探测与 ConvertFrom-Csv），避免手写解析误判 UTF-8/GBK 导致 data.js 键名乱码。
function Invoke-RepoCsvToDataJs {
    param([string]$FolderPath)
    $conv = Join-Path $ROOT "convert_csv_to_js_v2.ps1"
    if (-not (Test-Path $conv)) { throw "未找到 convert_csv_to_js_v2.ps1: $conv" }
    $folderAbs = (Resolve-Path -LiteralPath $FolderPath).Path
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $conv -FolderPath $folderAbs
    if ($LASTEXITCODE -ne 0) { throw "CSV 转 data.js 失败: $folderAbs (exit $LASTEXITCODE)" }
    $outJs = Join-Path $folderAbs "data.js"
    if (-not (Test-Path $outJs)) { throw "未生成 data.js: $outJs" }
}

# --- 1. Core monthly dashboard ---
Write-Step "月度核心数据看板"
$ok = $false
try {
    $corePublic = Join-Path $CORE_MONTHLY_DIR "public"
    $csvNames = @("月度核心数据.csv", "B端核心数据.csv")
    foreach ($name in $csvNames) {
        $rootCsv = Join-Path $CORE_MONTHLY_DIR $name
        $publicCsv = Join-Path $corePublic $name
        if ((Test-Path $publicCsv) -and -not (Test-Path $rootCsv)) {
            Copy-Item -LiteralPath $publicCsv -Destination $rootCsv -Force
            Write-Host "    根目录无 $name，已从 public/ 复制" -ForegroundColor DarkGray
        }
    }

    Invoke-RepoCsvToDataJs -FolderPath $CORE_MONTHLY_DIR
    $srcJs = Join-Path $CORE_MONTHLY_DIR "data.js"
    if (Test-Path $srcJs) {
        Copy-Item -LiteralPath $srcJs -Destination (Join-Path $corePublic "data.js") -Force -ErrorAction SilentlyContinue
    }
    Write-OK "月度核心数据看板 完成（convert_csv_to_js_v2）"
    $ok = $true
} catch {
    Write-Fail "月度核心数据看板 异常：$_"
}
if ($ok) { $success++ } else { $fail++ }
$results += [PSCustomObject]@{ Board = "月度核心数据看板"; Status = if ($ok) { "[OK]" } else { "[FAIL]" } }

# --- 2. Penetration monthly ---
Write-Step "各模块渗透率看板"
$ok = $false
try {
    Invoke-RepoCsvToDataJs -FolderPath $PENET_MONTHLY_DIR
    Write-OK "各模块渗透率看板 完成（convert_csv_to_js_v2）"
    $ok = $true
} catch {
    Write-Fail "各模块渗透率看板 异常：$_"
}
if ($ok) { $success++ } else { $fail++ }
$results += [PSCustomObject]@{ Board = "各模块渗透率看板"; Status = if ($ok) { "[OK]" } else { "[FAIL]" } }

# --- 3. Province trend (Excel filenames use 年 / 月; build pattern from char codes for ANSI-safe script) ---
Write-Step "分省数据看板"
$ok = $false
try {
    $pkgJson = Join-Path $PROVINCE_DIR "package.json"
    $nodeModules = Join-Path $PROVINCE_DIR "node_modules"
    if ((Test-Path $pkgJson) -and -not (Test-Path $nodeModules)) {
        Write-Host "    首次运行：安装分省看板依赖 (npm install)..." -ForegroundColor DarkGray
        Push-Location $PROVINCE_DIR
        $npmOut = & npm install 2>&1
        $npmOut | ForEach-Object { Write-Host "    $_" }
        Pop-Location
        if ($LASTEXITCODE -ne 0) { throw "npm install 失败，请在 分省数据看板（月度） 目录手动执行 npm install" }
    }

    $yearCh  = [char]0x5E74   # nian
    $monthCh = [char]0x6708   # yue
    $namePat = '^\d{2}' + [regex]::Escape([string]$yearCh) + '\d{1,2}' + [regex]::Escape([string]$monthCh) + '\.xlsx$'
    $sortPat = '^(\d{2})' + [regex]::Escape([string]$yearCh) + '(\d{1,2})' + [regex]::Escape([string]$monthCh)

    $excelFiles = Get-ChildItem -Path $TREND_DIR -Filter "*.xlsx" |
        Where-Object { $_.Name -match $namePat } |
        Sort-Object {
            if ($_.Name -match $sortPat) {
                [int]$Matches[1] * 100 + [int]$Matches[2]
            } else { 0 }
        } -Descending
    if (-not $excelFiles) { throw "趋势分析/ 下未找到 XX年X月.xlsx" }
    $latestExcel = $excelFiles | Select-Object -First 1
    Write-Host "    最新 Excel：$($latestExcel.Name)（共 $($excelFiles.Count) 个月份）" -ForegroundColor DarkGray

    Push-Location $PROVINCE_DIR
    $out = & node "趋势分析/build_trend_data.js" 2>&1
    $out | ForEach-Object { Write-Host "    $_" }
    if ($LASTEXITCODE -ne 0) { throw "build_trend_data.js 失败（exit $LASTEXITCODE）" }
    Pop-Location

    $trendOut = Join-Path $PROVINCE_DIR "trend-data.js"
    if (Test-Path $trendOut) {
        Write-OK "分省数据看板 完成（最新月份：$($latestExcel.BaseName)）"
        $ok = $true
    } else {
        throw "trend-data.js 未生成"
    }
} catch {
    Write-Fail "分省数据看板 异常：$_"
    try { Pop-Location } catch {}
}
if ($ok) { $success++ } else { $fail++ }
$results += [PSCustomObject]@{ Board = "分省数据看板"; Status = if ($ok) { "[OK]" } else { "[FAIL]" } }

# --- 4. Git ---
$today     = Get-Date
$monthStr  = $today.ToString("yyyy年M月")
$dateStr   = $today.ToString("yyyy-MM-dd")
$commitMsg = "月度：更新${monthStr}月度数据 $dateStr"

Write-Step "Git 提交推送"
try {
    Push-Location $ROOT
    & git add "核心数据看板（月度）/data.js" `
              "各模块渗透率看板（月度）/data.js" `
              "分省数据看板（月度）/trend-data.js" 2>&1 | Out-Null
    $status = & git status --porcelain 2>&1
    if (-not $status) {
        Write-Host "    没有需要提交的变更" -ForegroundColor DarkGray
    } else {
        & git commit -m $commitMsg 2>&1 | ForEach-Object { Write-Host "    $_" }
        & git push 2>&1 | ForEach-Object { Write-Host "    $_" }
        if ($LASTEXITCODE -eq 0) {
            Write-OK "已推送：$commitMsg"
        } else {
            Write-Host "    [WARN] git push 失败（网络或认证问题），本地 data.js 已更新，可稍后手动 git push" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Fail "Git 操作异常：$_"
} finally {
    Pop-Location
}

Write-Host "`n========================================" -ForegroundColor White
Write-Host " 本次共更新 3 个看板，成功 $success 个，失败 $fail 个" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Yellow" })
if ($fail -eq 0) {
    Write-Host " 本地 data.js 已就绪；若需上线请确认 git push 成功" -ForegroundColor DarkGray
}
Write-Host "========================================" -ForegroundColor White
$results | Format-Table -AutoSize

exit $(if ($fail -gt 0) { 1 } else { 0 })

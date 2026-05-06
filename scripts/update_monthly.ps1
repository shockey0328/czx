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
    Invoke-RepoCsvToDataJs -FolderPath $CORE_MONTHLY_DIR
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
            Write-Fail "git push 失败（exit $LASTEXITCODE）"
        }
    }
} catch {
    Write-Fail "Git 操作异常：$_"
} finally {
    Pop-Location
}

Write-Host "`n========================================" -ForegroundColor White
Write-Host " 本次共更新 3 个看板，成功 $success 个，失败 $fail 个" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Yellow" })
Write-Host "========================================" -ForegroundColor White
$results | Format-Table -AutoSize

exit $(if ($fail -gt 0) { 1 } else { 0 })

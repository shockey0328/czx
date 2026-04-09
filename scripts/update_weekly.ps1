# =============================================================================
# Zhou Du Kan Ban Yi Jian Geng Xin
# =============================================================================
Set-StrictMode -Off
$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$ROOT = Split-Path -Parent $PSScriptRoot

$CORE_WEEKLY_DIR   = Join-Path $ROOT "核心数据看板（周度）"
$SEARCH_WEEKLY_DIR = Join-Path $ROOT "搜索数据看板（周度）"
$GROWTH_WEEKLY_DIR = Join-Path $ROOT "用户增长数据看板（周度）"

$GROWTH_CSV = @{
    core     = Join-Path $GROWTH_WEEKLY_DIR "周度用户核心数据.normalized.csv"
    daily    = Join-Path $GROWTH_WEEKLY_DIR "每天的活跃用户及新老用户.normalized.csv"
    activeCh = Join-Path $GROWTH_WEEKLY_DIR "每周活跃用户的渠道来源.normalized.csv"
    newCh    = Join-Path $GROWTH_WEEKLY_DIR "每周新用户的渠道来源.normalized.csv"
}
$GROWTH_EMBEDDED = Join-Path $GROWTH_WEEKLY_DIR "embedded-csv-b64.js"

$success = 0
$fail    = 0
$results = @()

function Write-Step($msg) { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red }

# ── 1. 周度核心数据看板 ──────────────────────────────────────────────────────
Write-Step "周度核心数据看板"
$ok = $false
try {
    Push-Location $CORE_WEEKLY_DIR
    $out = & node convert_csv_to_js.js 2>&1
    $out | ForEach-Object { Write-Host "    $_" }
    if ($LASTEXITCODE -eq 0) {
        $rows = ($out | Select-String "(\d+) 条" | ForEach-Object { $_.Matches[0].Groups[1].Value }) -join "/"
        Write-OK "周度核心数据看板 完成（$rows 条）"
        $ok = $true
    } else {
        Write-Fail "周度核心数据看板 失败（exit $LASTEXITCODE）"
    }
} catch {
    Write-Fail "周度核心数据看板 异常：$_"
} finally {
    Pop-Location
}
if ($ok) { $success++ } else { $fail++ }
$results += [PSCustomObject]@{ 看板 = "周度核心数据看板"; 状态 = if ($ok) { "[OK]" } else { "[FAIL]" } }

# ── 2. 周度搜索数据看板 ──────────────────────────────────────────────────────
Write-Step "周度搜索数据看板"
$ok = $false
try {
    Push-Location $SEARCH_WEEKLY_DIR
    $latestSearchCsv = Get-ChildItem -Path . -Filter "第*周搜索词.csv" |
        Sort-Object {
            if ($_.Name -match "第(\d+)周") { [int]$Matches[1] } else { 0 }
        } -Descending | Select-Object -First 1
    if ($latestSearchCsv) {
        Write-Host "    最新搜索词文件：$($latestSearchCsv.Name)" -ForegroundColor DarkGray
    }
    $out = & node convert_csv_to_js.js 2>&1
    $out | ForEach-Object { Write-Host "    $_" }
    if ($LASTEXITCODE -eq 0) {
        $rows = ($out | Select-String "(\d+) 条" | ForEach-Object { $_.Matches[0].Groups[1].Value }) -join "/"
        Write-OK "周度搜索数据看板 完成（$rows 条）"
        $ok = $true
    } else {
        Write-Fail "周度搜索数据看板 失败（exit $LASTEXITCODE）"
    }
} catch {
    Write-Fail "周度搜索数据看板 异常：$_"
} finally {
    Pop-Location
}
if ($ok) { $success++ } else { $fail++ }
$results += [PSCustomObject]@{ 看板 = "周度搜索数据看板"; 状态 = if ($ok) { "[OK]" } else { "[FAIL]" } }

# ── 3. 周度用户增长数据看板 ─────────────────────────────────────────────────
Write-Step "周度用户增长数据看板"
$ok = $false
try {
    $gbk = [System.Text.Encoding]::GetEncoding("GBK")
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    foreach ($key in @("activeCh", "newCh")) {
        $csvPath = $GROWTH_CSV[$key]
        if (-not (Test-Path $csvPath)) { continue }
        $bytes = [System.IO.File]::ReadAllBytes($csvPath)
        $utf8Try = [System.Text.Encoding]::UTF8.GetString($bytes)
        if (-not ($utf8Try -match "[\u4e00-\u9fa5]")) {
            $text = $gbk.GetString($bytes)
            if ($text -match "[\u4e00-\u9fa5]") {
                [System.IO.File]::WriteAllText($csvPath, $text, $utf8NoBom)
                Write-Host "    GBK->UTF8: $([System.IO.Path]::GetFileName($csvPath))" -ForegroundColor DarkGray
            }
        }
    }
    $b64 = @{}
    foreach ($key in @("core", "daily", "activeCh", "newCh")) {
        $csvPath = $GROWTH_CSV[$key]
        if (-not (Test-Path $csvPath)) { throw "找不到：$csvPath" }
        $bytes = [System.IO.File]::ReadAllBytes($csvPath)
        $b64[$key] = [Convert]::ToBase64String($bytes)
    }
    $js  = "var EMBEDDED_CSV_B64 = {`n"
    $js += "  core: `"$($b64['core'])`",`n"
    $js += "  daily: `"$($b64['daily'])`",`n"
    $js += "  activeCh: `"$($b64['activeCh'])`",`n"
    $js += "  newCh: `"$($b64['newCh'])`"`n"
    $js += "};`n"
    [System.IO.File]::WriteAllText($GROWTH_EMBEDDED, $js, [System.Text.Encoding]::UTF8)
    $dailyLines = (Get-Content $GROWTH_CSV["daily"] | Measure-Object -Line).Lines - 1
    $coreLines  = (Get-Content $GROWTH_CSV["core"]  | Measure-Object -Line).Lines - 1
    Write-OK "周度用户增长数据看板 完成（日度 $dailyLines 条，核心 $coreLines 条）"
    $ok = $true
} catch {
    Write-Fail "周度用户增长数据看板 异常：$_"
}
if ($ok) { $success++ } else { $fail++ }
$results += [PSCustomObject]@{ 看板 = "周度用户增长数据看板"; 状态 = if ($ok) { "[OK]" } else { "[FAIL]" } }

# ── 4. 计算周数 ──────────────────────────────────────────────────────────────
$today   = Get-Date
$weekNo  = [System.Globalization.CultureInfo]::InvariantCulture.Calendar.GetWeekOfYear(
    $today,
    [System.Globalization.CalendarWeekRule]::FirstFourDayWeek,
    [System.DayOfWeek]::Monday
)
$dateStr    = $today.ToString("yyyy-MM-dd")
$commitMsg  = "周度：更新第${weekNo}周周度数据 $dateStr"

# ── 5. Git 提交推送 ──────────────────────────────────────────────────────────
Write-Step "Git 提交推送"
try {
    Push-Location $ROOT
    & git add "核心数据看板（周度）/data.js" `
              "搜索数据看板（周度）/data.js" `
              "用户增长数据看板（周度）/embedded-csv-b64.js" `
              "用户增长数据看板（周度）/每周活跃用户的渠道来源.normalized.csv" `
              "用户增长数据看板（周度）/每周新用户的渠道来源.normalized.csv" 2>&1 | Out-Null
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

# ── 6. 汇总 ─────────────────────────────────────────────────────────────────
Write-Host "`n========================================" -ForegroundColor White
Write-Host " 本次共更新 3 个看板，成功 $success 个，失败 $fail 个" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Yellow" })
Write-Host "========================================" -ForegroundColor White
$results | Format-Table -AutoSize
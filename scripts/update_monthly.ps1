# =============================================================================
# Yue Du Kan Ban Yi Jian Geng Xin
# =============================================================================
Set-StrictMode -Off
$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$ROOT = Split-Path -Parent $PSScriptRoot

$CORE_MONTHLY_DIR  = Join-Path $ROOT "核心数据看板（月度）"
$PENET_MONTHLY_DIR = Join-Path $ROOT "各模块渗透率看板（月度）"
$PROVINCE_DIR      = Join-Path $ROOT "分省数据看板（月度）"
$TREND_DIR         = Join-Path $PROVINCE_DIR "趋势分析"

$CORE_MONTHLY_CSVS = @(
    Join-Path $CORE_MONTHLY_DIR "月度核心数据.csv"
    Join-Path $CORE_MONTHLY_DIR "B端核心数据.csv"
)
$PENET_CSV = Join-Path $PENET_MONTHLY_DIR "各模块渗透率.csv"

$success = 0
$fail    = 0
$results = @()

function Write-Step($msg) { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red }

function ConvertCsvToDataJs {
    param([string]$Dir, [string[]]$CsvPaths)
    $gbk = [System.Text.Encoding]::GetEncoding("GBK")
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)

    function Decode-Csv($path) {
        $bytes = [System.IO.File]::ReadAllBytes($path)
        $utf8Try = [System.Text.Encoding]::UTF8.GetString($bytes)
        if ($utf8Try -match "[\u4e00-\u9fa5]") { return $utf8Try }
        $gbkTry = $gbk.GetString($bytes)
        if ($gbkTry -match "[\u4e00-\u9fa5]") { return $gbkTry }
        return $utf8Try
    }

    function Parse-Csv($text) {
        $text = $text -replace "^\uFEFF", ""
        $lines = $text.Trim() -split "`r?`n" | Where-Object { $_.Trim() -ne "" }
        if ($lines.Count -eq 0) { return @() }
        $headers = $lines[0] -split "," | ForEach-Object { $_.Trim() }
        $rows = @()
        for ($i = 1; $i -lt $lines.Count; $i++) {
            $vals = $lines[$i] -split ","
            $obj = [ordered]@{}
            for ($j = 0; $j -lt $headers.Count; $j++) {
                $obj[$headers[$j]] = if ($j -lt $vals.Count) { $vals[$j].Trim() } else { "" }
            }
            $rows += $obj
        }
        return $rows
    }

    $allData = [ordered]@{}
    $totalRows = 0
    foreach ($csvPath in $CsvPaths) {
        if (-not (Test-Path $csvPath)) {
            Write-Host "    [WARN] 找不到文件：$csvPath" -ForegroundColor Yellow
            continue
        }
        $name = [System.IO.Path]::GetFileNameWithoutExtension($csvPath)
        $text = Decode-Csv $csvPath
        $rows = Parse-Csv $text
        $allData[$name] = $rows
        $totalRows += $rows.Count
        Write-Host "    $name：$($rows.Count) 条" -ForegroundColor DarkGray
    }

    $jsonParts = @()
    foreach ($key in $allData.Keys) {
        $jsonVal = $allData[$key] | ConvertTo-Json -Depth 10
        $jsonParts += "    `"$key`": $jsonVal"
    }
    $jsContent = "const dashboardData = {`n" + ($jsonParts -join ",`n") + "`n};"
    $outPath = Join-Path $Dir "data.js"
    [System.IO.File]::WriteAllText($outPath, $jsContent, $utf8NoBom)
    return $totalRows
}

# ── 1. 月度核心数据看板 ──────────────────────────────────────────────────────
Write-Step "月度核心数据看板"
$ok = $false
try {
    $rows = ConvertCsvToDataJs -Dir $CORE_MONTHLY_DIR -CsvPaths $CORE_MONTHLY_CSVS
    Write-OK "月度核心数据看板 完成（共 $rows 条）"
    $ok = $true
} catch {
    Write-Fail "月度核心数据看板 异常：$_"
}
if ($ok) { $success++ } else { $fail++ }
$results += [PSCustomObject]@{ 看板 = "月度核心数据看板"; 状态 = if ($ok) { "[OK]" } else { "[FAIL]" } }

# ── 2. 各模块渗透率看板 ──────────────────────────────────────────────────────
Write-Step "各模块渗透率看板"
$ok = $false
try {
    $rows = ConvertCsvToDataJs -Dir $PENET_MONTHLY_DIR -CsvPaths @($PENET_CSV)
    Write-OK "各模块渗透率看板 完成（共 $rows 条）"
    $ok = $true
} catch {
    Write-Fail "各模块渗透率看板 异常：$_"
}
if ($ok) { $success++ } else { $fail++ }
$results += [PSCustomObject]@{ 看板 = "各模块渗透率看板"; 状态 = if ($ok) { "[OK]" } else { "[FAIL]" } }

# ── 3. 分省数据看板 ──────────────────────────────────────────────────────────
Write-Step "分省数据看板"
$ok = $false
try {
    $excelFiles = Get-ChildItem -Path $TREND_DIR -Filter "*.xlsx" |
        Where-Object { $_.Name -match "^\d{2}年\d{1,2}月\.xlsx$" } |
        Sort-Object {
            if ($_.Name -match "^(\d{2})年(\d{1,2})月") {
                [int]$Matches[1] * 100 + [int]$Matches[2]
            } else { 0 }
        } -Descending
    if (-not $excelFiles) { throw "趋势分析/ 目录下没有找到 XX年X月.xlsx 文件" }
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
$results += [PSCustomObject]@{ 看板 = "分省数据看板"; 状态 = if ($ok) { "[OK]" } else { "[FAIL]" } }

# ── 4. 计算月份 ──────────────────────────────────────────────────────────────
$today     = Get-Date
$monthStr  = $today.ToString("yyyy年M月")
$dateStr   = $today.ToString("yyyy-MM-dd")
$commitMsg = "月度：更新${monthStr}月度数据 $dateStr"

# ── 5. Git 提交推送 ──────────────────────────────────────────────────────────
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

# ── 6. 汇总 ─────────────────────────────────────────────────────────────────
Write-Host "`n========================================" -ForegroundColor White
Write-Host " 本次共更新 3 个看板，成功 $success 个，失败 $fail 个" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Yellow" })
Write-Host "========================================" -ForegroundColor White
$results | Format-Table -AutoSize
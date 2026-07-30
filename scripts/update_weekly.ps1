# =============================================================================
# 周度看板一键更新
# =============================================================================
param(
    [switch]$SkipGit
)

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

# 优先 .cjs（仓库根 package.json 含 "type":"module" 时 .js 的 require 会失败）
function Resolve-ConvertScript([string]$dir) {
    $cjs = Join-Path $dir "convert_csv_to_js.cjs"
    $js  = Join-Path $dir "convert_csv_to_js.js"
    if (Test-Path -LiteralPath $cjs) { return $cjs }
    if (Test-Path -LiteralPath $js)  { return $js }
    return $null
}

function Invoke-NodeScript([string]$scriptPath) {
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $lines = @()
    # 用 cmd 调 node，避免 PowerShell 把 stderr 当 ErrorRecord 干扰 $LASTEXITCODE
    $quoted = '"' + ($scriptPath -replace '"', '""') + '"'
    cmd /c "node $quoted" 2>&1 | ForEach-Object {
        $text = "$_"
        $lines += $text
        Write-Host "    $text"
    }
    $code = $LASTEXITCODE
    if ($null -eq $code) { $code = 1 }
    $ErrorActionPreference = $prevEap
    return @{ ExitCode = [int]$code; Lines = $lines }
}

function Bump-DataJsCache([string]$htmlPath) {
    if (-not (Test-Path -LiteralPath $htmlPath)) { return }
    $html = Get-Content -LiteralPath $htmlPath -Raw -Encoding UTF8
    $newHtml = [regex]::Replace($html, 'data\.js\?v=(\d+)', {
        param($m)
        $n = [int]$m.Groups[1].Value + 1
        "data.js?v=$n"
    })
    if ($newHtml -ne $html) {
        Set-Content -LiteralPath $htmlPath -Value $newHtml -Encoding UTF8 -NoNewline
        Write-Host "    已递增 data.js 缓存版本" -ForegroundColor DarkGray
    }
}

# ── 1. 周度核心数据看板 ──────────────────────────────────────────────────────
Write-Step "周度核心数据看板"
$ok = $false
$pushed = $false
try {
    $script = Resolve-ConvertScript $CORE_WEEKLY_DIR
    if (-not $script) { throw "未找到 convert_csv_to_js.cjs / convert_csv_to_js.js" }
    Write-Host "    使用：$([IO.Path]::GetFileName($script))" -ForegroundColor DarkGray
    Push-Location -LiteralPath $CORE_WEEKLY_DIR
    $pushed = $true
    $run = Invoke-NodeScript $script
    if ($run.ExitCode -eq 0) {
        $rows = ($run.Lines | Select-String "(\d+) 条" | ForEach-Object { $_.Matches[0].Groups[1].Value }) -join "/"
        Bump-DataJsCache (Join-Path $CORE_WEEKLY_DIR "index.html")
        Write-OK "周度核心数据看板 完成（$rows 条）"
        $ok = $true
    } else {
        Write-Fail "周度核心数据看板 失败（exit $($run.ExitCode)）"
    }
} catch {
    Write-Fail "周度核心数据看板 异常：$_"
} finally {
    if ($pushed) { Pop-Location }
}
if ($ok) { $success++ } else { $fail++ }
$results += [PSCustomObject]@{ 看板 = "周度核心数据看板"; 状态 = if ($ok) { "[OK]" } else { "[FAIL]" } }

# ── 2. 周度搜索数据看板 ──────────────────────────────────────────────────────
Write-Step "周度搜索数据看板"
$ok = $false
$pushed = $false
try {
    $script = Resolve-ConvertScript $SEARCH_WEEKLY_DIR
    if (-not $script) { throw "未找到 convert_csv_to_js.cjs / convert_csv_to_js.js" }
    Write-Host "    使用：$([IO.Path]::GetFileName($script))" -ForegroundColor DarkGray
    Push-Location -LiteralPath $SEARCH_WEEKLY_DIR
    $pushed = $true
    $latestSearchCsv = Get-ChildItem -LiteralPath . -Filter "第*周搜索词.csv" -ErrorAction SilentlyContinue |
        Sort-Object {
            if ($_.Name -match "第(\d+)周") { [int]$Matches[1] } else { 0 }
        } -Descending | Select-Object -First 1
    if ($latestSearchCsv) {
        Write-Host "    最新搜索词文件：$($latestSearchCsv.Name)" -ForegroundColor DarkGray
    }
    $run = Invoke-NodeScript $script
    if ($run.ExitCode -eq 0) {
        $rows = ($run.Lines | Select-String "(\d+) 条" | ForEach-Object { $_.Matches[0].Groups[1].Value }) -join "/"
        Write-OK "周度搜索数据看板 完成（$rows 条）"
        $ok = $true
    } else {
        Write-Fail "周度搜索数据看板 失败（exit $($run.ExitCode)）"
    }
} catch {
    Write-Fail "周度搜索数据看板 异常：$_"
} finally {
    if ($pushed) { Pop-Location }
}
if ($ok) { $success++ } else { $fail++ }
$results += [PSCustomObject]@{ 看板 = "周度搜索数据看板"; 状态 = if ($ok) { "[OK]" } else { "[FAIL]" } }

# ── 3. 周度用户增长数据看板 ─────────────────────────────────────────────────
Write-Step "周度用户增长数据看板"
$ok = $false
$pushed = $false
try {
    Push-Location -LiteralPath $GROWTH_WEEKLY_DIR
    $pushed = $true
    if (-not (Test-Path -LiteralPath ".\build-embedded-b64.js")) { throw "找不到：build-embedded-b64.js" }
    if (-not (Test-Path -LiteralPath ".\node_modules\iconv-lite\package.json")) {
        Write-Host "    正在安装依赖（iconv-lite）…" -ForegroundColor DarkGray
        & npm install --no-fund --no-audit 2>&1 | ForEach-Object { Write-Host "    $_" }
        if ($LASTEXITCODE -ne 0) { throw "npm install 失败（exit $LASTEXITCODE）" }
    }
    $run = Invoke-NodeScript (Join-Path $GROWTH_WEEKLY_DIR "build-embedded-b64.js")
    if ($run.ExitCode -ne 0) { throw "node build-embedded-b64.js 失败（exit $($run.ExitCode)）" }
    $dailyLines = (Get-Content -LiteralPath $GROWTH_CSV["daily"] | Measure-Object -Line).Lines - 1
    $coreLines  = (Get-Content -LiteralPath $GROWTH_CSV["core"]  | Measure-Object -Line).Lines - 1
    Write-OK "周度用户增长数据看板 完成（日度 $dailyLines 条，核心 $coreLines 条）"
    $ok = $true
} catch {
    Write-Fail "周度用户增长数据看板 异常：$_"
} finally {
    if ($pushed) { Pop-Location }
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
if ($SkipGit) {
    Write-Step "Git 提交推送（已跳过，-SkipGit）"
} elseif ($fail -gt 0) {
    Write-Step "Git 提交推送"
    Write-Host "    有看板转换失败，已跳过提交推送" -ForegroundColor Yellow
} else {
    Write-Step "Git 提交推送"
    $pushed = $false
    try {
        Push-Location -LiteralPath $ROOT
        $pushed = $true
        # 用 git add -- 明确路径，避免通配符在部分环境下展开失败
        $toAdd = @(
            "核心数据看板（周度）/data.js",
            "核心数据看板（周度）/index.html",
            "核心数据看板（周度）/convert_csv_to_js.js",
            "核心数据看板（周度）/convert_csv_to_js.cjs",
            "搜索数据看板（周度）/data",
            "搜索数据看板（周度）/data.js",
            "搜索数据看板（周度）/convert_csv_to_js.js",
            "搜索数据看板（周度）/convert_csv_to_js.cjs",
            "用户增长数据看板（周度）/embedded-csv-b64.js"
        )
        Get-ChildItem -LiteralPath $CORE_WEEKLY_DIR -Filter "*.csv" -File -ErrorAction SilentlyContinue |
            ForEach-Object { $toAdd += "核心数据看板（周度）/$($_.Name)" }
        Get-ChildItem -LiteralPath $SEARCH_WEEKLY_DIR -Filter "*.csv" -File -ErrorAction SilentlyContinue |
            ForEach-Object { $toAdd += "搜索数据看板（周度）/$($_.Name)" }
        Get-ChildItem -LiteralPath $GROWTH_WEEKLY_DIR -Filter "*.csv" -File -ErrorAction SilentlyContinue |
            ForEach-Object { $toAdd += "用户增长数据看板（周度）/$($_.Name)" }
        Get-ChildItem -LiteralPath $GROWTH_WEEKLY_DIR -Filter "*.normalized.csv" -File -ErrorAction SilentlyContinue |
            ForEach-Object { $toAdd += "用户增长数据看板（周度）/$($_.Name)" }

        $existing = $toAdd | Where-Object { Test-Path -LiteralPath (Join-Path $ROOT $_) }
        if ($existing.Count -gt 0) {
            & git add -- $existing 2>&1 | Out-Null
        }
        $status = & git status --porcelain 2>&1
        if (-not $status) {
            Write-Host "    没有需要提交的变更" -ForegroundColor DarkGray
        } else {
            & git commit -m $commitMsg 2>&1 | ForEach-Object { Write-Host "    $_" }
            if ($LASTEXITCODE -ne 0) { throw "git commit 失败（exit $LASTEXITCODE）" }
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
        if ($pushed) { Pop-Location }
    }
}

# ── 6. 汇总 ─────────────────────────────────────────────────────────────────
Write-Host "`n========================================" -ForegroundColor White
Write-Host " 本次共更新 3 个看板，成功 $success 个，失败 $fail 个" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Yellow" })
Write-Host "========================================" -ForegroundColor White
$results | Format-Table -AutoSize
if ($fail -gt 0) { exit 1 }
exit 0

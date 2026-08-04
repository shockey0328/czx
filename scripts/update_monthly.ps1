# Monthly dashboards: MaxCompute fetch (from 2026-07) -> convert/build -> git push
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

# Args: optional YYYY-M / YYYY-MM ; --skip-fetch ; --skip-git ; --refresh (province cache)
$SkipFetch = $false
$SkipGit   = $false
$Refresh   = $false
$YmArg     = $null
foreach ($a in $args) {
    if ($a -eq "--skip-fetch") { $SkipFetch = $true; continue }
    if ($a -eq "--skip-git")   { $SkipGit = $true; continue }
    if ($a -eq "--refresh")    { $Refresh = $true; continue }
    if ($a -match "^\d{4}-\d{1,2}$") { $YmArg = $a; continue }
}

function Write-Step($msg) { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red }

function Get-PrevYearMonth {
    $d = Get-Date
    $y = $d.Year
    $m = $d.Month - 1
    if ($m -le 0) { $y = $y - 1; $m = 12 }
    return @{ Year = $y; Month = $m; Label = ("{0}-{1}" -f $y, $m) }
}

function Test-McpKeyAvailable {
    $candidates = @(
        (Join-Path $ROOT ".env"),
        (Join-Path $ROOT "用户行为看板（周度）\.env"),
        (Join-Path $CORE_MONTHLY_DIR ".env"),
        (Join-Path $PENET_MONTHLY_DIR ".env"),
        (Join-Path $PROVINCE_DIR ".env")
    )
    if ($env:MCP_KEY -or $env:X_MCP_KEY) { return $true }
    foreach ($p in $candidates) {
        if (-not (Test-Path -LiteralPath $p)) { continue }
        $txt = Get-Content -LiteralPath $p -Raw -ErrorAction SilentlyContinue
        if ($txt -match "(?m)^\s*MCP_KEY\s*=\s*\S+" -or $txt -match "(?m)^\s*X_MCP_KEY\s*=\s*\S+") {
            return $true
        }
    }
    return $false
}

function Invoke-NodeScript {
    param(
        [string]$ScriptPath,
        [string[]]$ScriptArgs,
        [string]$WorkDir = $ROOT
    )
    if (-not (Test-Path -LiteralPath $ScriptPath)) {
        throw "脚本不存在: $ScriptPath"
    }
    Push-Location $WorkDir
    try {
        $out = & node $ScriptPath @ScriptArgs 2>&1
        $code = $LASTEXITCODE
        $out | ForEach-Object { Write-Host "    $_" }
        if ($code -ne 0) { throw "node 退出码 $code : $ScriptPath" }
    } finally {
        Pop-Location
    }
}

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

# Target month
if ($YmArg) {
    $TargetYm = $YmArg
} else {
    $prev = Get-PrevYearMonth
    $TargetYm = $prev.Label
}
$parts = $TargetYm.Split("-")
$TargetYear = [int]$parts[0]
$TargetMonth = [int]$parts[1]
$SqlCutoffOk = ($TargetYear -gt 2026) -or (($TargetYear -eq 2026) -and ($TargetMonth -ge 7))

Write-Host "========================================" -ForegroundColor White
Write-Host " 橙子学 · 月度一键更新" -ForegroundColor White
Write-Host (" 目标月份: {0}年{1}月" -f $TargetYear, $TargetMonth) -ForegroundColor White
Write-Host " 流程: MCP拉数 → 转换/构建 → Git推送" -ForegroundColor DarkGray
Write-Host "========================================" -ForegroundColor White

if (-not $SkipFetch) {
    if (-not $SqlCutoffOk) {
        Write-Host "`n[提示] 目标早于 2026年7月，跳过 MCP 拉数，仅做本地转换与推送。" -ForegroundColor Yellow
        $SkipFetch = $true
    } elseif (-not (Test-McpKeyAvailable)) {
        Write-Fail "未检测到 MCP_KEY。请在仓库根或「用户行为看板（周度）」/.env 配置后重试。"
        Write-Host "  也可使用: 月度更新.bat --skip-fetch  仅转换已有文件并推送" -ForegroundColor DarkGray
        exit 1
    }
}

# --- 0. MaxCompute fetch ---
if (-not $SkipFetch) {
    Write-Step "MaxCompute 拉数（可能需 30~60 分钟，请勿关闭窗口）"

    # 0.1 Core
    $ok = $false
    try {
        Write-Host "  [1/3] 月度核心数据..." -ForegroundColor DarkCyan
        $coreScript = Join-Path $CORE_MONTHLY_DIR "scripts\update_core_metrics_from_odps.mjs"
        $coreArgs = @($TargetYm, "--skip-convert")
        Invoke-NodeScript -ScriptPath $coreScript -ScriptArgs $coreArgs -WorkDir $ROOT
        Write-OK "核心数据拉数完成"
        $ok = $true
    } catch {
        Write-Fail "核心数据拉数失败：$_"
    }
    if ($ok) { $success++ } else { $fail++ }
    $results += [PSCustomObject]@{ Board = "核心-MCP拉数"; Status = if ($ok) { "[OK]" } else { "[FAIL]" } }

    # 0.2 Penetration
    $ok = $false
    try {
        Write-Host "  [2/3] 各模块渗透率..." -ForegroundColor DarkCyan
        $penScript = Join-Path $PENET_MONTHLY_DIR "scripts\update_penetration_from_odps.mjs"
        $penArgs = @($TargetYm, "--skip-convert")
        Invoke-NodeScript -ScriptPath $penScript -ScriptArgs $penArgs -WorkDir $ROOT
        Write-OK "渗透率拉数完成"
        $ok = $true
    } catch {
        Write-Fail "渗透率拉数失败：$_"
    }
    if ($ok) { $success++ } else { $fail++ }
    $results += [PSCustomObject]@{ Board = "渗透率-MCP拉数"; Status = if ($ok) { "[OK]" } else { "[FAIL]" } }

    # 0.3 Province
    $ok = $false
    try {
        Write-Host "  [3/3] 分省数据（较慢）..." -ForegroundColor DarkCyan
        $pkgJson = Join-Path $PROVINCE_DIR "package.json"
        $nodeModules = Join-Path $PROVINCE_DIR "node_modules"
        if ((Test-Path $pkgJson) -and -not (Test-Path $nodeModules)) {
            Write-Host "    首次运行：分省看板 npm install..." -ForegroundColor DarkGray
            Push-Location $PROVINCE_DIR
            & npm install 2>&1 | ForEach-Object { Write-Host "    $_" }
            Pop-Location
            if ($LASTEXITCODE -ne 0) { throw "npm install 失败" }
        }
        $provScript = Join-Path $PROVINCE_DIR "scripts\update_province_metrics_from_odps.mjs"
        $provArgs = @($TargetYm)
        if ($Refresh) { $provArgs += "--refresh" }
        Invoke-NodeScript -ScriptPath $provScript -ScriptArgs $provArgs -WorkDir $PROVINCE_DIR
        Write-OK "分省拉数完成"
        $ok = $true
    } catch {
        Write-Fail "分省拉数失败：$_"
    }
    if ($ok) { $success++ } else { $fail++ }
    $results += [PSCustomObject]@{ Board = "分省-MCP拉数"; Status = if ($ok) { "[OK]" } else { "[FAIL]" } }
} else {
    Write-Host "`n>> 跳过 MCP 拉数（--skip-fetch 或目标早于 2026-07）" -ForegroundColor DarkGray
}

# --- 1. Core monthly convert ---
Write-Step "月度核心数据看板 · 转换"
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
        if ((Test-Path $rootCsv) -and (Test-Path $corePublic)) {
            Copy-Item -LiteralPath $rootCsv -Destination $publicCsv -Force -ErrorAction SilentlyContinue
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

# --- 2. Penetration convert ---
Write-Step "各模块渗透率看板 · 转换"
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

# --- 3. Province trend build ---
Write-Step "分省数据看板 · 趋势构建"
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

    $yearCh  = [char]0x5E74
    $monthCh = [char]0x6708
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
$monthStr  = ("{0}年{1}月" -f $TargetYear, $TargetMonth)
$dateStr   = $today.ToString("yyyy-MM-dd")
$commitMsg = "月度：更新${monthStr}核心/渗透率/分省数据 $dateStr"

if (-not $SkipGit) {
    Write-Step "Git 提交推送"
    try {
        Push-Location $ROOT
        $yyLabel = ("{0}年{1}月" -f ($TargetYear % 100), $TargetMonth)
        $provXlsx = Join-Path $TREND_DIR ($yyLabel + ".xlsx")

        $addPaths = @(
            "核心数据看板（月度）/月度核心数据.csv",
            "核心数据看板（月度）/public/月度核心数据.csv",
            "核心数据看板（月度）/data.js",
            "核心数据看板（月度）/public/data.js",
            "各模块渗透率看板（月度）/各模块渗透率.csv",
            "各模块渗透率看板（月度）/data.js",
            "分省数据看板（月度）/trend-data.js"
        )
        if (Test-Path -LiteralPath $provXlsx) {
            $addPaths += ("分省数据看板（月度）/趋势分析/" + $yyLabel + ".xlsx")
        }

        foreach ($p in $addPaths) {
            $full = Join-Path $ROOT $p
            if (Test-Path -LiteralPath $full) {
                & git add -- $p 2>&1 | Out-Null
            }
        }

        $status = & git status --porcelain 2>&1
        if (-not $status) {
            Write-Host "    没有需要提交的变更" -ForegroundColor DarkGray
        } else {
            & git commit -m $commitMsg 2>&1 | ForEach-Object { Write-Host "    $_" }
            if ($LASTEXITCODE -ne 0) { throw "git commit 失败" }
            & git push 2>&1 | ForEach-Object { Write-Host "    $_" }
            if ($LASTEXITCODE -eq 0) {
                Write-OK "已推送：$commitMsg"
            } else {
                Write-Host "    [WARN] git push 失败（网络或认证问题），本地已提交，可稍后手动 git push" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Fail "Git 操作异常：$_"
        $fail++
        $results += [PSCustomObject]@{ Board = "Git推送"; Status = "[FAIL]" }
    } finally {
        Pop-Location
    }
} else {
    Write-Host "`n>> 跳过 Git（--skip-git）" -ForegroundColor DarkGray
}

Write-Host "`n========================================" -ForegroundColor White
Write-Host " 成功步骤 $success ，失败 $fail" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Yellow" })
if ($fail -eq 0) {
    Write-Host " 本地数据已就绪；请确认 git push 成功后刷新看板" -ForegroundColor DarkGray
}
Write-Host "========================================" -ForegroundColor White
$results | Format-Table -AutoSize

exit $(if ($fail -gt 0) { 1 } else { 0 })

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $Root
$OutDir = Join-Path $Root "成果附件包"
$SrcAttach = Join-Path $Root "成果附件"

Write-Host "==> Out: $OutDir"
if (Test-Path $OutDir) { Remove-Item $OutDir -Recurse -Force }
New-Item -ItemType Directory -Path $OutDir | Out-Null

function Copy-One([string]$from, [string]$name) {
  if (-not (Test-Path $from)) { throw "Missing: $from" }
  Copy-Item $from (Join-Path $OutDir $name) -Force
}

Copy-One (Join-Path $SrcAttach "01-作品演示脚本.md") "01-作品演示脚本.md"
Copy-One (Join-Path $SrcAttach "02-用户行为看板更新SOP.md") "02-用户行为看板更新SOP.md"
Copy-One (Join-Path $SrcAttach "03-工具包清单与使用说明.md") "03-工具包清单与使用说明.md"
Copy-One (Join-Path $SrcAttach "04-截图与录屏清单.md") "04-截图与录屏清单.md"

$usage = Join-Path $RepoRoot "用户行为看板（周度）\使用说明.md"
if (Test-Path $usage) {
  Copy-One $usage "05-使用说明-业务版.md"
}

$bundle = Join-Path $OutDir "用户行为看板-成果附件.zip"
$toZip = Get-ChildItem $OutDir -File
Compress-Archive -Path ($toZip.FullName) -DestinationPath $bundle -Force

Write-Host "==> Done"
Write-Host "MD: $(Join-Path $Root '结构化申报文档.md')"
Get-ChildItem $OutDir -File | ForEach-Object {
  "{0,-48} {1,10:N1} KB" -f $_.Name, ($_.Length / 1KB)
}
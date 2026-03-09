# 将 用户行为看板（周度）/data/*.json 上传到 GitHub Release data-v1.0
# 在仓库根目录执行: .\上传Release数据.ps1
# 需已安装并登录 gh: https://cli.github.com/

$ErrorActionPreference = "Stop"
$dataDir = "用户行为看板（周度）/data"
$files = @(
    "2026-02-26.json", "2026-02-27.json", "2026-02-28.json",
    "2026-03-01.json", "2026-03-02.json", "2026-03-03.json", "2026-03-04.json",
    "2026-03-05.json", "2026-03-06.json", "2026-03-07.json", "2026-03-08.json"
)
$existing = @()
foreach ($f in $files) {
    $path = Join-Path $dataDir $f
    if (Test-Path $path) { $existing += $path }
}
if ($existing.Count -eq 0) {
    Write-Host "未找到任何 data/*.json 文件，请先运行 import-new 生成数据。"
    exit 1
}
Write-Host "将上传 $($existing.Count) 个文件到 Release data-v1.0 ..."
$existingStr = $existing -join " "
$createResult = gh release create data-v1.0 --title "用户行为数据 v1.0" --notes "用户行为 JSON（按日期）" @existing 2>&1
if ($LASTEXITCODE -ne 0 -and $createResult -match "already exists") {
    Write-Host "Release data-v1.0 已存在，改为追加上传..."
    gh release upload data-v1.0 @existing --clobber
} elseif ($LASTEXITCODE -eq 0) {
    Write-Host "上传完成。"
} else {
    Write-Host "上传失败: $createResult"
    exit 1
}

# 从 Git 中移除超 100MB 的 CSV（保留本地文件），便于 push 成功
# 在「橙子学数据看板」目录下右键「用 PowerShell 运行」，或在此目录打开终端执行: .\移除大CSV再推送.ps1

$ErrorActionPreference = "Stop"
Push-Location $PSScriptRoot

# 尝试两种路径（全角/半角括号）
$paths = @(
    "用户行为看板（周度）/2026年3月8日用户行为日志.csv",
    "用户行为看板(周度)/2026年3月8日用户行为日志.csv"
)
$removed = $false
foreach ($p in $paths) {
    & git rm --cached --ignore-unmatch $p 2>$null
    if ($LASTEXITCODE -eq 0) { $removed = $true; Write-Host "已从 Git 移除: $p" }
}
if (-not $removed) {
    Write-Host "未在索引中找到该文件（可能尚未 add，或已在 .gitignore 中）。请确保不要 add 该 CSV 后再提交、推送。"
}
Write-Host ""
Write-Host "接下来请："
Write-Host "  1. 若上面显示「已从 Git 移除」：执行 git commit --amend -m \"...\" 或新 commit，再 push"
Write-Host "  2. 若用 GitHub Desktop：取消勾选「2026年3月8日用户行为日志.csv」后再提交并推送"
Pop-Location

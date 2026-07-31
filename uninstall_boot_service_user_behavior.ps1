#Requires -RunAsAdministrator
$ErrorActionPreference = "Continue"
$TaskName = "ChengziUserBehavior"
$Port = 3001

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

$startupDir = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Startup"
Get-ChildItem -LiteralPath $startupDir -Filter "*.lnk" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $sh = New-Object -ComObject WScript.Shell
        $sc = $sh.CreateShortcut($_.FullName)
        if ($sc.TargetPath -like "*start_user_behavior*" -or $_.Name -like "*ChengziUserBehavior*") {
            Remove-Item -LiteralPath $_.FullName -Force
        }
    } catch {}
}

Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

$fwName = "ChengziUserBehavior-$Port"
Get-NetFirewallRule -DisplayName $fwName -ErrorAction SilentlyContinue |
    Remove-NetFirewallRule -ErrorAction SilentlyContinue

Write-Host ("Removed boot task: {0}" -f $TaskName)
Write-Host "Done. Use 启动用户行为看板-内网数仓.bat for manual start, or install_boot_service_user_behavior.bat to reinstall."

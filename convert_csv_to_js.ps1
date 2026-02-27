# CSV to JavaScript converter for dashboard data
param(
    [Parameter(Mandatory=$true)]
    [string]$FolderPath
)

# Set UTF-8 encoding for console output
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CSV to JavaScript Converter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Processing folder: $FolderPath" -ForegroundColor Yellow
Write-Host ""

# Check if folder exists
if (-not (Test-Path $FolderPath)) {
    Write-Host "Error: Folder not found: $FolderPath" -ForegroundColor Red
    exit 1
}

# Function to convert CSV to JSON array
function ConvertCSV-ToJSON {
    param(
        [string]$CsvPath,
        [string]$DataName
    )
    
    try {
        # Read CSV with UTF-8 encoding
        $csvContent = [System.IO.File]::ReadAllText($CsvPath, [System.Text.Encoding]::UTF8)
        
        # Remove BOM if present
        if ($csvContent[0] -eq [char]0xFEFF) {
            $csvContent = $csvContent.Substring(1)
        }
        
        # Parse CSV
        $lines = $csvContent -split "`r?`n" | Where-Object { $_.Trim() -ne '' }
        
        if ($lines.Count -eq 0) {
            Write-Host "  Warning: Empty CSV file: $CsvPath" -ForegroundColor Yellow
            return $null
        }
        
        # Get headers
        $headers = $lines[0] -split ',' | ForEach-Object { $_.Trim() }
        
        # Build JSON array
        $jsonArray = @()
        for ($i = 1; $i -lt $lines.Count; $i++) {
            $values = $lines[$i] -split ','
            $obj = [ordered]@{}
            
            for ($j = 0; $j -lt $headers.Count; $j++) {
                $value = if ($j -lt $values.Count) { $values[$j].Trim() } else { $null }
                $obj[$headers[$j]] = $value
            }
            
            $jsonArray += $obj
        }
        
        # Convert to JSON string with proper formatting
        $jsonString = $jsonArray | ConvertTo-Json -Depth 10 -Compress:$false
        
        # Format for JavaScript
        $jsString = "    `"$DataName`": $jsonString"
        
        Write-Host "  ✓ Converted: $DataName ($($jsonArray.Count) rows)" -ForegroundColor Green
        
        return $jsString
    }
    catch {
        Write-Host "  ✗ Error converting $CsvPath : $_" -ForegroundColor Red
        return $null
    }
}

# Collect all data
$allData = @()

# Search for CSV files
$csvFiles = Get-ChildItem -Path $FolderPath -Filter "*.csv" -File

if ($csvFiles.Count -eq 0) {
    Write-Host "No CSV files found in $FolderPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found $($csvFiles.Count) CSV files" -ForegroundColor Cyan
Write-Host ""

foreach ($csvFile in $csvFiles) {
    # Determine data name from filename
    $dataName = $csvFile.BaseName
    
    Write-Host "Processing: $dataName" -ForegroundColor White
    
    $jsData = ConvertCSV-ToJSON -CsvPath $csvFile.FullName -DataName $dataName
    
    if ($jsData) {
        $allData += $jsData
    }
}

# Generate JavaScript file
if ($allData.Count -gt 0) {
    $outputPath = Join-Path $FolderPath "data.js"
    
    Write-Host ""
    Write-Host "Generating JavaScript file..." -ForegroundColor Cyan
    
    $jsContent = "const dashboardData = {`n"
    $jsContent += ($allData -join ",`n")
    $jsContent += "`n};"
    
    # Write to file with UTF-8 encoding (no BOM)
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($outputPath, $jsContent, $utf8NoBom)
    
    Write-Host "✓ Generated: $outputPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Conversion completed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
}
else {
    Write-Host ""
    Write-Host "No data was converted" -ForegroundColor Red
    exit 1
}

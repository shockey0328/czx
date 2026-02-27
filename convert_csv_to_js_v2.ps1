# CSV to JavaScript converter with encoding detection
param(
    [Parameter(Mandatory=$true)]
    [string]$FolderPath
)

# Set UTF-8 encoding for console output
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CSV to JavaScript Converter v2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Processing folder: $FolderPath" -ForegroundColor Yellow
Write-Host ""

# Check if folder exists
if (-not (Test-Path $FolderPath)) {
    Write-Host "Error: Folder not found: $FolderPath" -ForegroundColor Red
    exit 1
}

# Function to detect encoding
function Get-FileEncoding {
    param([string]$Path)
    
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    
    # Check for BOM
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        return [System.Text.Encoding]::UTF8
    }
    if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
        return [System.Text.Encoding]::Unicode
    }
    if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF) {
        return [System.Text.Encoding]::BigEndianUnicode
    }
    
    # Try GB2312 first (most common for Chinese CSV files)
    try {
        $gb2312 = [System.Text.Encoding]::GetEncoding('GB2312')
        $content = $gb2312.GetString($bytes)
        # Check if it contains valid Chinese characters and no garbled text
        if ($content -match '[\u4e00-\u9fa5]' -and $content -notmatch '[\uFFFD]') {
            # Verify by checking if common Chinese words are present
            if ($content -match '(年|月|日|数据|用户|模块)') {
                return $gb2312
            }
        }
    } catch {}
    
    # Try UTF-8
    try {
        $content = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
        # Check if it contains valid Chinese characters
        if ($content -match '[\u4e00-\u9fa5]' -and $content -notmatch '[\uFFFD]') {
            return [System.Text.Encoding]::UTF8
        }
    } catch {}
    
    # Default to GB2312 for Chinese systems
    return [System.Text.Encoding]::GetEncoding('GB2312')
}

# Function to convert CSV to JSON array
function ConvertCSV-ToJSON {
    param(
        [string]$CsvPath,
        [string]$DataName
    )
    
    try {
        # Detect encoding
        $encoding = Get-FileEncoding -Path $CsvPath
        Write-Host "  Encoding: $($encoding.EncodingName)" -ForegroundColor Gray
        
        # Read CSV with detected encoding
        $csvContent = [System.IO.File]::ReadAllText($CsvPath, $encoding)
        
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

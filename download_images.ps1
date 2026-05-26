# PowerShell script to download all peptide product images from purechainresearch.com
# Run this in PowerShell on your Windows PC (right-click the file -> 'Run with PowerShell',
# or open a PowerShell window in this folder and run:  .\download_images.ps1)

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

# Create images directory if it doesn't exist
$imgDir = Join-Path $PSScriptRoot 'images'
if (-not (Test-Path $imgDir)) { New-Item -ItemType Directory -Path $imgDir | Out-Null }

# Headers to mimic a real browser
$headers = @{
    'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    'Referer'    = 'https://purechainresearch.com/'
    'Accept'     = 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
}

$downloads = @(
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2026/01/GLOWGHK-CU-BPC-157-TB500.png'; File = 'Glow_BPC_157_10mg_+_GHK-CU_50mg_+_TB500_10mg.png'; Name = 'Glow BPC 157 10mg + GHK-CU 50mg + TB500 10mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/Klow-BPC-157-10mgGHK-CU-50mgTB500-10mgKPV-10mg.png'; File = 'Klow_BPC_157_10mg_+_GHK-CU_50mg_+_TB500_10mg_+_KPV_10mg.png'; Name = 'Klow BPC 157 10mg + GHK-CU 50mg + TB500 10mg + KPV 10mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/ARA-290.png'; File = 'ARA-290_14mg.png'; Name = 'ARA-290 14mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/BPC-5mg-TB-5mg.png'; File = 'BPC_5mg_+_TB_5mg.png'; Name = 'BPC 5mg + TB 5mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/BPC-157.png'; File = 'BPC-157_20mg.png'; Name = 'BPC-157 20mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/Cagrilintide.png'; File = 'Cagrilintide_10mg.png'; Name = 'Cagrilintide 10mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/CJC-1295-With-DAC.png'; File = 'CJC-1295_With_DAC_10mg.png'; Name = 'CJC-1295 With DAC 10mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/CJC-1295-No-DAC-_-lpamorelin.png'; File = 'CJC-1295_without_DAC_5mg_+_IPA_5mg.png'; Name = 'CJC-1295 without DAC 5mg + IPA 5mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/GHK-Cu.png'; File = 'GHK-Cu_50mg.png'; Name = 'GHK-Cu 50mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/Hexarelin.png'; File = 'Hexarelin_5mg.png'; Name = 'Hexarelin 5mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/MOTs-C.png'; File = 'MOTS-c_10mg.png'; Name = 'MOTS-c 10mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/Oxytocin-2.png'; File = 'Oxytocin_10mg.png'; Name = 'Oxytocin 10mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/PE-22-28.png'; File = 'PE-22-28_10mg.png'; Name = 'PE-22-28 10mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/Retatrutide.png'; File = 'Retatrutide_5mg.png'; Name = 'Retatrutide 5mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/GLP-1-R.png'; File = 'Retatrutide_20mg.png'; Name = 'Retatrutide 20mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/Semax.png'; File = 'Semax_30mg.png'; Name = 'Semax 30mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/Sermorelin.png'; File = 'Sermorelin_10mg.png'; Name = 'Sermorelin 10mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/GLP-1-T.png'; File = 'Tirzepatide_5mg.png'; Name = 'Tirzepatide 5mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/GLP-1-T.png'; File = 'Tirzepatide_30mg.png'; Name = 'Tirzepatide 30mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2026/01/Cagrilintide-5mgSemaglutide-5mg.png'; File = 'Cagrilintide_5mg_+_Semaglutide_5mg.png'; Name = 'Cagrilintide 5mg + Semaglutide 5mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/MT-II-Melatonan-II.png'; File = 'Melanotan_II_10mg.png'; Name = 'Melanotan II 10mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/GLP-1-S.png'; File = 'Semaglutide_5mg.png'; Name = 'Semaglutide 5mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/GLP-1-S.png'; File = 'Semaglutide_10mg.png'; Name = 'Semaglutide 10mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/GLP-1-S.png'; File = 'Semaglutide_20mg.png'; Name = 'Semaglutide 20mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/Thymosin-Beta-4-B500.png'; File = 'TB-500_10mg.png'; Name = 'TB-500 10mg' },
    @{ Url = 'https://purechainresearch.com/wp-content/uploads/2025/12/GLP-1-T.png'; File = 'Tirzepatide_10mg.png'; Name = 'Tirzepatide 10mg' }
)

$total = $downloads.Count
$success = 0
$failed = @()

Write-Host "Downloading $total images from purechainresearch.com..." -ForegroundColor Cyan
Write-Host ''

for ($i = 0; $i -lt $total; $i++) {
    $d = $downloads[$i]
    $dest = Join-Path $imgDir $d.File
    $num = $i + 1
    Write-Host ("[$num/$total] $($d.Name)") -ForegroundColor White
    try {
        Invoke-WebRequest -Uri $d.Url -Headers $headers -OutFile $dest -UseBasicParsing -ErrorAction Stop
        $size = (Get-Item $dest).Length
        Write-Host ("   OK -> $($d.File) ($size bytes)") -ForegroundColor Green
        $success++
    }
    catch {
        Write-Host ("   FAILED: $($_.Exception.Message)") -ForegroundColor Red
        $failed += $d.Name
    }
    Start-Sleep -Milliseconds 200
}

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ("Downloaded $success / $total images") -ForegroundColor Cyan
if ($failed.Count -gt 0) {
    Write-Host ("Failed: $($failed.Count)") -ForegroundColor Yellow
    foreach ($f in $failed) { Write-Host ("  - $f") -ForegroundColor Yellow }
}
Write-Host ("Images saved to: $imgDir") -ForegroundColor Cyan
Write-Host ''
Write-Host 'Press any key to exit...' -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
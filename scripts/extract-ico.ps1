Add-Type -AssemblyName System.Drawing
$icoPath = Join-Path $PSScriptRoot "..\Civilium.ico"
$outDir = Join-Path $PSScriptRoot "..\apps\extension\icons"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$ico = [System.Drawing.Icon]::new($icoPath)
$bmp = $ico.ToBitmap()
$source = Join-Path $outDir "source.png"
$bmp.Save($source, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "source: $source ($($bmp.Width)x$($bmp.Height))"

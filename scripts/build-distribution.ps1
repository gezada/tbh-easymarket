$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$package = Get-Content -LiteralPath (Join-Path $root 'package.json') -Raw | ConvertFrom-Json
$releaseName = "TBH-Easy-Market-v$($package.version)"
$dist = Join-Path $root 'dist'
$stage = Join-Path $dist $releaseName
$zip = Join-Path $dist "$releaseName.zip"

if (-not $stage.StartsWith($dist, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'Invalid distribution staging path.'
}

New-Item -ItemType Directory -Force -Path $dist | Out-Null
if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip -Force }
New-Item -ItemType Directory -Force -Path $stage | Out-Null

$rootFiles = @(
  'server.mjs',
  'tbh-save.mjs',
  'tbh-easymarket.bat',
  'package.json',
  'README.md',
  'LICENSE'
)

foreach ($file in $rootFiles) {
  Copy-Item -LiteralPath (Join-Path $root $file) -Destination $stage
}

Copy-Item -LiteralPath (Join-Path $root 'public') -Destination $stage -Recurse
Copy-Item -LiteralPath (Join-Path $root 'icon') -Destination $stage -Recurse

$stageScripts = Join-Path $stage 'scripts'
New-Item -ItemType Directory -Force -Path $stageScripts | Out-Null
Copy-Item -LiteralPath (Join-Path $root 'scripts\extract-tbh-tables.mjs') -Destination $stageScripts

$stageData = Join-Path $stage 'data'
New-Item -ItemType Directory -Force -Path $stageData | Out-Null
$runtimeData = @(
  'tbh-itemtable.json',
  'tbh-itemnames.json',
  'exchange-rates.json',
  'items-3678970.json'
)
foreach ($file in $runtimeData) {
  $source = Join-Path $root "data\$file"
  if (Test-Path -LiteralPath $source) { Copy-Item -LiteralPath $source -Destination $stageData }
}

Compress-Archive -LiteralPath $stage -DestinationPath $zip -CompressionLevel Optimal

$files = Get-ChildItem -LiteralPath $stage -Recurse -File
$longest = $files | ForEach-Object {
  [PSCustomObject]@{
    RelativePath = $_.FullName.Substring($stage.Length + 1)
    Length = $_.FullName.Length
  }
} | Sort-Object Length -Descending | Select-Object -First 1

Write-Host "Created: $zip"
Write-Host "Files: $($files.Count)"
Write-Host "Longest staged path: $($longest.Length) characters"
Write-Host "No .git directory or development-only Markdown files are included."

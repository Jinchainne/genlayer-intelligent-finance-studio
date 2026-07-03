param(
  [string]$ArchivePath = "E:\TOOL FULL 03-1-2026\SOSO TRADE API\JINBOT_SODEX CROSS.zip",
  [string]$InstallDir = ".local\JINBOT_SODEX CROSS",
  [int]$DashboardPort = 8787
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$target = Join-Path $root $InstallDir
$localDir = Split-Path -Parent $target

if (-not (Test-Path -LiteralPath $target)) {
  if (-not (Test-Path -LiteralPath $ArchivePath)) {
    throw "Archive not found: $ArchivePath"
  }

  New-Item -ItemType Directory -Force -Path $localDir | Out-Null
  tar -xf $ArchivePath -C $localDir
}

$botDir = if (Test-Path -LiteralPath (Join-Path $target "dist\bot.js")) {
  $target
} else {
  $candidate = Get-ChildItem -LiteralPath (Split-Path -Parent $target) -Directory |
    Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName "dist\bot.js") } |
    Select-Object -First 1
  if (-not $candidate) { throw "Cannot find dist\bot.js under $localDir" }
  $candidate.FullName
}

$env:DASHBOARD_PORT = [string]$DashboardPort
$env:JINBOT_BRIDGE_URL = "http://127.0.0.1:$DashboardPort"

Write-Host "Starting JINBOT_SODEX CROSS from: $botDir"
Write-Host "Dashboard bridge: http://127.0.0.1:$DashboardPort"
Push-Location $botDir
try {
  node dist/bot.js
} finally {
  Pop-Location
}

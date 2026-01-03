# MongoDB Replica Set Setup Script for Windows
# This script configures your local MongoDB to support transactions

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MongoDB Replica Set Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# MongoDB paths
$mongoVersion = "8.2"
$mongoPath = "C:\Program Files\MongoDB\Server\$mongoVersion"
$configPath = "$mongoPath\bin\mongod.cfg"
$dataPath = "C:\data\db"

Write-Host "Checking MongoDB installation..." -ForegroundColor Yellow
if (-not (Test-Path $configPath)) {
    Write-Host "ERROR: MongoDB config file not found at $configPath" -ForegroundColor Red
    Write-Host "Please check your MongoDB installation path." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Found MongoDB $mongoVersion" -ForegroundColor Green
Write-Host ""

# Backup existing config
Write-Host "Creating backup of mongod.cfg..." -ForegroundColor Yellow
$backupPath = "$configPath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $configPath $backupPath
Write-Host "✓ Backup created at $backupPath" -ForegroundColor Green
Write-Host ""

# Read current config
Write-Host "Reading current configuration..." -ForegroundColor Yellow
$configContent = Get-Content $configPath -Raw

# Check if replication is already configured
if ($configContent -match "replication:") {
    Write-Host "⚠ Replication already configured in mongod.cfg" -ForegroundColor Yellow
    Write-Host "Current config:" -ForegroundColor Yellow
    Write-Host $configContent
    Write-Host ""
    $continue = Read-Host "Do you want to reconfigure? (y/n)"
    if ($continue -ne 'y') {
        Write-Host "Skipping configuration update." -ForegroundColor Yellow
    } else {
        # Remove old replication config
        $configContent = $configContent -replace "(?ms)replication:.*?(?=\r?\n[a-z]|\z)", ""
    }
}

# Add replication configuration if not present
if ($configContent -notmatch "replication:") {
    Write-Host "Adding replication configuration..." -ForegroundColor Yellow

    # Add replication section at the end
    $replicationConfig = @"

replication:
  replSetName: "rs0"
"@

    $configContent = $configContent.TrimEnd() + $replicationConfig

    # Write new config
    Set-Content -Path $configPath -Value $configContent
    Write-Host "✓ Configuration updated" -ForegroundColor Green
    Write-Host ""
}

# Restart MongoDB service
Write-Host "Restarting MongoDB service..." -ForegroundColor Yellow
Write-Host "NOTE: This requires Administrator privileges!" -ForegroundColor Yellow
Write-Host ""

try {
    # Check if running as admin
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

    if (-not $isAdmin) {
        Write-Host "ERROR: This script must be run as Administrator to restart the MongoDB service." -ForegroundColor Red
        Write-Host ""
        Write-Host "Please:" -ForegroundColor Yellow
        Write-Host "1. Close this window" -ForegroundColor Yellow
        Write-Host "2. Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
        Write-Host "3. Run this script again" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Alternatively, manually restart MongoDB:" -ForegroundColor Yellow
        Write-Host "  1. Open Services (services.msc)" -ForegroundColor Yellow
        Write-Host "  2. Find 'MongoDB Server'" -ForegroundColor Yellow
        Write-Host "  3. Right-click -> Restart" -ForegroundColor Yellow
        exit 1
    }

    Restart-Service -Name "MongoDB" -Force
    Write-Host "✓ MongoDB service restarted" -ForegroundColor Green
    Write-Host ""

    # Wait for MongoDB to start
    Write-Host "Waiting for MongoDB to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5

} catch {
    Write-Host "⚠ Could not restart service automatically: $_" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please manually restart MongoDB:" -ForegroundColor Yellow
    Write-Host "  1. Press Win + R" -ForegroundColor Yellow
    Write-Host "  2. Type 'services.msc' and press Enter" -ForegroundColor Yellow
    Write-Host "  3. Find 'MongoDB Server'" -ForegroundColor Yellow
    Write-Host "  4. Right-click -> Restart" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Press Enter after you've restarted MongoDB..."
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuration complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: Initialize the replica set" -ForegroundColor Yellow
Write-Host "Run: cd berater-service && node setup-replica-set.js" -ForegroundColor Yellow
Write-Host ""

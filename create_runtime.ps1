# PowerShell Script to Create a Standalone Runtime Package for Windows
$ErrorActionPreference = "Stop"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   Creating Standalone Runtime Package...          " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$ProjectDir = Get-Location
$DeployDir = Join-Path $ProjectDir "deploy"
$AppDir = Join-Path $DeployDir "app"
$ZipPath = Join-Path $ProjectDir "Northstar-Mood-Tracker-Runtime.zip"

# Clean previous deployments
if (Test-Path $DeployDir) {
    Write-Host "[1/6] Cleaning up old deploy folder..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $DeployDir
}
if (Test-Path $ZipPath) {
    Write-Host "[1/6] Cleaning up old ZIP archive..." -ForegroundColor Yellow
    Remove-Item -Force $ZipPath
}

# Create directories
New-Item -ItemType Directory -Force -Path $DeployDir | Out-Null
New-Item -ItemType Directory -Force -Path $AppDir | Out-Null

# Download Portable Node.js (LTS version)
$NodeVersion = "22.13.0"
$NodeZipName = "node-v$NodeVersion-win-x64.zip"
$NodeUrl = "https://nodejs.org/dist/v$NodeVersion/$NodeZipName"
$TempZip = Join-Path $env:TEMP $NodeZipName

Write-Host "[2/6] Downloading portable Node.js v$NodeVersion..." -ForegroundColor Yellow
if (-not (Test-Path $TempZip)) {
    Invoke-WebRequest -Uri $NodeUrl -OutFile $TempZip
} else {
    Write-Host "Using cached Node.js zip file from Temp." -ForegroundColor Green
}

# Extract Portable Node.js
Write-Host "[3/6] Extracting portable Node.js to deploy folder..." -ForegroundColor Yellow
Expand-Archive -Path $TempZip -DestinationPath $DeployDir -Force

# Rename the extracted folder to a standard name
$ExtractedFolder = Join-Path $DeployDir "node-v$NodeVersion-win-x64"
$PortableNodeDir = Join-Path $DeployDir "node-portable"
Rename-Item -Path $ExtractedFolder -NewName "node-portable"

# Copy App Files (excluding caches, docs, git folders)
Write-Host "[4/6] Copying project files and dependencies..." -ForegroundColor Yellow

$ExcludeList = @(".git", ".github", ".lovable", "deploy", "Northstar-Mood-Tracker-Runtime.zip", "create_runtime.ps1")

Get-ChildItem -Path $ProjectDir | Where-Object { $_.Name -notin $ExcludeList } | ForEach-Object {
    $Dest = Join-Path $AppDir $_.Name
    Copy-Item -Path $_.FullName -Destination $Dest -Recurse -Force
}

# Create Launcher Script in Deploy Root
Write-Host "[5/6] Creating start_app.bat launcher..." -ForegroundColor Yellow
$BatContent = @"
@echo off
title Northstar Mood Tracker - Portable Runtime
echo ===================================================
echo   Northstar Mood Tracker - Launching Standalone App
echo ===================================================
echo.

:: Add portable Node.js to PATH for this session
set "PATH=%~dp0node-portable;%PATH%"

cd "%~dp0app"

:: Open the browser in the background after a 5-second delay
start /b cmd /c "timeout /t 5 >nul && start http://localhost:8080/"

:: Run the app using portable Node
call npm run dev
"@

$BatPath = Join-Path $DeployDir "start_app.bat"
Set-Content -Path $BatPath -Value $BatContent -Encoding Ascii

# Compress Deploy Folder to ZIP
Write-Host "[6/6] Compressing everything into Northstar-Mood-Tracker-Runtime.zip..." -ForegroundColor Yellow
if (Get-Command tar -ErrorAction SilentlyContinue) {
    # Use native tar which is 10x-20x faster than Compress-Archive on modern Windows 10/11
    tar -a -c -f $ZipPath -C $DeployDir .
} else {
    # Fallback to Compress-Archive if tar is not found
    Compress-Archive -Path "$DeployDir\*" -DestinationPath $ZipPath -Force
}

# Cleanup deploy folder
Remove-Item -Recurse -Force $DeployDir

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host " SUCCESS! Standalone package created at:" -ForegroundColor Green
Write-Host " $ZipPath" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Green
Write-Host "To deploy to a clean PC:"
Write-Host "1. Copy the ZIP file to the clean PC."
Write-Host "2. Extract the ZIP file."
Write-Host "3. Double-click 'start_app.bat' to run the app."
Write-Host ""

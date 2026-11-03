# PowerShell Runner for Maharashtra Sugarcane Tracker (Java Backend)
$ErrorActionPreference = "Stop"

Write-Host "============================================================================" -ForegroundColor Green
Write-Host "  Starting Maharashtra Sugarcane Supply Chain Tracker (Java Backend)..." -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green

# 1. Check Java
try {
    $javaVer = & java -version 2>&1 | Select-Object -First 1
    Write-Host "[1/3] Java detected: $javaVer" -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] Java is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# 2. Compile
Write-Host "[2/3] Compiling Java source files with javac..." -ForegroundColor Cyan
if (-not (Test-Path "bin")) {
    New-Item -ItemType Directory -Path "bin" | Out-Null
}

$javaFiles = Get-ChildItem -Path "src\main\java" -Recurse -Filter "*.java" | ForEach-Object { $_.FullName }
& javac -encoding UTF-8 -d bin $javaFiles

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Compilation failed." -ForegroundColor Red
    exit 1
}

Write-Host "[3/3] Launching Java Embedded HTTP Server & REST API on port 8080..." -ForegroundColor Green
Write-Host "👉 Open http://localhost:8080 in your browser to interact with the project." -ForegroundColor Yellow
Write-Host ""

& java -cp bin com.mahacane.Main 8080

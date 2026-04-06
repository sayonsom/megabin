@echo off
setlocal
cd /d "%~dp0"

echo [Megabin] Samsung laptop PoC launcher
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [Megabin] Node.js is required but was not found on PATH.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [Megabin] npm is required but was not found on PATH.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [Megabin] Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo [Megabin] npm install failed.
    pause
    exit /b 1
  )
)

echo [Megabin] Running Edge diagnostics...
call npm run edge:doctor
if errorlevel 1 (
  echo [Megabin] Edge diagnostics failed.
  pause
  exit /b 1
)

echo [Megabin] Starting local Edge service...
start "Megabin Edge" cmd /k "cd /d ""%~dp0"" && npm run edge:start"

echo [Megabin] Starting demo app...
start "Megabin Demo" cmd /k "cd /d ""%~dp0"" && npm run dev -- --host 127.0.0.1"

echo [Megabin] Waiting for localhost services...
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command ^
  "$deadline=(Get-Date).AddMinutes(2);" ^
  "function Wait-Url([string]$url){while((Get-Date) -lt $deadline){try{$response=Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2;if($response.StatusCode -ge 200){return}}catch{};Start-Sleep -Seconds 2};throw ('Timed out waiting for ' + $url)};" ^
  "Wait-Url 'http://127.0.0.1:8787/health';" ^
  "Wait-Url 'http://127.0.0.1:5173/demo';"

if errorlevel 1 (
  echo [Megabin] One or more services did not come online in time.
  echo [Megabin] Check the 'Megabin Edge' and 'Megabin Demo' command windows for errors.
  pause
  exit /b 1
)

echo [Megabin] Opening Agent Workspace and CISO Dashboard...
start "" "http://127.0.0.1:5173/demo"
start "" "http://127.0.0.1:5173/admin"

echo.
echo [Megabin] Ready for the Samsung demo:
echo   1. Open the NASCA-protected file in Excel, Word, or PowerPoint first.
echo   2. In the Agent Workspace, use the Samsung Edge capture buttons.
echo   3. Keep the CISO Dashboard on the second monitor.
echo   4. For PDF, copy visible text in the approved viewer, then click the PDF import button.
echo.
pause

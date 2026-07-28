@echo off
setlocal enabledelayedexpansion
REM Double-click this file to preview the {{PROJECT_NAME}} prototypes locally.
REM It starts a tiny local web server in this folder and opens your browser.
REM Leave this window open while you browse. Close it when done.

cd /d "%~dp0"

REM Find a free port by probing upward from a base port, so more than one build
REM folder can run at the same time without colliding on a single fixed port.
REM Skipping any port that already has a listener also means a still-running
REM server from another build can never quietly "win" and show the wrong content.
set BASE_PORT=8000
set /a END_PORT=%BASE_PORT%+49
set PORT=
for /L %%p in (%BASE_PORT%,1,%END_PORT%) do (
  if not defined PORT (
    netstat -ano | findstr "LISTENING" | findstr /C:":%%p " >nul 2>&1
    if errorlevel 1 set PORT=%%p
  )
)

if not defined PORT (
  echo.
  echo   Couldn't find a free port between %BASE_PORT% and %END_PORT%.
  echo   Close some other preview windows and double-click this file again.
  echo.
  pause
  exit /b 1
)

set URL=http://localhost:%PORT%/

echo.
echo   {{PROJECT_NAME}} - Concept Prototypes
echo   Starting a local preview at %URL%
if not "%PORT%"=="%BASE_PORT%" echo   ^(Port %BASE_PORT% was busy, so this build is using %PORT% instead.^)
echo   Keep this window open while you browse.
echo   To stop: close this window or press Control + C.
echo.

REM Open the browser only once THIS build's server is actually responding - never
REM on a blind timer, which could otherwise open a tab onto another build's server.
REM Runs in the background (/b) so no extra console window flashes up.
start "" /b powershell -NoProfile -Command "$u='%URL%'; for($i=0; $i -lt 40; $i++){ try { [void](Invoke-WebRequest -UseBasicParsing -Uri $u -TimeoutSec 1); Start-Process $u; break } catch { Start-Sleep -Milliseconds 500 } }"

REM Start a local server using whatever is available on this machine.
where python >nul 2>&1
if %errorlevel%==0 (
  python -m http.server %PORT%
  goto :ended
)

where npx >nul 2>&1
if %errorlevel%==0 (
  npx --yes serve -l %PORT% .
  goto :ended
)

echo   Could not find Python or Node on this machine.
echo   Install either one, then double-click this file again:
echo     Python  -^>  https://www.python.org/downloads/
echo     Node    -^>  https://nodejs.org  (click the green LTS button)
echo.
pause
exit /b 1

:ended
REM If the server exited with an error (e.g. it couldn't bind the port), keep the
REM window open with a clear message instead of closing on its own.
if errorlevel 1 (
  echo.
  echo   The local preview stopped unexpectedly.
  echo   The address %URL% may already be in use.
  echo   Close other preview windows, then double-click this file again.
  echo.
  pause
)

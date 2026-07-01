@echo off
cd /d "%~dp0"
title DS Global Dashboard Test Launcher

echo ==========================================
echo DS Global Dashboard Test Launcher
echo ==========================================
echo.
echo Current folder:
echo %CD%
echo.

if not exist "%~dp0dashboard-server.ps1" (
  echo ERROR: dashboard-server.ps1 is missing.
  echo Make sure this file is inside the dashboard folder.
  echo.
  pause
  exit /b 1
)

if not exist "%~dp0dashboard-kiosk.html" (
  echo ERROR: dashboard-kiosk.html is missing.
  echo Make sure this file is inside the dashboard folder.
  echo.
  pause
  exit /b 1
)

if not exist "%~dp0data\server.xml" (
  echo ERROR: data\server.xml is missing.
  echo Make sure the data folder is inside the dashboard folder.
  echo.
  pause
  exit /b 1
)

echo Starting local dashboard server...
echo.
echo If Windows asks permission, click Allow.
echo.

%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0dashboard-server.ps1"

echo.
echo Server stopped or failed.
echo Take a photo of any error above and send it.
echo.
pause

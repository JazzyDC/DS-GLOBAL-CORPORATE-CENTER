@echo off
cd /d "%~dp0"
title DS Global Corporate Center Dashboard
echo Starting DS Global Corporate Center Dashboard...
echo.
if not exist "%~dp0dashboard-server.ps1" (
  echo ERROR: dashboard-server.ps1 was not found beside START-DASHBOARD.bat.
  echo.
  echo Do not copy START-DASHBOARD.bat into the Startup folder.
  echo Create a shortcut to START-DASHBOARD.bat instead, or run INSTALL-AUTOSTART.bat.
  echo.
  pause
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0dashboard-server.ps1"
echo.
echo Dashboard server stopped or failed to start.
pause

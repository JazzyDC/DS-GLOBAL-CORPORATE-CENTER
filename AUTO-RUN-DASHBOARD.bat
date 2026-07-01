@echo off
cd /d "%~dp0"
title DS Global Dashboard Auto Run

echo Starting dashboard server...
start "DS Global Dashboard Server" "%~dp0START-DASHBOARD.bat"

echo Waiting for local server...
timeout /t 15 /nobreak >nul

echo Opening OpenKiosk...
set "OPENKIOSK="

if exist "%ProgramFiles%\OpenKiosk\OpenKiosk.exe" set "OPENKIOSK=%ProgramFiles%\OpenKiosk\OpenKiosk.exe"
if exist "%ProgramFiles(x86)%\OpenKiosk\OpenKiosk.exe" set "OPENKIOSK=%ProgramFiles(x86)%\OpenKiosk\OpenKiosk.exe"
if exist "%LocalAppData%\OpenKiosk\OpenKiosk.exe" set "OPENKIOSK=%LocalAppData%\OpenKiosk\OpenKiosk.exe"

if defined OPENKIOSK (
  start "OpenKiosk" "%OPENKIOSK%"
) else (
  echo OpenKiosk.exe was not found in the common install folders.
  echo Opening the configured default browser instead.
  start "" "http://127.0.0.1:8000/"
)

exit

@echo off
cd /d "%~dp0"
title DS Global Corporate Center Dashboard
echo Starting DS Global Corporate Center Dashboard...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0dashboard-server.ps1"
echo.
echo Dashboard server stopped or failed to start.
pause

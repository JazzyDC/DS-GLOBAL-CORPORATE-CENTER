@echo off
cd /d "%~dp0"
set "FILE_URL=file:///%CD:\=/%/index-modern-backup.html"

echo Use this URL in OpenKiosk:
echo.
echo %FILE_URL%
echo.
echo This direct URL does not need localhost, Node, PowerShell server, or internet.
echo.
pause

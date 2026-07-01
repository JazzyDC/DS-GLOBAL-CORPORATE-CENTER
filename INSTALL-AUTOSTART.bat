@echo off
setlocal
cd /d "%~dp0"

echo Installing DS Global Corporate Center Dashboard autostart...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$Startup=[Environment]::GetFolderPath('Startup'); $Target=(Resolve-Path '.\START-DASHBOARD.bat').Path; $ShortcutPath=Join-Path $Startup 'DS Global Dashboard Server.lnk'; $Shell=New-Object -ComObject WScript.Shell; $Shortcut=$Shell.CreateShortcut($ShortcutPath); $Shortcut.TargetPath=$Target; $Shortcut.WorkingDirectory=(Split-Path $Target); $Shortcut.WindowStyle=1; $Shortcut.Description='Start DS Global Corporate Center Dashboard local server'; $Shortcut.Save(); Write-Host ('Created startup shortcut: ' + $ShortcutPath)"

echo.
echo Done. On next Windows restart, the dashboard server will auto-start.
echo OpenKiosk URL should be: http://127.0.0.1:8000/
echo.
pause

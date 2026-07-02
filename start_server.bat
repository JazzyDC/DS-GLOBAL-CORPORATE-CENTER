@echo off
cd /d "C:\Dashboard\DS-GLOBAL-CORPORATE-CENTER"

start "" /B python -m http.server 8080

timeout /t 5 >nul

start "" "C:\Program Files\OpenKiosk\OpenKiosk.exe" "http://localhost:8080/index.html"

exit
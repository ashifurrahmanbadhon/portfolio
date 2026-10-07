@echo off
title Ashifur Rahman - Next.js Central CMS Suite
echo ===============================================================
echo   Ashifur Rahman - Next.js Central CMS Control Center
echo ===============================================================
echo.

set "PATH=C:\Program Files\nodejs;%PATH%"

echo [1/2] Starting Python Backend on http://localhost:5000 ...
cd /d "%~dp0"
start "Python Central API" /min cmd /c "python server.py"

echo [2/2] Launching Next.js Central CMS Dashboard on http://localhost:3000 ...
cd /d "%~dp0central-cms"
start "" http://localhost:3000/
npm run dev

pause

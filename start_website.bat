@echo off
title Ashifur Rahman - Portfolio Web Server
echo Starting Ashifur Rahman Portfolio Website & CMS...
cd /d "%~dp0"
start "" http://localhost:5000/
python server.py
if %ERRORLEVEL% NEQ 0 (
    powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
)
pause

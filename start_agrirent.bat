@echo off
title AgriRent ML - Full Platform
echo ===================================================
echo       Launching AgriRent ML Platform...
echo ===================================================
echo.
echo Starting unified server on http://localhost:5000 ...
timeout /t 2 /nobreak >nul
start http://localhost:5000
cd /d %~dp0backend
python app.py

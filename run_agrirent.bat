@echo off
title AgriRent ML Launcher
echo =====================================================================
echo          AGRIRENT ML - FULL STACK PLATFORM LAUNCHER
echo =====================================================================
echo.
echo [1/2] Launching Python Flask REST API Backend on http://localhost:5000 ...
start "AgriRent Backend" cmd /k "cd /d %~dp0backend && python app.py"

echo [2/2] Launching React Vite Frontend on http://localhost:5173 ...
start "AgriRent Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =====================================================================
echo  Both services have been launched in separate terminal windows!
echo    - Frontend UI:  http://localhost:5173
echo    - Backend API:  http://localhost:5000
echo =====================================================================
echo.
echo Waiting 4 seconds for servers to initialize before opening browser...
timeout /t 4 /nobreak >nul
start http://localhost:5173
echo Done! You can close this launcher window now.
pause


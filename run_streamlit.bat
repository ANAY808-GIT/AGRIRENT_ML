@echo off
title AgriRent ML - Streamlit Platform Launcher
echo =====================================================================
echo          AGRIRENT ML - STREAMLIT PLATFORM LAUNCHER
echo =====================================================================
echo.
echo Starting Streamlit agricultural platform on http://localhost:8501 ...
timeout /t 2 /nobreak >nul
start http://localhost:8501
cd /d %~dp0streamlitml
python -m streamlit run app.py

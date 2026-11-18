@echo off
title AgriRent ML - Push to GitHub
echo =====================================================================
echo          AGRIRENT ML - GITHUB AUTOMATIC PUSH SCRIPT
echo =====================================================================
echo.
cd /d %~dp0
git branch -M main
echo Pushing all files to https://github.com/ANAY808-GIT/AGRIRENT_ML.git ...
echo.
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo =====================================================================
    echo  [SUCCESS] All files and commits have been pushed to GitHub!
    echo  View repository: https://github.com/ANAY808-GIT/AGRIRENT_ML
    echo =====================================================================
) else (
    echo =====================================================================
    echo  [ACTION REQUIRED]
    echo  GitHub requires authentication for account: ANAY808-GIT
    echo  Please complete the sign-in in your browser window, or provide
    echo  a Personal Access Token.
    echo =====================================================================
)
echo.
pause

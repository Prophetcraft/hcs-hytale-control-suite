@echo off
title HCS - Stop Controller
color 0C

cd /d "%~dp0\.."

echo ============================================
echo           HCS STOP CONTROLLER
echo ============================================
echo.

where pm2.cmd >nul 2>nul
if errorlevel 1 (
    echo [ERROR] PM2 not found.
    echo Please run install.bat first.
    echo.
    pause
    exit /b 1
)

echo Stopping controller...
pm2 stop hcs-controller >nul 2>nul

echo Removing controller from PM2...
pm2 delete hcs-controller >nul 2>nul

echo.
echo ============================================
echo Controller stopped successfully.
echo ============================================
echo.

pause
exit /b 0
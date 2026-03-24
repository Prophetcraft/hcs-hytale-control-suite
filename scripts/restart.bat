@echo off
title HCS - Restart Controller
color 0E

cd /d "%~dp0\.."

echo ============================================
echo         HCS RESTART CONTROLLER
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

echo Restarting controller...
pm2 restart hcs-controller >nul 2>nul

echo.
echo Opening log monitor...
start "HCS Logs" cmd /k pm2 logs hcs-controller --lines 50

echo.
echo ============================================
echo Controller restarted successfully.
echo ============================================
echo.

pause
exit /b 0
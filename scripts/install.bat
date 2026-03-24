@echo off
setlocal EnableDelayedExpansion
title HCS - Install Wizard
color 0B

cd /d "%~dp0\.."

echo ============================================
echo            HCS INSTALL WIZARD
echo ============================================
echo.

echo [1/6] Checking Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed.
    echo Please install Node.js and run this file again.
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('node -v') do set NODE_VERSION=%%v
echo [OK] Node.js detected: !NODE_VERSION!
echo.

echo [2/6] Checking npm...
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm was not found.
    echo Please reinstall Node.js correctly.
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('npm -v') do set NPM_VERSION=%%v
echo [OK] npm detected: !NPM_VERSION!
echo.

echo [3/6] Checking PM2...
where pm2.cmd >nul 2>nul
if errorlevel 1 (
    echo [INFO] PM2 not found. Installing globally...
    call npm install -g pm2
    if errorlevel 1 (
        echo [ERROR] PM2 installation failed.
        echo Try running this script as Administrator.
        echo.
        pause
        exit /b 1
    )
    echo [OK] PM2 installed successfully.
) else (
    echo [OK] PM2 already installed.
)
echo.

echo [4/6] Installing project dependencies...
if not exist "package.json" (
    echo [ERROR] package.json not found in root folder.
    echo.
    pause
    exit /b 1
)

call npm install
if errorlevel 1 (
    echo [ERROR] npm install failed.
    echo Check your internet connection or package.json.
    echo.
    pause
    exit /b 1
)

echo [OK] Dependencies installed successfully.
echo.

echo [5/6] Preparing runtime folders...
if not exist "runtime" mkdir runtime
if not exist "runtime\logs" mkdir runtime\logs
if not exist "config" mkdir config

echo [OK] Runtime folders ready.
echo.

echo [6/6] Final checks...
if not exist "controller.js" (
    echo [ERROR] controller.js not found.
    echo.
    pause
    exit /b 1
)

if not exist "scripts\configure.bat" (
    echo [WARNING] configure.bat was not found.
) else (
    echo [OK] configure.bat found.
)

echo.
echo ============================================
echo Installation completed successfully.
echo.
echo Next step:
echo Run scripts\configure.bat
echo ============================================
echo.

pause
exit /b 0
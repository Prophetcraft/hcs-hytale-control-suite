@echo off
setlocal

title HCS Controller Launcher
color 0B

cd /d "%~dp0\.."

echo ============================================
echo         HCS CONTROLLER PM2 LAUNCHER
echo ============================================
echo.
echo Root folder: %cd%
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js not found.
    echo Please install Node.js before using HCS.
    echo.
    pause
    exit /b 1
)

where pm2.cmd >nul 2>nul
if errorlevel 1 (
    echo [INFO] PM2 not found. Installing...
    call npm install -g pm2
    if errorlevel 1 (
        echo [ERROR] PM2 installation failed.
        echo.
        pause
        exit /b 1
    )
)

for /f "delims=" %%i in ('where pm2.cmd') do set "PM2_CMD=%%i"

if not defined PM2_CMD (
    echo [ERROR] Unable to find pm2.cmd
    echo.
    pause
    exit /b 1
)

echo PM2 detected at:
echo %PM2_CMD%
echo.

if not exist "controller.js" (
    echo [ERROR] controller.js not found in root.
    echo.
    pause
    exit /b 1
)

if not exist "config\controller.config.json" (
    echo [ERROR] config\controller.config.json not found.
    echo.
    pause
    exit /b 1
)

echo [1/8] Verifying controller.js syntax...
node -c "controller.js"
if errorlevel 1 (
    echo.
    echo [ERROR] controller.js contains syntax errors.
    echo.
    pause
    exit /b 1
)

echo [2/8] Stopping previous PM2 instance...
call "%PM2_CMD%" stop hcs-controller >nul 2>nul
call "%PM2_CMD%" delete hcs-controller >nul 2>nul

echo [3/8] Resetting PM2 counters...
call "%PM2_CMD%" reset all >nul 2>nul

echo [4/8] Flushing PM2 logs...
call "%PM2_CMD%" flush >nul 2>nul

echo [5/8] Cleaning PM2 physical logs...
set "PM2_LOG_DIR=%USERPROFILE%\.pm2\logs"

if exist "%PM2_LOG_DIR%\hcs-controller-out.log" del /f /q "%PM2_LOG_DIR%\hcs-controller-out.log"
if exist "%PM2_LOG_DIR%\hcs-controller-error.log" del /f /q "%PM2_LOG_DIR%\hcs-controller-error.log"

echo [6/8] Cleaning local runtime logs...
if not exist "runtime" mkdir runtime
if not exist "runtime\logs" mkdir runtime\logs

if exist "runtime\logs\actions.log" del /f /q "runtime\logs\actions.log"
if exist "runtime\server.pid.json" del /f /q "runtime\server.pid.json"

echo [7/8] Starting controller with PM2...
call "%PM2_CMD%" start controller.js --name hcs-controller
if errorlevel 1 (
    echo.
    echo [ERROR] PM2 failed to start controller.js
    echo Try manually with:
    echo "%PM2_CMD%" start controller.js --name hcs-controller
    echo.
    pause
    exit /b 1
)

echo [8/8] Saving PM2 configuration...
call "%PM2_CMD%" save >nul 2>nul

echo Opening log monitor...
start "HCS Log Monitor" cmd /k ""%PM2_CMD%" logs hcs-controller --lines 50"

echo Opening PM2 console...
start "HCS PM2 Console" cmd /k "echo Useful commands: && echo. && echo pm2 status && echo pm2 restart hcs-controller && echo pm2 stop hcs-controller && echo pm2 delete hcs-controller && echo pm2 flush && echo. && ""%PM2_CMD%"" status"

echo If the dashboard is not configured yet, complete controller.config.json first.

echo.
echo ============================================
echo Controller started successfully.
echo Dashboard: http://shortmemory.ddns.net:3000
echo ============================================
echo.

pause
exit /b 0
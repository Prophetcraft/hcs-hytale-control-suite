@echo off
setlocal EnableDelayedExpansion
title HCS - Configuration Wizard
color 0B

cd /d "%~dp0\.."

echo ============================================
echo         HCS CONFIGURATION WIZARD
echo ============================================
echo.
echo This wizard will create:
echo config\controller.config.json
echo.

if not exist "config" mkdir config

set /p CONTROLLER_NAME=Controller name [HCS Controller]: 
if "!CONTROLLER_NAME!"=="" set CONTROLLER_NAME=HCS Controller

echo.
set /p DISCORD_TOKEN=Discord bot token: 
echo.
set /p TARGET_CHANNEL_ID=Discord target channel ID: 
echo.
set /p SERVER_PATH=Full server root path (example: D:\Giochi\HytaleFiles\...\Server): 
echo.
set /p CONFIG_PATH=Full server config path (example: D:\Games\HytaleFiles\...\Server\config.json): 
echo.
set /p SERVER_EXE=Server executable or batch file name (example: HytaleServer.exe or startserver.bat): 
echo.
set /p WEB_PORT=Dashboard port [3000]: 
if "!WEB_PORT!"=="" set WEB_PORT=3000

echo.
echo Dashboard URL options:
echo 1 = Local only      ^(http://127.0.0.1:PORT^)
echo 2 = Custom URL/DDNS ^(example: http://noip.ddns.net:3000^)
echo.
set /p URL_MODE=Choose option [1/2]: 

if "!URL_MODE!"=="2" (
    set /p DASHBOARD_URL=Enter dashboard public URL: 
) else (
    set DASHBOARD_URL=http://127.0.0.1:!WEB_PORT!
)

echo.
set /p ALLOW_SHUTDOWN=Allow shutdown commands? [true/false, default false]: 
if "!ALLOW_SHUTDOWN!"=="" set ALLOW_SHUTDOWN=false

echo.
set /p SHUTDOWN_DELAY=Shutdown delay in minutes [30]: 
if "!SHUTDOWN_DELAY!"=="" set SHUTDOWN_DELAY=30

echo.
set /p ALLOWED_IDS=Allowed Discord user IDs ^(comma separated, leave empty for all^): 

set ALLOWED_IDS_JSON=[]
if not "!ALLOWED_IDS!"=="" (
    set TMP_IDS=!ALLOWED_IDS:,=","!
    set ALLOWED_IDS_JSON=["!TMP_IDS!"]
)

(
echo {
echo   "controllerName": "!CONTROLLER_NAME!",
echo   "token": "!DISCORD_TOKEN!",
echo   "targetChannelId": "!TARGET_CHANNEL_ID!",
echo   "serverPath": "!SERVER_PATH:\=\\!",
echo   "configPath": "!CONFIG_PATH:\=\\!",
echo   "serverExe": "!SERVER_EXE!",
echo   "webPort": !WEB_PORT!,
echo   "dashboardPublicUrl": "!DASHBOARD_URL!",
echo   "statusRefreshMs": 3000,
echo   "allowShutdownCommands": !ALLOW_SHUTDOWN!,
echo   "shutdownDelayMinutes": !SHUTDOWN_DELAY!,
echo   "allowedDiscordUserIds": !ALLOWED_IDS_JSON!
echo }
) > "config\controller.config.json"

if not exist "config\controller.config.json" (
    echo.
    echo [ERROR] Failed to create config\controller.config.json
    echo.
    pause
    exit /b 1
)

for %%A in ("config\controller.config.json") do set FILE_SIZE=%%~zA

if "!FILE_SIZE!"=="0" (
    echo.
    echo [ERROR] Configuration file was created but is empty.
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo Configuration file created successfully.
echo File:
echo config\controller.config.json
echo ============================================
echo.
echo Next step:
echo Run scripts\start.bat
echo.

pause
exit /b 0
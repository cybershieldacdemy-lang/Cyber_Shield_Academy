@echo off
title Cyber Shield Academy Launcher 🛡️
color 0a
cls

echo ===================================================
echo   Starting Cyber Shield Academy Platform...
echo ===================================================
echo.

IF NOT EXIST "node_modules" (
    echo [INFO] Installing dependencies... This may take a few minutes.
    call npm install
)

IF NOT EXIST ".next" (
    echo [INFO] Building the application...
    call npm run build
)

echo.
echo [INFO] Launching server...
echo [INFO] The platform will open in your browser automatically.
echo.

start http://localhost:3000

call npm run start

pause

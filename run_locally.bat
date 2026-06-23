@echo off
title Northstar Mood Tracker - Local Server
echo ===================================================
echo   Northstar Mood Tracker - Launching Local Server
echo ===================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this machine!
    echo Please download and install Node.js from: https://nodejs.org/
    echo After installing, restart this script.
    echo.
    pause
    exit /b
)

:: Check if node_modules exists, if not run npm install
if not exist "node_modules\" (
    echo [INFO] node_modules directory not found. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b
    )
)

echo [INFO] Starting the development server...
echo [INFO] The app will open in your default browser shortly at http://localhost:8080/
echo [INFO] To stop the server, close this command window or press Ctrl + C.
echo.

:: Open the browser in the background after a 5-second delay to give the server time to boot up
start /b cmd /c "timeout /t 5 >nul && start http://localhost:8080/"

:: Run the development server
call npm run dev

pause

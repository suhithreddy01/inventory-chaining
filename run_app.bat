@echo off
title Inventory Chaining - Technical Training Lab
echo ========================================================
echo   INVENTORY CHAINING - TECHNICAL TRAINING LAB
echo   Starting Local Development Server...
echo ========================================================
echo.

cd /d "%~dp0"

:: Start the browser after 2 seconds in the background
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5173"

:: Run the Vite development server
npm run dev

pause

@echo off
title Smart Tourist Safety System Launcher
echo ==============================================================
echo   SMART TOURIST SAFETY & INCIDENT RESPONSE SYSTEM
echo   Launching Full-Stack Application...
echo ==============================================================
start cmd /k start_backend.bat
timeout /t 3 /nobreak >nul
start cmd /k start_frontend.bat
echo Both services are booting up in separate terminals!
echo Opening browser at http://localhost:5173 (or http://localhost:5000)...
timeout /t 2 /nobreak >nul
start http://localhost:5000

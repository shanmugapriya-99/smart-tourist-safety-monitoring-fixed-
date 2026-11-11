@echo off
title Tourist Safety System - Python Flask Backend
echo ==============================================================
echo   SMART TOURIST SAFETY & INCIDENT RESPONSE SYSTEM
echo   Starting Python Flask Backend Server...
echo ==============================================================
cd backend
python -m pip install -r requirements.txt
python app.py
pause

@echo off
echo.
echo ===================================================
echo   BookMyShow Frontend - Deployment Setup
echo ===================================================
echo.
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0setup_deploy.ps1"

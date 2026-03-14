@echo off
REM Dev with Ngrok Script for Windows
REM Usage: dev-with-ngrok.bat <ngrok-url>

if "%~1"=="" (
    echo Usage: dev-with-ngrok.bat ^<ngrok-url^>
    echo Example: dev-with-ngrok.bat https://abc1-23-45-67-89.ngrok-free.app
    exit /b 1
)

set NGROK_URL=%1
echo Starting dev server with NEXTAUTH_URL=%NGROK_URL%
set NEXTAUTH_URL=%NGROK_URL%
npm run dev

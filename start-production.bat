@echo off
cd /d %~dp0
set NODE_ENV=production

echo ==============================================
echo          Family Notification System - Production Environment Startup Script
echo ==============================================

echo [1/3] Verifying Node.js environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js environment not found. Please install Node.js first.
    pause
    exit /b 1
)

echo [2/3] Setting production environment variables...
echo NODE_ENV=%NODE_ENV%

echo [2.5/3] Building application with webpack...
npm run build
if %errorlevel% neq 0 (
    echo ==============================================
    echo Build failed! Please check the error messages above.
    echo ==============================================
    pause
    exit /b %errorlevel%
)

echo [3/3] Starting application service...
node server/index.js

if %errorlevel% neq 0 (
    echo ==============================================
    echo Startup failed! Please check the error messages above.
    echo ==============================================
    pause
    exit /b %errorlevel%
)

pause
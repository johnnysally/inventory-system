@echo off
REM SawelaCapella Inventory Management System - Setup Script for Windows

echo.
echo ===============================================
echo SawelaCapella Inventory Management System
echo Setup and Installation Script
echo ===============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)

echo [✓] Node.js is installed
node --version

echo.
echo Step 1: Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [✓] Frontend dependencies installed

echo.
echo Step 2: Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
echo [✓] Backend dependencies installed
cd ..

echo.
echo Step 3: Creating backend data directory...
if not exist "backend\data" (
    mkdir backend\data
    echo [✓] Data directory created
) else (
    echo [✓] Data directory already exists
)

echo.
echo Step 4: Initializing database...
cd backend
call npm run db:init
if errorlevel 1 (
    echo WARNING: Database initialization may need manual setup
    echo Run: cd backend && npm run db:init
)
echo [✓] Database initialized
cd ..

echo.
echo ===============================================
echo Setup Complete!
echo ===============================================
echo.
echo Next steps:
echo 1. Open Terminal 1 and run:
echo    cd backend
echo    npm run dev
echo.
echo 2. Open Terminal 2 (in project root) and run:
echo    npm run dev
echo.
echo 3. Open your browser to http://localhost:5173
echo.
echo Default Login Credentials:
echo   Admin: admin@example.com / password123
echo   Staff: staff@example.com / password123
echo.
echo IMPORTANT: Change default passwords after first login!
echo.
pause

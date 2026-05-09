@echo off
echo ===================================================
echo 🚀 Career Readiness Suite - Setup & Run
echo ===================================================
echo.
echo Installing required dependencies...
call npm install

echo.
echo Starting the Next.js development server...
echo ⚠️  IMPORTANT: Keep this window open! 
echo ⚠️  Please open Google Chrome and go to: http://localhost:3000
echo.
call npm run dev

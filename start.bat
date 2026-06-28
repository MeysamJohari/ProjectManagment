@echo off
cd /d "%~dp0"

:restart
echo.
echo  [Personal PM] Checking data directory...
if not exist "data" mkdir data
if not exist "data\_inbox" mkdir data\_inbox

echo  [Personal PM] Killing old processes on ports 4001 and 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4001" 2^>nul') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" 2^>nul') do taskkill /PID %%a /F >nul 2>&1

echo  [Personal PM] Starting server and client...
call npm run dev

echo  [Personal PM] Server stopped. Restarting...
goto restart

@echo off
echo Starting FPS Monitor...

:: Start Backend
echo Starting Backend Server...
start "FPS Monitor Backend" cmd /k "cd backend && python monitor_server.py"

:: Start Frontend
echo Starting Frontend...
start "FPS Monitor Frontend" cmd /k "cd frontend && npm run dev"

echo Done! You can minimize this window.
timeout /t 5

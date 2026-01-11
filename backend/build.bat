@echo off
echo ==========================================
echo   Building FrameForge Server v2.0.0
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/4] Installing dependencies...
pip install -r requirements.txt --quiet

echo [2/4] Creating executable...
pyinstaller --noconfirm --onefile --windowed ^
    --name "FrameForgeServer" ^
    --icon "assets/icon.ico" ^
    --add-data "rtss_reader.py;." ^
    --add-data "mahm_reader.py;." ^
    --add-data "lhm_reader.py;." ^
    --hidden-import "win32com.client" ^
    --hidden-import "pythoncom" ^
    --hidden-import "pystray._win32" ^
    --hidden-import "PIL._tkinter_finder" ^
    frameforge_server.py

echo [3/4] Copying to dist folder...
if not exist "..\dist" mkdir "..\dist"
copy /Y "dist\FrameForgeServer.exe" "..\dist\FrameForgeServer.exe"

echo [4/4] Cleaning up...
rmdir /s /q build 2>nul
del /q *.spec 2>nul

echo.
echo ==========================================
echo   Build Complete!
echo   Output: ..\dist\FrameForgeServer.exe
echo ==========================================
pause

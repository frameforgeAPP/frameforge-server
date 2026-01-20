@echo off
echo Criando instalador do FrameForge Server...

set "ISCC_PATH=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"

if not exist "%ISCC_PATH%" (
    echo ERRO: Inno Setup Compiler nao encontrado em "%ISCC_PATH%"
    echo Por favor, verifique se o Inno Setup 6 esta instalado.
    pause
    exit /b 1
)

"%ISCC_PATH%" "setup.iss"

if %errorlevel% neq 0 (
    echo.
    echo Ocorreu um erro durante a compilacao.
    pause
    exit /b %errorlevel%
)

echo.
echo Instalador criado com sucesso na pasta Installers!
echo Copiando para a pasta amigo...

if not exist "amigo" mkdir "amigo"
copy "Installers\FrameForgeServer_Setup_v1.0.exe" "amigo\"

echo.
echo Concluido! O instalador esta na pasta 'amigo'.
pause

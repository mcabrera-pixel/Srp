@echo off
REM Convertir documento PDF/Word a Markdown
REM Uso: convertir.bat "ruta\al\archivo.pdf"

if "%~1"=="" (
    echo.
    echo Uso: convertir.bat "ruta\al\archivo.pdf"
    echo.
    echo Ejemplo:
    echo   convertir.bat "Data Procedimientos\SIGO y otros\PRO.0908.MPER1 (1).pdf"
    echo.
    exit /b 1
)

powershell -ExecutionPolicy Bypass -File "%~dp0convert-document.ps1" -InputFile "%~1"

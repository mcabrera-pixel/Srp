@echo off
REM ============================================================
REM Test Pipeline - Windows version
REM ============================================================
REM Usage:
REM   test-pipeline.bat document.md [video|audio|infographic]
REM ============================================================

setlocal enabledelayedexpansion

set "DOC_FILE=%~1"
set "CONTENT_TYPE=%~2"
if "%CONTENT_TYPE%"=="" set "CONTENT_TYPE=video"

if "%DOC_FILE%"=="" (
    echo Usage: test-pipeline.bat ^<document.md^> [video^|audio^|infographic]
    echo.
    echo Examples:
    echo   test-pipeline.bat input\procedure.md video
    echo   test-pipeline.bat input\procedure.md audio
    exit /b 1
)

if not exist "%DOC_FILE%" (
    echo Error: File not found: %DOC_FILE%
    exit /b 1
)

echo === NLM Pipeline Test ===
echo.

REM Check Claude Code
echo [1/4] Checking Claude Code...
where claude >nul 2>nul
if errorlevel 1 (
    echo   X Claude Code not found. Install from https://docs.anthropic.com/claude-code
    exit /b 1
)
echo   OK Claude Code found

REM Check NLM auth
echo [2/4] Checking NotebookLM auth...
nlm login --check >nul 2>nul
if errorlevel 1 (
    echo   ! NotebookLM auth expired. Running nlm login...
    nlm login
)
echo   OK NotebookLM authenticated

REM Prepare prompt
echo [3/4] Preparing prompt...
set "SCRIPT_DIR=%~dp0"
set "PROMPT_FILE=%SCRIPT_DIR%prompts\generate-%CONTENT_TYPE%.md"

if not exist "%PROMPT_FILE%" (
    echo   X Prompt template not found: %PROMPT_FILE%
    exit /b 1
)

REM Get basename for title
for %%F in ("%DOC_FILE%") do set "BASENAME=%%~nF"
echo   Title: %BASENAME%
echo   Type:  %CONTENT_TYPE%

REM Execute via Claude Code
echo [4/4] Executing via Claude Code...
echo   (This may take 2-5 minutes)
echo.

if not exist "%SCRIPT_DIR%output" mkdir "%SCRIPT_DIR%output"

REM Use PowerShell to do the template substitution and pipe to claude
powershell -NoProfile -Command ^
    "$template = Get-Content '%PROMPT_FILE%' -Raw; " ^
    "$doc = Get-Content '%DOC_FILE%' -Raw; " ^
    "$title = '%BASENAME%' -replace '_', ' '; " ^
    "$prompt = $template -replace '\{\{TITLE\}\}', $title -replace '\{\{DOCUMENT_CONTENT\}\}', $doc; " ^
    "$prompt | claude -p --allowedTools 'mcp__notebooklm-mcp__*' --output-format json" ^
    > "%SCRIPT_DIR%output\%BASENAME%_%CONTENT_TYPE%_result.json" 2>&1

if errorlevel 1 (
    echo.
    echo X Pipeline test failed!
    exit /b 1
)

echo.
echo OK Pipeline test completed!
echo   Result: output\%BASENAME%_%CONTENT_TYPE%_result.json
exit /b 0

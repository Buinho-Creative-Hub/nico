@echo off
rem Abre o IC Sensing Lab (Invisible Cartographies) no Chrome (ou no Edge). Funciona sem internet.
set "F=%~dp0index.html"
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%F%" & exit /b)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "%F%" & exit /b)
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "%F%" & exit /b)
start "" msedge "%F%"

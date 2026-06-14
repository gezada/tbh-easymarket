@echo off
:: ============================================================
::  TBH Easy Market - launcher
::  Porta: 5260 | Log: data\app.log
::  Modos: padrao com log | /silent
:: ============================================================
setlocal
set "DIR=%~dp0"
set "LOG=%DIR%data\app.log"
if not exist "%DIR%data" mkdir "%DIR%data"

if /i "%~1"=="/silent" goto silent

:cmd
echo  [TBH Easy Market] subindo em http://localhost:5260 ...
start "TBH Easy Market" /min /D "%DIR%" cmd /c "node server.mjs >nul 2>> data\app.log"
timeout /t 2 /nobreak >nul
start "" "http://localhost:5260"
powershell -NoProfile -Command "Get-Content '%LOG%' -Wait -Tail 30"
goto :eof

:silent
start "TBH Easy Market" /min /D "%DIR%" cmd /c "node server.mjs >nul 2>> data\app.log"
timeout /t 2 /nobreak >nul
start "" "http://localhost:5260"

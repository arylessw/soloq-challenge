@echo off
set "PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%"
cd /d "%~dp0"
echo Demarrage du site sur http://localhost:3000
npm run dev
pause

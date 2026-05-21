@echo off
set "PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%"
cd /d "%~dp0"

echo.
echo === Git push vers GitHub ===
echo.

git status
if errorlevel 1 (
  echo ERREUR: git ne fonctionne pas.
  pause
  exit /b 1
)

set /p REPO_URL="Colle l'URL de ton repo GitHub (ex: https://github.com/user/soloq-challenge.git): "
if "%REPO_URL%"=="" (
  echo URL vide, annule.
  pause
  exit /b 1
)

git remote remove origin 2>nul
git remote add origin "%REPO_URL%"
git branch -M main
git push -u origin main

if errorlevel 1 (
  echo.
  echo Echec du push. Connecte-toi a GitHub dans la fenetre qui s'ouvre.
) else (
  echo.
  echo OK ! Code envoye sur GitHub.
)

pause

@echo off
setlocal enabledelayedexpansion
set "PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%"
cd /d "%~dp0"

echo.
echo === SoloQ Challenge — commit + push GitHub ===
echo    (Vercel redéploiera automatiquement si le projet est lié)
echo.

git status
if errorlevel 1 (
  echo ERREUR: Git introuvable. Installe Git for Windows : https://git-scm.com/download/win
  pause
  exit /b 1
)

git add -A
git diff --cached --quiet
if not errorlevel 1 (
  echo Rien a committer.
) else (
  set /p MSG="Message de commit (Entree = deploy: cron, badges, inscription auto): "
  if "!MSG!"=="" set MSG=deploy: cron Vercel, badges rang, inscription auto, W/L defi
  git commit -m "%MSG%"
)

git remote get-url origin >nul 2>&1
if errorlevel 1 (
  echo.
  set /p REPO_URL="Pas de remote. Colle l'URL GitHub (ex: https://github.com/user/soloq-challenge.git): "
  if "!REPO_URL!"=="" (
    echo Annule.
    pause
    exit /b 1
  )
  git remote add origin "!REPO_URL!"
)

git branch -M main
git push -u origin main

if errorlevel 1 (
  echo.
  echo Echec du push. Verifie ta connexion GitHub.
) else (
  echo.
  echo OK — code sur GitHub. Verifie le deploiement sur vercel.com
)

pause

@echo off
setlocal enabledelayedexpansion
set "PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%"
cd /d "%~dp0"

echo.
echo === SoloQ Challenge — commit + push GitHub ===
echo.

git status
if errorlevel 1 (
  echo ERREUR: Git introuvable. Installe Git for Windows : https://git-scm.com/download/win
  pause
  exit /b 1
)

git remote get-url origin >nul 2>&1
if errorlevel 1 (
  echo Pas de remote "origin" configure.
  set /p REPO_URL="Colle l'URL GitHub du BON repo (ex: https://github.com/arylessw/soloq-challenge.git): "
  if "!REPO_URL!"=="" (
    echo Annule.
    pause
    exit /b 1
  )
  git remote add origin "!REPO_URL!"
) else (
  for /f "delims=" %%R in ('git remote get-url origin') do set "CURRENT_REMOTE=%%R"
  echo.
  echo Remote actuel : !CURRENT_REMOTE!
  echo   ^(Vercel redeploie le projet LIE a ce repo GitHub^)
  echo.
  set /p CONFIRM="Continuer le push vers ce repo ? (O/n): "
  if /i "!CONFIRM!"=="n" (
    echo.
    set /p REPO_URL="Nouvelle URL GitHub: "
    if "!REPO_URL!"=="" (
      echo Annule.
      pause
      exit /b 1
    )
    git remote set-url origin "!REPO_URL!"
    echo Remote mis a jour : !REPO_URL!
  )
)

git add -A
git diff --cached --quiet
if not errorlevel 1 (
  echo Rien a committer.
) else (
  set /p MSG="Message de commit (Entree = mise a jour site): "
  if "!MSG!"=="" set MSG=mise a jour site SoloQ Challenge
  git commit -m "!MSG!"
)

git branch -M main
git push -u origin main

if errorlevel 1 (
  echo.
  echo Echec du push. Verifie ta connexion GitHub.
) else (
  echo.
  echo OK — code pousse sur GitHub.
  echo.
  echo IMPORTANT : le deploiement doit aller sur soloq-challenge-kappa.vercel.app
  echo PAS sur l-rust-omega.vercel.app — voir VERCEL-PROJET.md si mauvais site.
  echo Variables requises : DATABASE_URL, RIOT_API_KEY, SESSION_SECRET, ADMIN_SECRET
  echo Sur Vercel : NEXT_PUBLIC_SITE_URL = https://soloq-challenge-kappa.vercel.app
)

pause

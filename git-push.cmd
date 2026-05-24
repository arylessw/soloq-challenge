@echo off
echo.
echo ATTENTION : utilise plutot push-deploy.cmd (commit + confirmation du repo).
echo Ce script ne change plus le remote automatiquement.
echo.
pause

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

for /f "delims=" %%R in ('git remote get-url origin 2^>nul') do set "CURRENT=%%R"
if defined CURRENT (
  echo Remote actuel : %CURRENT%
  set /p REPO_URL="Nouvelle URL (Entree = garder l'actuel): "
) else (
  set /p REPO_URL="URL du repo GitHub: "
)

if not "%REPO_URL%"=="" (
  git remote remove origin 2>nul
  git remote add origin "%REPO_URL%"
)

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

# Colle cette ligne dans ton terminal PowerShell, ou fais clic-droit > Executer avec PowerShell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
Write-Host "PATH mis a jour." -ForegroundColor Green
Write-Host "git:  $(git --version 2>&1)"
Write-Host "npm:  $(npm --version 2>&1)"
Set-Location $PSScriptRoot

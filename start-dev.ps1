# Galaksi Motor - Local Gelistirme Baslatici
# Kullanim: Terminalde .\start-dev.ps1

$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe"
$mysqlIni = "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"

$proc = Get-Process mysqld -ErrorAction SilentlyContinue
if (-not $proc) {
    Write-Host "MySQL baslatiliyor..." -ForegroundColor Yellow
    Start-Process -FilePath $mysqlExe -ArgumentList "--defaults-file=`"$mysqlIni`"" -WindowStyle Hidden
    Start-Sleep -Seconds 4
    Write-Host "MySQL calisiyor." -ForegroundColor Green
} else {
    Write-Host "MySQL zaten calisiyor." -ForegroundColor Green
}

Write-Host "Next.js dev server baslatiliyor (http://localhost:3000)..." -ForegroundColor Cyan
npm run dev

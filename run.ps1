# Скрипт запуска проекта Formula Health

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Formula Health - Запуск" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Проверяем Node.js
$nodeVersion = node --version
Write-Host "Node.js версия: $nodeVersion" -ForegroundColor Green

# Проверяем наличие node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "Установка зависимостей фронтенда..." -ForegroundColor Yellow
    npm install
}

# Проверяем бэкенд
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "Установка зависимостей бэкенда..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Откройте два окна:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Окно 1 (Бэкенд):" -ForegroundColor Yellow
Write-Host "  cd backend"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "  Окно 2 (Фронтенд):" -ForegroundColor Yellow
Write-Host "  npm run dev"
Write-Host ""
Write-Host "  Или запустите команды вручную в двух терминалах" -ForegroundColor White
Write-Host ""

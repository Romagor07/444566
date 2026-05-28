@echo off
echo ========================================
echo   Formula Health - Запуск
echo ========================================
echo.

REM Запускаем бэкенд в новом окне
start "Formula Health - Backend" cmd /k "cd backend && npm run dev"

REM Ждем 2 секунды
timeout /t 2 /nobreak >nul

REM Запускаем фронтенд в новом окне
start "Formula Health - Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   Окна запущены!
echo ========================================
echo.
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:5173
echo.
echo   Тестовый пользователь:
echo   Email: test@example.com
echo   Password: password123
echo.

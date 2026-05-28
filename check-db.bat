@echo off
echo ========================================
echo   Проверка базы данных MySQL
echo ========================================
echo.

echo Проверьте, что MySQL запущен:
echo   services.msc - найдите службу MySQL
echo.

echo Запустите эту команду для создания БД:
echo   mysql -u root -p < backend\database.sql
echo.

pause

# ИНСТРУКЦИЯ ПО ЗАПУСКУ

## Шаг 1: Установка зависимостей

### Фронтенд (в корне проекта):
```bash
npm install
```

### Бэкенд:
```bash
cd backend
npm install
cd ..
```

## Шаг 2: Настройка MySQL

### 2.1 Убедитесь, что MySQL запущен:

**Windows:**
- Откройте "Службы" (services.msc)
- Найдите службу MySQL
- Запустите её, если остановлена

**macOS:**
```bash
brew services list | grep mysql
brew services start mysql
```

**Linux:**
```bash
sudo systemctl status mysql
sudo systemctl start mysql
```

### 2.2 Создайте базу данных:

```bash
mysql -u root -p < backend/database.sql
```

Введите пароль от MySQL при запросе.

**ИЛИ** выполните вручную в MySQL клиенте:
```sql
CREATE DATABASE formula_health;
USE formula_health;
-- затем скопируйте и выполните содержимое backend/database.sql
```

## Шаг 3: Настройте переменные окружения

### Бэкенд (backend/.env) - отредактируйте:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=ваш_реальный_пароль_от_mysql
DB_NAME=formula_health
JWT_SECRET=замените_на_случайную_строку
```

### Фронтенд (.env) - уже создан:
```env
PORT=5173
BASE_PATH=/
VITE_API_URL=http://localhost:3000/api
```

## Шаг 4: Запуск

### Вариант A: Отдельно (два терминала)

**Терминал 1 - Бэкенд:**
```bash
cd backend
npm run dev
```

**Терминал 2 - Фронтенд:**
```bash
npm run dev
```

### Вариант B: Одновременно (один терминал)
```bash
npm run start:all
```

## Шаг 5: Открытие приложения

- **Фронтенд:** http://localhost:5173
- **API:** http://localhost:3000/api
- **Health check:** http://localhost:3000/api/health

## Тестовые данные

**Логин:** test@example.com  
**Пароль:** password123

## Проверка работы

1. Откройте http://localhost:5173
2. Попробуйте войти с тестовыми данными
3. Или зарегистрируйте нового пользователя

## Возможные проблемы

### "Cannot connect to MySQL"
- Проверьте, что MySQL запущен
- Проверьте пароль в backend/.env
- Убедитесь, что БД formula_health создана

### "PORT environment variable is required"
- Проверьте наличие файла .env в корне
- Убедитесь, что переменные PORT и BASE_PATH заданы

### "CORS error"
- Убедитесь, что бэкенд запущен на порту 3000
- Проверьте VITE_API_URL в .env фронтенда

## Полезные команды

```bash
# Пересоздание БД
mysql -u root -p -e "DROP DATABASE IF EXISTS formula_health; CREATE DATABASE formula_health;"
mysql -u root -p formula_health < backend/database.sql

# Очистка и перезапуск
rm -rf node_modules backend/node_modules
npm install
cd backend && npm install && cd ..
```

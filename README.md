# Formula Health - Интернет-магазин здорового образа жизни

## Структура проекта

```
.
├── frontend/          # React + Vite приложение
├── backend/           # Node.js + Express API
│   ├── server.js      # Основной сервер
│   ├── database.sql   # SQL скрипт для БД
│   └── .env           # Переменные окружения
└── README.md
```

## Требования

- Node.js 18+
- MySQL 5.7+ или MariaDB 10.3+
- npm или yarn

## Быстрый старт

### 1. Установка зависимостей

**Фронтенд:**
```bash
npm install
```

**Бэкенд:**
```bash
cd backend
npm install
```

### 2. Настройка базы данных

```bash
# Подключитесь к MySQL и выполните:
mysql -u root -p < backend/database.sql
```

Или вручную:
```sql
CREATE DATABASE formula_health;
USE formula_health;
-- затем выполните содержимое backend/database.sql
```

### 3. Настройка переменных окружения

**Бэкенд (`backend/.env`):**
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=ваш_пароль
DB_NAME=formula_health
JWT_SECRET=ваш_секретный_ключ
```

**Фронтенд (`.env`):**
```env
PORT=5173
BASE_PATH=/
VITE_API_URL=http://localhost:3000/api
```

### 4. Запуск

**Отдельно бэкенд:**
```bash
cd backend
npm run dev
```

**Отдельно фронтенд:**
```bash
npm run dev
```

**Или в двух терминалах одновременно:**
- Терминал 1: `cd backend && npm run dev`
- Терминал 2: `npm run dev`

## Доступ к приложению

- Фронтенд: http://localhost:5173
- API: http://localhost:3000/api
- Health check: http://localhost:3000/api/health

## Тестовые данные

**Пользователь:**
- Email: test@example.com
- Пароль: password123

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь (нужен токен)

### Продукты
- `GET /api/products` - Список продуктов
- `GET /api/products/:id` - Детали продукта

### Корзина
- `GET /api/cart` - Получить корзину
- `POST /api/cart` - Добавить в корзину
- `DELETE /api/cart/:productId` - Удалить из корзины

### Заказы
- `POST /api/orders` - Создать заказ
- `GET /api/orders` - История заказов

### Избранное
- `GET /api/favorites` - Список избранного
- `POST /api/favorites` - Добавить в избранное
- `DELETE /api/favorites/:productId` - Удалить из избранного

## Команды сборки

**Бэкенд:**
```bash
cd backend
npm start
```

**Фронтенд:**
```bash
npm run build
npm run serve
```

## Примечания

- Убедитесь, что MySQL сервер запущен перед стартом бэкенда
- Пароль пользователя по умолчанию: `password123`
- JWT токены действительны 7 дней

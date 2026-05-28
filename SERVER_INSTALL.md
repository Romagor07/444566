# Установка Formula Health на Linux сервер

## Быстрый старт

### 1. Подготовьте сервер

- Ubuntu 20.04+ / Debian 10+
- Минимум 2GB RAM
- root доступ

### 2. Скачайте файлы проекта

```bash
# Поднимитесь на уровень выше или создайте временную директорию
cd /tmp

# Скопируйте все файлы проекта (или используйте git clone)
# cp -r /путь/к/проекту/* .
```

### 3. Загрузите скрипт на сервер

```bash
# Вариант 1: Через SCP/SFTP
scp install-simple.sh user@your-server:/tmp/

# Вариант 2: Через git
git clone https://github.com/your-repo/formula-health.git
cd formula-health
```

### 4. Запустите установку

```bash
# Сделайте скрипт исполняемым
chmod +x install-simple.sh

# Запустите от root
sudo ./install-simple.sh
```

## Что делает скрипт

1. **Обновление системы** - apt update & upgrade
2. **Node.js 20.x** - установка + PM2
3. **MySQL** - установка + создание БД
4. **PHP + phpMyAdmin** - установка + настройка Apache
5. **Nginx** -反向代理 для фронтенда и API
6. **UFW** - настройка брандмауэра

## После установки

### Доступы

| Сервис | URL | Логин/Пароль |
|--------|-----|--------------|
| Сайт | http://ваш-ip | - |
| phpMyAdmin | http://ваш-ip/phpmyadmin | formula_user / FormulaHealth2024! |
| API Health | http://ваш-ip/api/health | - |

### Тестовый пользователь сайта

- **Email:** test@example.com
- **Пароль:** password123

### Управление через PM2

```bash
# Статус приложений
pm2 status

# Просмотр логов
pm2 logs

# Перезапуск
pm2 restart all

# Остановка
pm2 stop all

# Старт при загрузке
pm2 startup
pm2 save
```

### Управление MySQL

```bash
# Подключение к БД
mysql -u formula_user -p formula_health
# Пароль: FormulaHealth2024!

# Резервное копирование
mysqldump -u formula_user -p formula_health > backup.sql

# Восстановление
mysql -u formula_user -p formula_health < backup.sql
```

### Управление Nginx

```bash
# Проверка конфигурации
nginx -t

# Перезапуск
systemctl restart nginx

# Статус
systemctl status nginx
```

## Изменение паролей

### MySQL пароль

```bash
mysql -u root
```

```sql
ALTER USER 'formula_user'@'localhost' IDENTIFIED BY 'новый_пароль';
FLUSH PRIVILEGES;
```

Не забудьте обновить `backend/.env` и `ecosystem.config.js`!

### Пароль администратора сайта

Зарегистрируйте нового пользователя через форму регистрации на сайте.

## Настройка HTTPS (опционально)

```bash
# Установка Certbot
apt install -y certbot python3-certbot-nginx

# Получение сертификата
certbot --nginx -d ваш-домен.com

# Автообновление
certbot renew --dry-run
```

## Мониторинг

### Логи приложений

```bash
pm2 logs formula-backend
pm2 logs formula-frontend
```

### Логи Nginx

```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Мониторинг MySQL

```bash
mysql -u formula_user -p -e "SHOW PROCESSLIST;"
```

## Резервное копирование

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/formula-health"

mkdir -p $BACKUP_DIR

# Бэкап БД
mysqldump -u formula_user -p'FormulaHealth2024!' formula_health > $BACKUP_DIR/db_$DATE.sql

# Бэкап файлов
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/formula-health

# Хранение 7 дней
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

## Устранение проблем

### PM2 не запускается

```bash
pm2 delete all
pm2 startup
pm2 start ecosystem.config.js
pm2 save
```

### Nginx не работает

```bash
nginx -t
systemctl status nginx
journalctl -xe
```

### MySQL не подключается

```bash
systemctl status mysql
mysql -u root -p
```

### Порт занят

```bash
netstat -tulpn | grep :3000
netstat -tulpn | grep :5173
```

## Контакты

При возникновении проблем проверьте логи:
- `pm2 logs`
- `/var/log/nginx/error.log`
- `journalctl -u mysql`

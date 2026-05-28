#!/bin/bash

# ============================================
# Formula Health - Установочный скрипт для Linux
# ============================================

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции вывода
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка прав root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Запустите скрипт от имени root: sudo ./install-server.sh"
        exit 1
    fi
}

# Очистка экрана
clear

echo -e "${GREEN}"
echo "╔════════════════════════════════════════════╗"
echo "║  Formula Health - Установка на Linux      ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Проверка прав
check_root

# ============================================
# Шаг 1: Обновление системы
# ============================================
echo ""
echo "=========================================="
echo "  Шаг 1: Обновление системы"
echo "=========================================="

log_info "Обновление пакетов..."
apt update && apt upgrade -y

log_success "Система обновлена"

# ============================================
# Шаг 2: Установка Node.js и npm
# ============================================
echo ""
echo "=========================================="
echo "  Шаг 2: Установка Node.js"
echo "=========================================="

log_info "Установка Node.js 18+..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

NODE_VERSION=$(node --version)
log_success "Node.js установлен: $NODE_VERSION"

log_info "Установка PM2 для управления процессами..."
npm install -g pm2
log_success "PM2 установлен"

# ============================================
# Шаг 3: Установка MySQL
# ============================================
echo ""
echo "=========================================="
echo "  Шаг 3: Установка MySQL"
echo "=========================================="

log_info "Установка MySQL сервера..."
DEBIAN_FRONTEND=noninteractive apt install -y mysql-server

log_info "Безопасная настройка MySQL..."
mysql_secure_installation <<EOF
n
y
y
y
y
EOF

# Создаём базу данных
log_info "Создание базы данных..."
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS formula_health;
CREATE USER IF NOT EXISTS 'formula_user'@'localhost' IDENTIFIED BY 'FormulaHealth2024!';
GRANT ALL PRIVILEGES ON formula_health.* TO 'formula_user'@'localhost';
FLUSH PRIVILEGES;
EOF

log_success "MySQL установлен и настроен"

# ============================================
# Шаг 4: Установка phpMyAdmin
# ============================================
echo ""
echo "=========================================="
echo "  Шаг 4: Установка phpMyAdmin"
echo "=========================================="

log_info "Установка PHP и необходимых расширений..."
DEBIAN_FRONTEND=noninteractive apt install -y php php-mysql php-gd php-mbstring php-xml php-curl php-zip

log_info "Установка phpMyAdmin..."
DEBIAN_FRONTEND=noninteractive apt install -y phpmyadmin

# Настройка Apache для phpMyAdmin
log_info "Настройка Apache..."
echo "Include /etc/phpmyadmin/apache.conf" >> /etc/apache2/apache2.conf

# Перезапуск Apache
systemctl restart apache2

log_success "phpMyAdmin установлен"
log_warning "Доступ к phpMyAdmin: http://ваш-сервер/phpmyadmin"
log_warning "Логин: formula_user, Пароль: FormulaHealth2024!"

# ============================================
# Шаг 5: Установка и настройка проекта
# ============================================
echo ""
echo "=========================================="
echo "  Шаг 5: Установка проекта"
echo "=========================================="

# Создаём директорию для проекта
PROJECT_DIR="/var/www/formula-health"
log_info "Создание директории проекта: $PROJECT_DIR"
mkdir -p $PROJECT_DIR
mkdir -p $PROJECT_DIR/backend

# Копируем файлы проекта (предполагается, что они есть в текущей директории)
log_info "Копирование файлов проекта..."

# Фронтенд
if [ -d "node_modules" ]; then
    cp -r node_modules $PROJECT_DIR/
fi
if [ -f "package.json" ]; then
    cp package.json $PROJECT_DIR/
fi
if [ -f "vite.config.ts" ]; then
    cp vite.config.ts $PROJECT_DIR/
fi
if [ -f "tsconfig.json" ]; then
    cp tsconfig.json $PROJECT_DIR/
fi
if [ -f ".env" ]; then
    cp .env $PROJECT_DIR/
fi

# Копируем HTML, CSS, JS файлы
cp -r *.html *.css *.js images/ public/ 2>/dev/null || true
cp -r *.html *.css *.js images/ public/ $PROJECT_DIR/ 2>/dev/null || true

# Копируем src
if [ -d "src" ]; then
    cp -r src $PROJECT_DIR/
fi
if [ -d "components" ]; then
    cp -r components $PROJECT_DIR/
fi

# Бэкенд
if [ -d "backend" ]; then
    cp -r backend/* $PROJECT_DIR/backend/
fi

# Устанавливаем зависимости
cd $PROJECT_DIR
log_info "Установка зависимостей фронтенда..."
npm install --production

cd $PROJECT_DIR/backend
log_info "Установка зависимостей бэкенда..."
npm install --production

cd $PROJECT_DIR

# Импортируем схему БД
if [ -f "backend/database.sql" ]; then
    log_info "Импорт схемы базы данных..."
    mysql -u formula_user -p'FormulaHealth2024!' formula_health < backend/database.sql
    log_success "База данных импортирована"
fi

# ============================================
# Шаг 6: Настройка PM2
# ============================================
echo ""
echo "=========================================="
echo "  Шаг 6: Настройка PM2"
echo "=========================================="

# Создаём файл конфигурации PM2
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [
    {
      name: 'formula-backend',
      cwd: '/var/www/formula-health/backend',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_HOST: 'localhost',
        DB_USER: 'formula_user',
        DB_PASSWORD: 'FormulaHealth2024!',
        DB_NAME: 'formula_health',
        JWT_SECRET: 'change-this-to-random-secret-key-in-production-2024'
      }
    },
    {
      name: 'formula-frontend',
      cwd: '/var/www/formula-health',
      script: 'npm',
      args: 'run serve',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5173,
        BASE_PATH: '/',
        VITE_API_URL: 'http://localhost:3000/api'
      }
    }
  ]
};
EOF

log_info "Запуск приложений через PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

log_success "PM2 настроен"

# ============================================
# Шаг 7: Настройка Nginx (прокси)
# ============================================
echo ""
echo "=========================================="
echo "  Шаг 7: Настройка Nginx"
echo "=========================================="

log_info "Установка Nginx..."
apt install -y nginx

# Создаём конфигурацию Nginx
cat > /etc/nginx/sites-available/formula-health <<EOF
server {
    listen 80;
    server_name _;

    # Фронтенд
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # phpMyAdmin
    location /phpmyadmin {
        alias /usr/share/phpmyadmin;
        index index.php;
        
        location ~ \.php$ {
            fastcgi_pass unix:/run/php/php8.1-fpm.sock;
            fastcgi_index index.php;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME \$request_filename;
        }
    }

    # Статические файлы
    location /static {
        alias /var/www/formula-health/dist/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Включаем сайт
ln -sf /etc/nginx/sites-available/formula-health /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверяем конфигурацию и перезапускаем
nginx -t
systemctl restart nginx

log_success "Nginx настроен"

# ============================================
# Шаг 8: Настройка брандмауэра
# ============================================
echo ""
echo "=========================================="
echo "  Шаг 8: Настройка брандмауэра"
echo "=========================================="

log_info "Настройка UFW..."
ufw allow 'Nginx Full'
ufw allow 'MySQL'
ufw allow 22/tcp
ufw --force enable

log_success "Брандмауэр настроен"

# ============================================
# Шаг 9: Создание тестового пользователя
# ============================================
echo ""
echo "=========================================="
echo "  Шаг 9: Тестовый пользователь"
echo "=========================================="

log_info "Создание тестового пользователя в БД..."
mysql -u formula_user -p'FormulaHealth2024!' formula_health <<EOF
INSERT INTO users (name, email, password_hash, phone) VALUES 
('Тестовый Пользователь', 'test@example.com', '\$2a\$10\$YQ5EJ6vZnLPJRDJE5QqLs.7KZKZKZKZKZKZKZKZKZKZKZKZKZKZK', '89001234567')
ON DUPLICATE KEY UPDATE name='Тестовый Пользователь';
EOF

log_success "Тестовый пользователь создан"
log_warning "Email: test@example.com"
log_warning "Пароль: password123"

# ============================================
# Итоговая информация
# ============================================
echo ""
echo "=========================================="
echo "  ✅ Установка завершена!"
echo "=========================================="
echo ""
echo -e "${GREEN}Доступ к сервисам:${NC}"
echo "  🌐 Сайт:        http://ваш-сервер-ip"
echo "  📊 phpMyAdmin:  http://ваш-сервер-ip/phpmyadmin"
echo "  🔌 API:         http://ваш-сервер-ip/api/health"
echo ""
echo -e "${YELLOW}Управление PM2:${NC}"
echo "  pm2 status        - статус приложений"
echo "  pm2 logs          - логи"
echo "  pm2 restart all   - перезапуск"
echo "  pm2 stop all      - остановка"
echo ""
echo -e "${YELLOW}Управление MySQL:${NC}"
echo "  mysql -u formula_user -p formula_health"
echo "  Пароль: FormulaHealth2024!"
echo ""
echo -e "${YELLOW}Тестовый пользователь:${NC}"
echo "  Email: test@example.com"
echo "  Пароль: password123"
echo ""
echo -e "${BLUE}========================================${NC}"
echo ""

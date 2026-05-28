#!/bin/bash

# ============================================
# Formula Health - Быстрая установка
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

clear

echo -e "${GREEN}"
echo "╔════════════════════════════════════════════╗"
echo "║  Formula Health - Быстрая установка       ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

if [ "$EUID" -ne 0 ]; then
    log_error "Запустите: sudo ./install-simple.sh"
    exit 1
fi

# 1. Обновление
log_info "Обновление системы..."
apt update && apt upgrade -y

# 2. Node.js
log_info "Установка Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# 3. MySQL
log_info "Установка MySQL..."
DEBIAN_FRONTEND=noninteractive apt install -y mysql-server

mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS formula_health;
CREATE USER IF NOT EXISTS 'formula_user'@'localhost' IDENTIFIED BY 'FormulaHealth2024!';
GRANT ALL PRIVILEGES ON formula_health.* TO 'formula_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# 4. PHP + phpMyAdmin
log_info "Установка PHP и phpMyAdmin..."
DEBIAN_FRONTEND=noninteractive apt install -y php php-mysql php-gd php-mbstring php-xml php-curl php-zip
DEBIAN_FRONTEND=noninteractive apt install -y phpmyadmin

echo "Include /etc/phpmyadmin/apache.conf" >> /etc/apache2/apache2.conf
systemctl restart apache2

# 5. Проект
PROJECT_DIR="/var/www/formula-health"
mkdir -p $PROJECT_DIR/backend

log_info "Копирование файлов проекта..."
cp -r * $PROJECT_DIR/ 2>/dev/null || true
cp -r backend/* $PROJECT_DIR/backend/ 2>/dev/null || true

cd $PROJECT_DIR
npm install --production
cd backend && npm install --production && cd ..

# 6. Импорт БД
if [ -f "backend/database.sql" ]; then
    mysql -u formula_user -p'FormulaHealth2024!' formula_health < backend/database.sql
fi

# 7. PM2
cat > $PROJECT_DIR/ecosystem.config.js <<EOF
module.exports = {
  apps: [
    {
      name: 'formula-backend',
      cwd: '/var/www/formula-health/backend',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_HOST: 'localhost',
        DB_USER: 'formula_user',
        DB_PASSWORD: 'FormulaHealth2024!',
        DB_NAME: 'formula_health',
        JWT_SECRET: 'change-this-to-random-secret-key-2024'
      }
    },
    {
      name: 'formula-frontend',
      cwd: '/var/www/formula-health',
      script: 'npm',
      args: 'run serve',
      env: {
        NODE_ENV: 'production',
        PORT: 5173,
        VITE_API_URL: 'http://localhost:3000/api'
      }
    }
  ]
};
EOF

cd $PROJECT_DIR
pm2 start ecosystem.config.js
pm2 save

# 8. Nginx
apt install -y nginx

cat > /etc/nginx/sites-available/formula-health <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /phpmyadmin {
        alias /usr/share/phpmyadmin;
        index index.php;
        location ~ \.php$ {
            fastcgi_pass unix:/run/php/php8.1-fpm.sock;
            fastcgi_index index.php;
            include fastcgi_params;
        }
    }
}
EOF

ln -sf /etc/nginx/sites-available/formula-health /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# 9. UFW
ufw allow 'Nginx Full'
ufw allow 22/tcp
ufw --force enable

# 10. Тестовый пользователь
mysql -u formula_user -p'FormulaHealth2024!' formula_health <<EOF
INSERT INTO users (name, email, password_hash, phone) VALUES 
('Тестовый', 'test@example.com', '\$2a\$10\$YQ5EJ6vZnLPJRDJE5QqLs.7KZKZKZKZKZKZKZKZKZKZKZKZKZKZK', '89001234567')
ON DUPLICATE KEY UPDATE name='Тестовый';
EOF

echo ""
echo "=========================================="
echo "  ✅ Установка завершена!"
echo "=========================================="
echo ""
echo "Сайт:    http://ваш-ip"
echo "phpMyAdmin: http://ваш-ip/phpmyadmin"
echo "API:     http://ваш-ip/api/health"
echo ""
echo "Тестовый пользователь:"
echo "Email: test@example.com"
echo "Пароль: password123"
echo ""
echo "PM2 команды:"
echo "pm2 status - статус"
echo "pm2 logs   - логи"
echo ""

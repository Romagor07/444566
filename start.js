#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function runCommand(command, description) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📦 ${description}`);
  console.log(`${'='.repeat(50)}`);
  try {
    execSync(command, { stdio: 'inherit', cwd: __dirname });
    console.log(`✅ ${description} - успешно!`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - ошибка!`);
    return false;
  }
}

console.log('\n╔═══════════════════════════════════════════════╗');
console.log('║  Formula Health - Настройка проекта          ║');
console.log('╚═══════════════════════════════════════════════╝\n');

// Проверка MySQL
console.log('ℹ️  Убедитесь, что MySQL сервер запущен!');
console.log('   Windows: Проверьте службу "MySQL" в services.msc');
console.log('   macOS:brew services list | grep mysql');
console.log('   Linux: sudo systemctl status mysql\n');

const answer = prompt('Продолжить? (yes/no): ');
if (answer !== 'yes') {
  console.log('❌ Настройка отменена');
  process.exit(0);
}

// Установка зависимостей бэкенда
const backendOk = runCommand('npm install', 'Установка зависимостей бэкенда', 'backend');

if (!backendOk) {
  console.error('\n❌ Остановка из-за ошибки в бэкенде');
  process.exit(1);
}

console.log('\n╔═══════════════════════════════════════════════╗');
console.log('║  Настройка базы данных                        ║');
console.log('╚═══════════════════════════════════════════════╝\n');
console.log('ℹ️  Выполните команду для создания БД:');
console.log('');
console.log('   mysql -u root -p < backend/database.sql');
console.log('');
console.log('Или вручную в MySQL:');
console.log('   CREATE DATABASE formula_health;');
console.log('   USE formula_health;');
console.log('   -- затем скопируйте содержимое backend/database.sql');
console.log('');

const dbAnswer = prompt('База данных создана? (yes/no): ');

if (dbAnswer === 'yes') {
  // Установка зависимостей фронтенда
  runCommand('npm install', 'Установка зависимостей фронтенда');

  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║  Готово! Запуск приложения                    ║');
  console.log('╚═══════════════════════════════════════════════╝\n');
  console.log('📌 Откройте два терминала:');
  console.log('');
  console.log('   Терминал 1 (Бэкенд):');
  console.log('   cd backend && npm run dev');
  console.log('');
  console.log('   Терминал 2 (Фронтенд):');
  console.log('   npm run dev');
  console.log('');
  console.log('🌐 После запуска:');
  console.log('   Фронтенд: http://localhost:5173');
  console.log('   API:      http://localhost:3000/api');
  console.log('');
  console.log('🧪 Тестовый пользователь:');
  console.log('   Email:    test@example.com');
  console.log('   Пароль:   password123');
  console.log('');
} else {
  console.log('\n❌ Сначала создайте базу данных!');
}

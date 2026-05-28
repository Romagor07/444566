import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createPool } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// MySQL Pool Connection
const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Успешное подключение к MySQL');
    connection.release();
  } catch (error) {
    console.error('❌ Ошибка подключения к MySQL:', error.message);
    console.log('Убедитесь, что MySQL запущен и база данных "formula_health" создана');
  }
}

// Middleware для проверки JWT токена
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа не предоставлен' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
}

// ============ АВТОРИЗАЦИЯ ============

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Имя, email и пароль обязательны' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
    }

    // Проверка существования пользователя
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хэширование пароля
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Вставка пользователя
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, phone || null]
    );

    // Генерация токена
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      phone,
      token
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    // Поиск пользователя
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const user = users[0];

    // Проверка пароля
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Генерация токена
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

// Получить текущего пользователя
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============ ПРОДУКТЫ ============

app.get('/api/products', async (req, res) => {
  try {
    const [products] = await pool.execute(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    res.json(products);
  } catch (error) {
    console.error('Ошибка получения продуктов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Продукт не найден' });
    }

    res.json(products[0]);
  } catch (error) {
    console.error('Ошибка получения продукта:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============ КОРЗИНА ============

app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const [items] = await pool.execute(
      `SELECT c.*, p.name, p.price, p.image_url 
       FROM cart_items c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [req.user.userId]
    );
    res.json(items);
  } catch (error) {
    console.error('Ошибка получения корзины:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    // Проверка существования продукта
    const [products] = await pool.execute('SELECT id FROM products WHERE id = ?', [product_id]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Продукт не найден' });
    }

    // Проверка наличия в корзине
    const [existing] = await pool.execute(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.userId, product_id]
    );

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
        [quantity, existing[0].id]
      );
    } else {
      await pool.execute(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.userId, product_id, quantity]
      );
    }

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Ошибка добавления в корзину:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/cart/:productId', authenticateToken, async (req, res) => {
  try {
    await pool.execute(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.userId, req.params.productId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления из корзины:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============ ЗАКАЗЫ ============

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, total, delivery_info, payment_info } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Корзина пуста' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Создание заказа
      const [orderResult] = await connection.execute(
        'INSERT INTO orders (user_id, total, status, delivery_info, payment_info) VALUES (?, ?, ?, ?, ?)',
        [req.user.userId, total, 'pending', JSON.stringify(delivery_info), JSON.stringify(payment_info)]
      );

      // Добавление позиций заказа
      for (const item of items) {
        await connection.execute(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderResult.insertId, item.product_id, item.quantity, item.price]
        );
      }

      // Очистка корзины
      await connection.execute(
        'DELETE FROM cart_items WHERE user_id = ?',
        [req.user.userId]
      );

      await connection.commit();
      res.status(201).json({ success: true, orderId: orderResult.insertId });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.*, 
       (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
       FROM orders o 
       WHERE o.user_id = ? 
       ORDER BY o.created_at DESC`,
      [req.user.userId]
    );
    res.json(orders);
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============ ИЗБРАННОЕ ============

app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const [items] = await pool.execute(
      `SELECT f.*, p.name, p.price, p.image_url 
       FROM favorites f 
       JOIN products p ON f.product_id = p.id 
       WHERE f.user_id = ?`,
      [req.user.userId]
    );
    res.json(items);
  } catch (error) {
    console.error('Ошибка получения избранного:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const { product_id } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
      [req.user.userId, product_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Товар уже в избранном' });
    }

    await pool.execute(
      'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
      [req.user.userId, product_id]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Ошибка добавления в избранное:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/favorites/:productId', authenticateToken, async (req, res) => {
  try {
    await pool.execute(
      'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
      [req.user.userId, req.params.productId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления из избранного:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Запуск сервера
testConnection().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API сервер запущен на http://localhost:${PORT}`);
  });
});

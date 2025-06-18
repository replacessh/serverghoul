import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validate } from 'class-validator';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const userRepository = AppDataSource.getRepository(User);

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Проверка существования пользователя
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = userRepository.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role: UserRole.USER
    });

    // Валидация
    const errors = await validate(user);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    await userRepository.save(user);

    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Проверка пароля
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Проверка блокировки
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Ваш аккаунт заблокирован' });
    }

    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Получение информации о текущем пользователе
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const user = await userRepository.findOne({
      where: { id: req.user.id },
      select: ['id', 'name', 'email', 'role', 'isBlocked']
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

export default router; 
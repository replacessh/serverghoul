import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../entities/User';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { validate } from 'class-validator';
import { FindOptionsWhere } from 'typeorm';
import bcrypt from 'bcryptjs';
import { requireRole } from '../middleware/role';

const router = Router();
const userRepository = AppDataSource.getRepository(User);

// Middleware для проверки аутентификации
router.use(authMiddleware);

// Получить профиль пользователя
router.get('/profile', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const user = await userRepository.findOne({
      where: { id: userId } as FindOptionsWhere<User>,
      select: ['id', 'name', 'email', 'phone', 'role', 'isBlocked', 'favoriteProductIds']
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Ошибка при получении профиля' });
  }
});

// Обновить профиль пользователя
router.put('/profile', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone } = req.body;

    const user = await userRepository.findOne({
      where: { id: userId } as FindOptionsWhere<User>
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверка уникальности email
    if (email && email !== user.email) {
      const existingUser = await userRepository.findOne({
        where: { email } as FindOptionsWhere<User>
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
      }
    }

    // Обновление данных
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    const errors = await validate(user);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    await userRepository.save(user);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

// Изменить пароль
router.put('/profile/password', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await userRepository.findOne({
      where: { id: userId } as FindOptionsWhere<User>
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверка текущего пароля
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Неверный текущий пароль' });
    }

    // Хеширование нового пароля
    user.password = await bcrypt.hash(newPassword, 10);
    await userRepository.save(user);

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Ошибка при изменении пароля' });
  }
});

// Назначение роли администратора
router.post('/make-admin/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.role = UserRole.ADMIN;
    await userRepository.save(user);

    res.json({ message: 'Пользователь успешно назначен администратором' });
  } catch (error) {
    console.error('Error making user admin:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Изменение роли пользователя на обычную
router.post('/make-user/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.role = UserRole.USER;
    await userRepository.save(user);

    res.json({ message: 'Пользователь успешно изменен на обычного пользователя' });
  } catch (error) {
    console.error('Error making user regular:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Ban user
router.post('/ban/:userId', requireRole([UserRole.ADMIN]), async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await userRepository.findOne({ where: { id: userId } as FindOptionsWhere<User> });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (user.role === UserRole.ADMIN) {
      return res.status(403).json({ message: 'Нельзя забанить администратора' });
    }

    user.isBlocked = true;
    user.banReason = reason || 'Нарушение правил';
    user.bannedAt = new Date();
    await userRepository.save(user);

    res.json({ message: 'Пользователь забанен', user });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ message: 'Ошибка при бане пользователя' });
  }
});

// Unban user
router.post('/unban/:userId', requireRole([UserRole.ADMIN]), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userRepository.findOne({ where: { id: userId } as FindOptionsWhere<User> });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.isBlocked = false;
    user.banReason = '';
    user.bannedAt = null;
    await userRepository.save(user);

    res.json({ message: 'Пользователь разбанен', user });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ message: 'Ошибка при разбане пользователя' });
  }
});

// Get banned users
router.get('/banned', requireRole([UserRole.ADMIN]), async (req, res) => {
  try {
    const bannedUsers = await userRepository.find({
      where: { isBlocked: true } as FindOptionsWhere<User>,
      select: ['id', 'name', 'email', 'banReason', 'bannedAt']
    });
    res.json(bannedUsers);
  } catch (error) {
    console.error('Error getting banned users:', error);
    res.status(500).json({ message: 'Ошибка при получении списка забаненных пользователей' });
  }
});

export default router; 
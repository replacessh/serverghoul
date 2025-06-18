import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../entities/User';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

export const requireRole = (roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Необходима аутентификация' });
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(401).json({ message: 'Пользователь не найден' });
      }

      if (user.isBlocked) {
        return res.status(403).json({ message: 'Ваш аккаунт заблокирован' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: 'Недостаточно прав' });
      }

      next();
    } catch (error) {
      console.error('Error in role middleware:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  };
}; 
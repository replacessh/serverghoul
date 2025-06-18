import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../entities/User';
import { AppDataSource } from '../data-source';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Необходима авторизация' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: req.user.id } });
    
    if (!user || user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора' });
    }

    next();
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    res.status(500).json({ message: 'Ошибка при проверке прав администратора' });
  }
}; 
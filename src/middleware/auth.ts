import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../entities/User';
import { FindOptionsWhere } from 'typeorm';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Необходима аутентификация' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Неверный формат токена' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: decoded.id } as FindOptionsWhere<User> });

    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Ваш аккаунт заблокирован' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    res.status(401).json({ message: 'Неверный токен' });
  }
};

export const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора.' });
    }
    next();
  } catch (error) {
    console.error('Error in admin middleware:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}; 
import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { SupportTicket } from '../entities/SupportTicket';
import { User } from '../entities/User';
import { authMiddleware } from '../middleware/auth';
import { validate } from 'class-validator';
import { FindOptionsWhere } from 'typeorm';
import { requireRole } from '../middleware/role';
import { UserRole } from '../entities/User';

const router = Router();
const supportTicketRepository = AppDataSource.getRepository(SupportTicket);
const userRepository = AppDataSource.getRepository(User);

// Middleware для проверки аутентификации
router.use(authMiddleware);

// Получить тикеты текущего пользователя
router.get('/tickets', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const tickets = await supportTicketRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ message: 'Ошибка при получении тикетов' });
  }
});

// Получить все тикеты (для администратора)
router.get('/admin', requireRole([UserRole.ADMIN]), async (req, res) => {
  try {
    const tickets = await supportTicketRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching all support tickets:', error);
    res.status(500).json({ message: 'Ошибка при получении тикетов' });
  }
});

// Создать новый тикет
router.post('/', async (req, res) => {
  try {
    const { title, description, userId } = req.body;

    if (!title || !description || !userId) {
      return res.status(400).json({ 
        message: 'Не все обязательные поля заполнены',
        required: ['title', 'description', 'userId']
      });
    }

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const ticket = new SupportTicket();
    ticket.title = title;
    ticket.description = description;
    ticket.user = user;

    const savedTicket = await supportTicketRepository.save(ticket);
    res.status(201).json(savedTicket);
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ message: 'Ошибка при создании тикета' });
  }
});

// Получить все тикеты пользователя
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const tickets = await supportTicketRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ message: 'Ошибка при получении тикетов' });
  }
});

// Получить тикет по ID
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const ticket = await supportTicketRepository.findOne({
      where: { id } as FindOptionsWhere<SupportTicket>,
      relations: ['user']
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Тикет не найден' });
    }

    if (ticket.user.id !== userId) {
      return res.status(403).json({ message: 'Нет доступа к этому тикету' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    res.status(500).json({ message: 'Ошибка при получении тикета' });
  }
});

// Обновить статус тикета
router.patch('/:id/status', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const ticket = await supportTicketRepository.findOne({
      where: { id } as FindOptionsWhere<SupportTicket>,
      relations: ['user']
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Тикет не найден' });
    }

    if (ticket.user.id !== userId) {
      return res.status(403).json({ message: 'Нет доступа к этому тикету' });
    }

    ticket.status = status;
    await supportTicketRepository.save(ticket);

    res.json(ticket);
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({ message: 'Ошибка при обновлении тикета' });
  }
});

export default router; 
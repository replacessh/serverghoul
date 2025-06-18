import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Product } from '../entities/Product';
import { Review } from '../entities/Review';
import { requireRole } from '../middleware/role';
import { authMiddleware } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { validate } from 'class-validator';
import { FindOptionsWhere } from 'typeorm';
import { SupportTicket } from '../entities/SupportTicket';
import { TicketStatus } from '../entities/SupportTicket';

const router = Router();
const userRepository = AppDataSource.getRepository(User);
const productRepository = AppDataSource.getRepository(Product);
const reviewRepository = AppDataSource.getRepository(Review);
const supportTicketRepository = AppDataSource.getRepository(SupportTicket);

// Middleware для проверки аутентификации и прав администратора
router.use(authMiddleware);
router.use(requireRole([UserRole.ADMIN]));

// Управление пользователями
router.get('/users', async (req, res) => {
  try {
    const users = await userRepository.find({
      select: ['id', 'name', 'email', 'phone', 'role', 'isBlocked', 'createdAt'],
      order: { createdAt: 'DESC' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
  }
});

router.patch('/users/:id/block', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findOne({ where: { id } as FindOptionsWhere<User> });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (user.role === UserRole.ADMIN) {
      return res.status(403).json({ message: 'Нельзя заблокировать администратора' });
    }

    user.isBlocked = true;
    await userRepository.save(user);

    res.json({ message: 'Пользователь заблокирован' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Ошибка при блокировке пользователя' });
  }
});

router.patch('/users/:id/unblock', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findOne({ where: { id } as FindOptionsWhere<User> });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.isBlocked = false;
    await userRepository.save(user);

    res.json({ message: 'Пользователь разблокирован' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ message: 'Ошибка при разблокировке пользователя' });
  }
});

// Управление ролями пользователей
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Некорректная роль' });
    }

    const user = await userRepository.findOne({ where: { id } as FindOptionsWhere<User> });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.role = role;
    await userRepository.save(user);

    res.json({ message: 'Роль пользователя обновлена' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Ошибка при обновлении роли пользователя' });
  }
});

// Управление товарами
router.post('/products', async (req, res) => {
  try {
    console.log('Received product data:', req.body);
    const { name, description, price, category, imageUrl, stock, sizes } = req.body;

    if (!name || !description || !price || !category || !imageUrl || stock === undefined) {
      return res.status(400).json({ 
        message: 'Не все обязательные поля заполнены',
        required: ['name', 'description', 'price', 'category', 'imageUrl', 'stock']
      });
    }

    const product = new Product();
    product.name = name;
    product.description = description;
    product.price = Number(price);
    product.category = category;
    product.imageUrl = imageUrl;
    product.stock = Number(stock);
    product.sizes = sizes || [];

    // Валидация размеров в зависимости от категории
    if (category === 'одежда') {
      const validClothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      const invalidSizes = product.sizes.filter(size => !validClothingSizes.includes(size.toUpperCase()));
      if (invalidSizes.length > 0) {
        return res.status(400).json({
          message: 'Некорректные размеры для одежды',
          validSizes: validClothingSizes,
          invalidSizes: invalidSizes
        });
      }
    } else if (category === 'обувь') {
      const validShoeSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
      const invalidSizes = product.sizes.filter(size => !validShoeSizes.includes(size));
      if (invalidSizes.length > 0) {
        return res.status(400).json({
          message: 'Некорректные размеры для обуви',
          validSizes: validShoeSizes,
          invalidSizes: invalidSizes
        });
      }
    }

    console.log('Validating product:', product);
    const errors = await validate(product);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return res.status(400).json({ 
        message: 'Ошибка валидации',
        errors: errors.map(e => ({
          property: e.property,
          constraints: e.constraints
        }))
      });
    }

    console.log('Saving product to database...');
    const savedProduct = await productRepository.save(product);
    console.log('Product saved successfully:', savedProduct);
    
    res.status(201).json(savedProduct);
  } catch (error: any) {
    console.error('Detailed error creating product:', error);
    res.status(500).json({ 
      message: 'Ошибка при создании товара',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, imageUrl, stock } = req.body;

    const product = await productRepository.findOne({ where: { id } as FindOptionsWhere<Product> });
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    product.imageUrl = imageUrl;
    product.stock = stock;

    const errors = await validate(product);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    await productRepository.save(product);
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Ошибка при обновлении товара' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productRepository.findOne({ where: { id } as FindOptionsWhere<Product> });

    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    await productRepository.remove(product);
    res.json({ message: 'Товар удален' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Ошибка при удалении товара' });
  }
});

// Управление отзывами
router.delete('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const review = await reviewRepository.findOne({ where: { id } as FindOptionsWhere<Review> });

    if (!review) {
      return res.status(404).json({ message: 'Отзыв не найден' });
    }

    await reviewRepository.remove(review);
    res.json({ message: 'Отзыв удален' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Ошибка при удалении отзыва' });
  }
});

// Получение всех тикетов поддержки
router.get('/support/tickets', async (req, res) => {
  try {
    const tickets = await supportTicketRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ message: 'Ошибка при получении тикетов поддержки' });
  }
});

// Обновление статуса тикета
router.patch('/support/tickets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('Received ticket status update request:', { id, status });

    // Проверяем наличие ID и статуса
    if (!id) {
      console.error('Missing ticket ID');
      return res.status(400).json({ message: 'ID тикета не указан' });
    }

    if (!status) {
      console.error('Missing status');
      return res.status(400).json({ message: 'Статус не указан' });
    }

    // Проверяем валидность статуса
    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      console.error('Invalid status:', status);
      return res.status(400).json({ 
        message: 'Недопустимый статус тикета',
        validStatuses: validStatuses
      });
    }

    // Ищем тикет с проверкой на существование
    console.log('Looking for ticket with ID:', id);
    const ticket = await supportTicketRepository.findOne({ 
      where: { id } as FindOptionsWhere<SupportTicket>,
      relations: ['user']
    });

    if (!ticket) {
      console.error('Ticket not found:', id);
      return res.status(404).json({ message: 'Тикет не найден' });
    }

    console.log('Found ticket:', ticket);

    // Обновляем статус
    ticket.status = status;
    console.log('Updating ticket status to:', status);
    
    const updatedTicket = await supportTicketRepository.save(ticket);
    console.log('Ticket updated successfully:', updatedTicket);

    // Отправляем успешный ответ
    res.status(200).json({
      success: true,
      message: 'Статус тикета успешно обновлен',
      ticket: updatedTicket
    });
  } catch (error: any) {
    console.error('Detailed error updating ticket status:', {
      error: error,
      message: error.message,
      stack: error.stack
    });
    
    // Определяем тип ошибки
    if (error instanceof Error) {
      if (error.name === 'QueryFailedError') {
        return res.status(500).json({ 
          message: 'Ошибка базы данных при обновлении статуса',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
    
    res.status(500).json({ 
      message: 'Ошибка при обновлении статуса тикета',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Удаление тикета
router.delete('/support/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await supportTicketRepository.findOne({ where: { id } as FindOptionsWhere<SupportTicket> });

    if (!ticket) {
      return res.status(404).json({ message: 'Тикет не найден' });
    }

    await supportTicketRepository.remove(ticket);
    res.json({ message: 'Тикет удален' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Ошибка при удалении тикета' });
  }
});

export default router; 
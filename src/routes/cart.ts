import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { CartItem } from '../entities/CartItem';
import { Product } from '../entities/Product';
import { User } from '../entities/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from 'class-validator';

const router = Router();
const cartItemRepository = AppDataSource.getRepository(CartItem);
const productRepository = AppDataSource.getRepository(Product);
const userRepository = AppDataSource.getRepository(User);

// Middleware для проверки аутентификации
router.use(authMiddleware);

// Получить корзину пользователя
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const cartItems = await cartItemRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });

    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Ошибка при получении корзины' });
  }
});

// Добавить товар в корзину
router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Не указан ID товара' });
    }

    // Проверяем существование товара
    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    // Проверяем наличие товара
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Недостаточно товара на складе' });
    }

    // Проверяем, есть ли уже такой товар в корзине
    let cartItem = await cartItemRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId }
      }
    });

    if (cartItem) {
      // Если товар уже есть в корзине, обновляем количество
      cartItem.quantity += quantity;
    } else {
      // Если товара нет в корзине, создаем новую запись
      cartItem = new CartItem();
      cartItem.user = { id: userId } as User;
      cartItem.product = product;
      cartItem.quantity = quantity;
    }

    // Проверяем, не превышает ли количество доступный запас
    if (cartItem.quantity > product.stock) {
      return res.status(400).json({ message: 'Недостаточно товара на складе' });
    }

    const errors = await validate(cartItem);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Некорректные данные' });
    }

    await cartItemRepository.save(cartItem);
    res.status(201).json(cartItem);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Ошибка при добавлении в корзину' });
  }
});

// Обновить количество товара в корзине
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Некорректное количество' });
    }

    const cartItem = await cartItemRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['product']
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Товар в корзине не найден' });
    }

    // Проверяем наличие товара
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ message: 'Недостаточно товара на складе' });
    }

    cartItem.quantity = quantity;
    await cartItemRepository.save(cartItem);
    res.json(cartItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Ошибка при обновлении корзины' });
  }
});

// Удалить товар из корзины
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const { id } = req.params;
    const cartItem = await cartItemRepository.findOne({
      where: { id, user: { id: userId } }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Товар в корзине не найден' });
    }

    await cartItemRepository.remove(cartItem);
    res.json({ message: 'Товар удален из корзины' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Ошибка при удалении из корзины' });
  }
});

export default router; 
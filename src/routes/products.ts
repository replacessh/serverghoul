import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Product } from '../entities/Product';
import { Review } from '../entities/Review';
import { User, UserRole } from '../entities/User';
import { validate } from 'class-validator';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all products with optional filtering and sorting
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, sortBy, sortOrder } = req.query;
    const productRepository = AppDataSource.getRepository(Product);
    
    let query = productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.reviews', 'review');

    // Apply category filter if provided
    if (category) {
      query = query.where('product.category = :category', { category });
    }

    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case 'price':
          query = query.orderBy('product.price', sortOrder === 'desc' ? 'DESC' : 'ASC');
          break;
        case 'name':
          query = query.orderBy('product.name', sortOrder === 'desc' ? 'DESC' : 'ASC');
          break;
        case 'size': {
          const allProducts = await query.getMany();
          
          // Определяем порядок размеров для одежды и обуви
          const clothingSizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
          const shoeSizeOrder = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
          
          // Сортируем продукты по размерам
          const sizeSortedProducts = allProducts.sort((a, b) => {
            // Если у продукта нет размеров, помещаем его в конец
            if (!a.sizes || a.sizes.length === 0) return 1;
            if (!b.sizes || b.sizes.length === 0) return -1;
            
            // Получаем минимальные размеры для сравнения
            const aMinSize = Math.min(...a.sizes.map(size => {
              if (a.category === 'Одежда') {
                return clothingSizeOrder.indexOf(size);
              } else {
                return shoeSizeOrder.indexOf(size);
              }
            }));
            
            const bMinSize = Math.min(...b.sizes.map(size => {
              if (b.category === 'Одежда') {
                return clothingSizeOrder.indexOf(size);
              } else {
                return shoeSizeOrder.indexOf(size);
              }
            }));
            
            // Сортируем в зависимости от порядка
            return sortOrder === 'desc' ? bMinSize - aMinSize : aMinSize - bMinSize;
          });
          
          return res.json(sizeSortedProducts);
        }
        case 'category':
          query = query.orderBy('product.category', sortOrder === 'desc' ? 'DESC' : 'ASC');
          break;
        case 'rating': {
          const allProducts = await query.getMany();
          
          // Вычисляем средний рейтинг для каждого продукта
          const productsWithRating = allProducts.map(product => {
            const totalRating = product.reviews.reduce((acc, review) => acc + review.rating, 0);
            const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
            return {
              ...product,
              averageRating,
              reviewCount: product.reviews.length
            };
          });

          // Сортируем продукты по рейтингу
          const ratingSortedProducts = productsWithRating.sort((a, b) => {
            // Сначала сравниваем по рейтингу
            if (a.averageRating !== b.averageRating) {
              return sortOrder === 'desc' 
                ? b.averageRating - a.averageRating  // По убыванию
                : a.averageRating - b.averageRating; // По возрастанию
            }
            // При равном рейтинге, сортируем по количеству отзывов
            return sortOrder === 'desc'
              ? b.reviewCount - a.reviewCount  // По убыванию
              : a.reviewCount - b.reviewCount; // По возрастанию
          });

          // Удаляем временные поля перед отправкой
          const cleanProducts = ratingSortedProducts.map(({ averageRating, reviewCount, ...product }) => product);
          return res.json(cleanProducts);
        }
        default:
          query = query.orderBy('product.name', 'ASC');
      }
    } else {
      // Default sorting by name
      query = query.orderBy('product.name', 'ASC');
    }

    const products = await query.getMany();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Ошибка при получении списка товаров' });
  }
});

// Get single product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const productRepository = AppDataSource.getRepository(Product);

    const product = await productRepository.findOne({
      where: { id: productId },
      relations: ['reviews', 'reviews.author'],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        category: true,
        stock: true,
        sizes: true,
        reviews: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          author: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Ошибка при получении продукта' });
  }
});

// Add review to product (requires authentication)
router.post('/:id/reviews', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    // Validate input
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
    }

    const productRepository = AppDataSource.getRepository(Product);
    const reviewRepository = AppDataSource.getRepository(Review);
    const userRepository = AppDataSource.getRepository(User);

    // Check if product exists
    const product = await productRepository.findOne({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    // Create new review
    const review = new Review();
    review.rating = rating;
    review.comment = comment;
    
    // Set relations instead of IDs
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    review.author = user;
    review.product = product;

    // Validate review entity
    const errors = await validate(review);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Некорректные данные отзыва' });
    }

    // Save review
    await reviewRepository.save(review);

    res.status(201).json({
      message: 'Отзыв успешно добавлен',
      review,
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Ошибка при добавлении отзыва' });
  }
});

// Create new product (admin only)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, imageUrl, category, stock, sizes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    // Проверяем, является ли пользователь администратором
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    
    if (!user || user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Создаем новый товар
    const product = new Product();
    product.name = name;
    product.description = description;
    product.price = price;
    product.imageUrl = imageUrl;
    product.category = category;
    product.stock = stock;
    product.sizes = sizes || [];

    // Валидируем данные
    const errors = await validate(product);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Некорректные данные товара' });
    }

    // Сохраняем товар
    const productRepository = AppDataSource.getRepository(Product);
    const savedProduct = await productRepository.save(product);

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Ошибка при создании товара' });
  }
});

// Delete product (admin only)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    // Проверяем, является ли пользователь администратором
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    
    if (!user || user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const productRepository = AppDataSource.getRepository(Product);
    
    // Проверяем существование товара
    const product = await productRepository.findOne({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    // Удаляем товар
    await productRepository.remove(product);

    res.json({ message: 'Товар успешно удален' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Ошибка при удалении товара' });
  }
});

// Получение отзывов продукта
router.get('/:id/reviews', async (req, res) => {
  try {
    const productId = req.params.id;
    const reviewRepository = AppDataSource.getRepository(Review);

    const reviews = await reviewRepository.find({
      where: { product: { id: productId } },
      relations: ['author'],
      order: { createdAt: 'DESC' }
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Ошибка при получении отзывов' });
  }
});

export default router; 
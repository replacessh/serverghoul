import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Product } from '../entities/Product';
import { Review } from '../entities/Review';
import { authMiddleware } from '../middleware/auth';
import { validate } from 'class-validator';
import { FindOptionsWhere } from 'typeorm';

const router = Router();
const productRepository = AppDataSource.getRepository(Product);
const reviewRepository = AppDataSource.getRepository(Review);

// Get all products with optional filtering and sorting
router.get('/', async (req, res) => {
  try {
    const { category, sortBy, sortOrder = 'ASC' } = req.query;
    const queryBuilder = productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.reviews', 'review')
      .leftJoinAndSelect('review.author', 'author');

    if (category) {
      queryBuilder.where('product.category = :category', { category });
    }

    if (sortBy) {
      switch (sortBy) {
        case 'price':
          queryBuilder.orderBy('product.price', sortOrder as 'ASC' | 'DESC');
          break;
        case 'name':
          queryBuilder.orderBy('product.name', sortOrder as 'ASC' | 'DESC');
          break;
        case 'rating':
          queryBuilder
            .addSelect('AVG(review.rating)', 'averageRating')
            .groupBy('product.id')
            .orderBy('averageRating', sortOrder as 'ASC' | 'DESC');
          break;
      }
    }

    const products = await queryBuilder.getMany();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Ошибка при получении списка товаров' });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productRepository.findOne({
      where: { id } as FindOptionsWhere<Product>,
      relations: ['reviews', 'reviews.author']
    });

    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Ошибка при получении товара' });
  }
});

// Add review to product (authenticated users only)
router.post('/:id/reviews', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const product = await productRepository.findOne({ where: { id } as FindOptionsWhere<Product> });
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    const review = new Review();
    review.rating = rating;
    review.comment = comment;
    review.product = product;
    review.author = { id: userId } as any;

    const errors = await validate(review);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    await reviewRepository.save(review);
    res.status(201).json(review);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Ошибка при добавлении отзыва' });
  }
});

export default router; 
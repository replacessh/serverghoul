import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Product } from './entities/Product';
import { Review } from './entities/Review';
import { SupportTicket } from './entities/SupportTicket';
import { CartItem } from './entities/CartItem';
import dotenv from 'dotenv';

dotenv.config();

// Проверка наличия необходимых переменных окружения
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.log('Using default values for database connection');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'safonova_shop',
  synchronize: process.env.NODE_ENV !== 'production', // Только в development
  logging: process.env.NODE_ENV !== 'production',
  entities: [User, Product, Review, SupportTicket, CartItem],
  subscribers: [],
  migrations: [],
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
}); 
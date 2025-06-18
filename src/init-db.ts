import { AppDataSource } from './data-source';
import { User, UserRole } from './entities/User';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';

export async function initializeDatabase() {
  try {
    const userRepository = AppDataSource.getRepository(User);
    
    // Проверяем, существует ли уже администратор
    const existingAdmin = await userRepository.findOne({
      where: { email: ADMIN_EMAIL }
    });

    if (!existingAdmin) {
      // Создаем администратора
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const admin = userRepository.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: UserRole.ADMIN,
        name: 'Admin',
        phone: '+1234567890'
      });

      await userRepository.save(admin);
      console.log('Admin user created');
      console.log('Admin credentials:');
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
} 
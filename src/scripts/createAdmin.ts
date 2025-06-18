import { AppDataSource } from '../data-source';
import { User, UserRole } from '../entities/User';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);

    // Проверяем, существует ли уже админ
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@admin.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Создаем админа
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      email: 'admin@admin.com',
      password: hashedPassword,
      name: 'Admin',
      role: UserRole.ADMIN
    });

    await userRepository.save(admin);
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

createAdmin(); 
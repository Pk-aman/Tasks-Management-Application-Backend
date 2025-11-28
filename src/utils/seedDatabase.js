import User from '../models/User.model.js';
import { connectDB } from '../config/database.js';

const seedUsers = async () => {
  try {
    await connectDB();

    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
      });
      console.log('✅ Admin user created');
    }

    // Check if regular user exists
    const userExists = await User.findOne({ email: 'user@example.com' });
    
    if (!userExists) {
      await User.create({
        name: 'Normal User',
        email: 'user@example.com',
        password: 'user123',
        role: 'user',
        isVerified: true,
      });
      console.log('✅ Normal user created');
    }

    console.log('✅ Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedUsers();

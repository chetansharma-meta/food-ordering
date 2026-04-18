
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { users, restaurants, menuItems } from './lib/placeholder-data';
import User from './lib/models/User';
import Restaurant from './lib/models/Restaurant';
import MenuItem from './lib/models/Menu';

// --- IMPORTANT ---
// Add your MongoDB connection string here
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/food-ordering';

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('Cleared existing data.');

    // Hash user passwords
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    // Insert data
    await User.insertMany(usersWithHashedPasswords);
    await Restaurant.insertMany(restaurants);
    await MenuItem.insertMany(menuItems);
    console.log('Seeded database successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedDatabase();

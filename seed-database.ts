
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { restaurants, menuItems } from './lib/placeholder-data.ts';
import User from './lib/models/User.ts';
import Restaurant from './lib/models/Restaurant.ts';
import { MenuItem } from './lib/models/Menu.ts';

dotenv.config({ path: '.env.local' });

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    phone: '7777777777',
    addresses: [
      {
        label: 'Office',
        street: '1 Admin Plaza',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        isDefault: true,
      },
    ],
    isActive: true,
  },
  {
    name: 'Test Customer',
    email: 'customer@example.com',
    password: 'password123',
    role: 'customer',
    phone: '9999999999',
    addresses: [
      {
        label: 'Home',
        street: '123 Example Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        isDefault: true,
      },
    ],
    isActive: true,
  },
  {
    name: 'Bikanervala Owner',
    email: 'bikanervala-owner@example.com',
    password: 'password123',
    role: 'restaurant_owner',
    phone: '8881110001',
    addresses: [
      { label: 'Store', street: 'Sector 18 Market', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', isDefault: true }],
    isActive: true,
  },
  {
    name: 'Khadak Singh Owner',
    email: 'khadaksingh-owner@example.com',
    password: 'password123',
    role: 'restaurant_owner',
    phone: '8881110002',
    addresses: [
      { label: 'Store', street: 'GT Road', city: 'Murthal', state: 'Haryana', pincode: '131039', isDefault: true }],
    isActive: true,
  },
  {
    name: 'Haldiram Owner',
    email: 'haldiram-owner@example.com',
    password: 'password123',
    role: 'restaurant_owner',
    phone: '8881110003',
    addresses: [
      { label: 'Store', street: 'Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001', isDefault: true }],
    isActive: true,
  },
  {
    name: 'Punjabi Rasoi Owner',
    email: 'punjabirasoi-owner@example.com',
    password: 'password123',
    role: 'restaurant_owner',
    phone: '8881110004',
    addresses: [
      { label: 'Store', street: 'Civil Lines', city: 'Kanpur', state: 'Uttar Pradesh', pincode: '208001', isDefault: true }],
    isActive: true,
  },
  {
    name: 'Al-Bake Owner',
    email: 'al-bake-owner@example.com',
    password: 'password123',
    role: 'restaurant_owner',
    phone: '8881110005',
    addresses: [
      { label: 'Store', street: 'New Friends Colony', city: 'New Delhi', state: 'Delhi', pincode: '110025', isDefault: true }],
    isActive: true,
  },
  {
    name: 'Saravana Bhavan Owner',
    email: 'saravanabhavan-owner@example.com',
    password: 'password123',
    role: 'restaurant_owner',
    phone: '8881110006',
    addresses: [
      { label: 'Store', street: 'Janpath', city: 'Delhi', state: 'Delhi', pincode: '110001', isDefault: true }],
    isActive: true,
  },
  {
    name: 'Paradise Biryani Owner',
    email: 'paradisebiryani-owner@example.com',
    password: 'password123',
    role: 'restaurant_owner',
    phone: '8881110007',
    addresses: [
      { label: 'Store', street: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034', isDefault: true }],
    isActive: true,
  },
  {
    name: 'Chai Sutta Owner',
    email: 'chaisutta-owner@example.com',
    password: 'password123',
    role: 'restaurant_owner',
    phone: '8881110008',
    addresses: [
      { label: 'Store', street: 'Indore Market', city: 'Indore', state: 'Madhya Pradesh', pincode: '452001', isDefault: true }],
    isActive: true,
  },
  {
    name: 'Desi Kitchen 1 Owner',
    email: 'desikitchen1-owner@example.com',
    password: 'password123',
    role: 'restaurant_owner',
    phone: '8881110009',
    addresses: [
      { label: 'Store', street: 'Market Road', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', isDefault: true }],
    isActive: true,
  },
  {
    name: 'Desi Kitchen 2 Owner',
    email: 'desikitchen2-owner@example.com',
    password: 'password123',
    role: 'restaurant_owner',
    phone: '8881110010',
    addresses: [
      { label: 'Store', street: 'Main Bazaar', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', isDefault: true }],
    isActive: true,
  },
];

// --- IMPORTANT ---
// Add your MongoDB Atlas connection string here
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'food_ordering';

if (!MONGODB_URI) {
  throw new Error('Please set MONGODB_URI to your MongoDB Atlas connection string in .env.local');
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
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

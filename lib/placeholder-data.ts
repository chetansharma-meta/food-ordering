
import { Types } from 'mongoose';
import { IRestaurant, IMenuItem } from '@/types';

// Helper function to generate ObjectIDs
const toObjectId = (id: string) => new Types.ObjectId(id);
const now = new Date();

// --- RESTAURANTS ---
const ownerIds = {
  bikanervala: toObjectId("662a7e4b5b3a6a9b4c8d3e8b"),
  khadakSingh: toObjectId("662a7e4b5b3a6a9b4c8d3e8c"),
  haldirams: toObjectId("662a7e4b5b3a6a9b4c8d3e8d"),
  punjabiRasoi: toObjectId("662a7e4b5b3a6a9b4c8d3e8e"),
  alBake: toObjectId("662a7e4b5b3a6a9b4c8d3e8f"),
  saravanaBhavan: toObjectId("662a7e4b5b3a6a9b4c8d3e90"),
  paradiseBiryani: toObjectId("662a7e4b5b3a6a9b4c8d3e91"),
  chaiSutta: toObjectId("662a7e4b5b3a6a9b4c8d3e92"),
  desiKitchen1: toObjectId("662a7e4b5b3a6a9b4c8d3e93"),
  desiKitchen2: toObjectId("662a7e4b5b3a6a9b4c8d3e94"),
};
export const restaurants: IRestaurant[] = [
 {
    _id: toObjectId("663a1b9c72f10b7b0e8a7c21"),
    name: "Bikanervala",
    description: "Famous for North Indian snacks, sweets, and traditional meals.",
    ownerId: ownerIds.bikanervala,
    location: { address: "Sector 18 Market", city: "Noida", state: "Uttar Pradesh", pincode: "201301" },
    cuisineTypes: ["North Indian", "Street Food", "Sweets"],
    rating: 4.4,
    reviewCount: 1800,
    avgDeliveryTime: 30,
    deliveryFee: 40,
    minOrderAmount: 200,
    isOpen: true,
    isActive: true,
    coverImage: "https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg",
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: toObjectId("663a1b9c72f10b7b0e8a7c22"),
    name: "Khadak Singh Dhaba",
    description: "Authentic Punjabi dhaba-style food.",
    ownerId: ownerIds.khadakSingh,
    location: { address: "GT Road", city: "Murthal", state: "Haryana", pincode: "131039" },
    cuisineTypes: ["Punjabi", "North Indian"],
    rating: 4.6,
    reviewCount: 3200,
    avgDeliveryTime: 25,
    deliveryFee: 30,
    minOrderAmount: 150,
    isOpen: true,
    isActive: true,
    coverImage: "https://images.pexels.com/photos/2087748/pexels-photo-2087748.jpeg",
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: toObjectId("663a1b9c72f10b7b0e8a7c23"),
    name: "Haldiram's",
    description: "Popular chain offering Indian snacks and meals.",
    ownerId: ownerIds.haldirams,
    location: { address: "Connaught Place", city: "New Delhi", state: "Delhi", pincode: "110001" },
    cuisineTypes: ["North Indian", "Street Food", "Sweets"],
    rating: 4.5,
    reviewCount: 5000,
    avgDeliveryTime: 35,
    deliveryFee: 50,
    minOrderAmount: 250,
    isOpen: true,
    isActive: true,
    coverImage: "https://images.pexels.com/photos/34413634/pexels-photo-34413634.jpeg",
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: toObjectId("663a1b9c72f10b7b0e8a7c24"),
    name: "Punjabi Rasoi",
    description: "Homestyle Punjabi meals.",
    ownerId: ownerIds.punjabiRasoi,
    location: { address: "Civil Lines", city: "Kanpur", state: "Uttar Pradesh", pincode: "208001" },
    cuisineTypes: ["Punjabi", "North Indian"],
    rating: 4.3,
    reviewCount: 950,
    avgDeliveryTime: 28,
    deliveryFee: 35,
    minOrderAmount: 180,
    isOpen: true,
    isActive: true,
    coverImage: "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg",
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: toObjectId("663a1b9c72f10b7b0e8a7c25"),
    name: "Al-Bake Shawarma",
    description: "Famous Mughlai and kebabs.",
    ownerId: ownerIds.alBake,
    location: { address: "New Friends Colony", city: "New Delhi", state: "Delhi", pincode: "110025" },
    cuisineTypes: ["Mughlai", "Indian"],
    rating: 4.7,
    reviewCount: 2700,
    avgDeliveryTime: 40,
    deliveryFee: 45,
    minOrderAmount: 220,
    isOpen: true,
    isActive: true,
    coverImage: "https://images.pexels.com/photos/2939339/pexels-photo-2939339.jpeg",
    createdAt: now,
    updatedAt: now,
  },

  {
    _id: toObjectId("663a1b9c72f10b7b0e8a7c26"),
    name: "Saravana Bhavan",
    description: "Authentic South Indian vegetarian food.",
    ownerId: ownerIds.saravanaBhavan,
    location: { address: "Janpath", city: "Delhi", state: "Delhi", pincode: "110001" },
    cuisineTypes: ["South Indian"],
    rating: 4.5,
    reviewCount: 2100,
    avgDeliveryTime: 30,
    deliveryFee: 35,
    minOrderAmount: 200,
    isOpen: true,
    isActive: true,
    coverImage: "https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg",
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: toObjectId("663a1b9c72f10b7b0e8a7c27"),
    name: "Paradise Biryani",
    description: "Authentic Hyderabadi biryani.",
    ownerId: ownerIds.paradiseBiryani,
    location: { address: "Banjara Hills", city: "Hyderabad", state: "Telangana", pincode: "500034" },
    cuisineTypes: ["Biryani"],
    rating: 4.7,
    reviewCount: 4500,
    avgDeliveryTime: 35,
    deliveryFee: 50,
    minOrderAmount: 250,
    isOpen: true,
    isActive: true,
    coverImage: "https://images.pexels.com/photos/2087748/pexels-photo-2087748.jpeg",
    createdAt: now,
    updatedAt: now,
  },

  // ---- EXTRA (to reach 25+) ----
  {
    _id: toObjectId("663a1b9c72f10b7b0e8a7c28"),
    name: "Chai Sutta Bar",
    description: "Tea and snacks cafe.",
    ownerId: ownerIds.chaiSutta,
    location: { address: "Indore Market", city: "Indore", state: "Madhya Pradesh", pincode: "452001" },
    cuisineTypes: ["Cafe", "Beverages"],
    rating: 4.5,
    reviewCount: 2500,
    avgDeliveryTime: 20,
    deliveryFee: 20,
    minOrderAmount: 120,
    isOpen: true,
    isActive: true,
    coverImage: "https://images.pexels.com/photos/2939339/pexels-photo-2939339.jpeg",
    createdAt: now,
    updatedAt: now,
  },

  // --- GENERATED REALISTIC VARIANTS ---
  {
    _id: toObjectId("663a1b9c72f10b7b0e8a7c29"),
    name: "Desi Kitchen 1",
    description: "Traditional Indian meals.",
    ownerId: ownerIds.desiKitchen1,
    location: { address: "Market Road", city: "Lucknow", state: "Uttar Pradesh", pincode: "226001" },
    cuisineTypes: ["Indian", "Snacks"],
    rating: 4.2,
    reviewCount: 800,
    avgDeliveryTime: 25,
    deliveryFee: 25,
    minOrderAmount: 150,
    isOpen: true,
    isActive: true,
    coverImage: "https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg",
    createdAt: now,
    updatedAt: now,
  },

  {
    _id: toObjectId("663a1b9c72f10b7b0e8a7c30"),
    name: "Desi Kitchen 2",
    description: "Delicious home-style Indian food.",
    ownerId: ownerIds.desiKitchen2,
    location: { address: "Main Bazaar", city: "Jaipur", state: "Rajasthan", pincode: "302001" },
    cuisineTypes: ["Indian"],
    rating: 4.3,
    reviewCount: 950,
    avgDeliveryTime: 30,
    deliveryFee: 30,
    minOrderAmount: 180,
    isOpen: true,
    isActive: true,
    coverImage: "https://images.pexels.com/photos/2087748/pexels-photo-2087748.jpeg",
    createdAt: now,
    updatedAt: now,
  }
];

// --- MENU ITEMS ---
const gourmetKitchenId = toObjectId("663a1b9c72f10b7b0e8a7c21");
const speedyGonzalesId = toObjectId("663a1b9c72f10b7b0e8a7c22");
const mamaMiasId = toObjectId("663a1b9c72f10b7b0e8a7c23");
const goldenWokId = toObjectId("663a1b9c72f10b7b0e8a7c24");
const sizzlingSkewerId = toObjectId("663a1b9c72f10b7b0e8a7c25");

// Dummy Category IDs
const appetizerCat = toObjectId("663a1b9c72f10b7b0e8a7c2a");
const mainCourseCat = toObjectId("663a1b9c72f10b7b0e8a7c2b");
const pizzaCat = toObjectId("663a1b9c72f10b7b0e8a7c2c");
const dessertCat = toObjectId("663a1b9c72f10b7b0e8a7c2d");

// Corrected type to satisfy IMenuItem
export const menuItems: IMenuItem[] = [
  // The Gourmet Kitchen
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c31"), restaurantId: gourmetKitchenId, categoryId: appetizerCat, name: "Bruschetta", description: "Grilled bread with tomatoes, garlic, basil.", price: 200, image: "https://images.pexels.com/photos/405999/pexels-photo-405999.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "veg", isAvailable: true, isPopular: true, preparationTime: 10, createdAt: now, updatedAt: now },
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c32"), restaurantId: gourmetKitchenId, categoryId: mainCourseCat, name: "Grilled Salmon", description: "Salmon with asparagus and lemon.", price: 650, image: "https://images.pexels.com/photos/3296279/pexels-photo-3296279.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: true, preparationTime: 20, createdAt: now, updatedAt: now },
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c33"), restaurantId: gourmetKitchenId, categoryId: dessertCat, name: "Lava Cake", description: "Warm chocolate cake with a gooey center.", price: 220, image: "https://images.pexels.com/photos/372882/pexels-photo-372882.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "veg", isAvailable: true, isPopular: false, preparationTime: 15, createdAt: now, updatedAt: now },
  
  // Speedy Gonzales
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c34"), restaurantId: speedyGonzalesId, categoryId: mainCourseCat, name: "Carne Asada Tacos", description: "Three soft corn tortillas with grilled steak.", price: 320, image: "https://images.pexels.com/photos/4958641/pexels-photo-4958641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: true, preparationTime: 15, createdAt: now, updatedAt: now },
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c35"), restaurantId: speedyGonzalesId, categoryId: mainCourseCat, name: "Chicken Burrito", description: "Large flour tortilla with chicken, rice, beans.", price: 360, image: "https://images.pexels.com/photos/5806124/pexels-photo-5806124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: false, preparationTime: 18, createdAt: now, updatedAt: now },
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c36"), restaurantId: speedyGonzalesId, categoryId: appetizerCat, name: "Guacamole & Chips", description: "Freshly made guacamole with crispy tortilla chips.", price: 180, image: "https://images.pexels.com/photos/6746433/pexels-photo-6746433.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "veg", isAvailable: true, isPopular: true, preparationTime: 5, createdAt: now, updatedAt: now },

  // Mama Mia's
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c37"), restaurantId: mamaMiasId, categoryId: mainCourseCat, name: "Spaghetti Carbonara", description: "Classic pasta with pancetta, egg, and cheese.", price: 400, image: "https://images.pexels.com/photos/128408/pexels-photo-128408.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: true, preparationTime: 22, createdAt: now, updatedAt: now },
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c38"), restaurantId: mamaMiasId, categoryId: pizzaCat, name: "Margherita Pizza", description: "Pizza with mozzarella, tomatoes, and basil.", price: 350, image: "https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "veg", isAvailable: true, isPopular: true, preparationTime: 25, createdAt: now, updatedAt: now },
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c39"), restaurantId: mamaMiasId, categoryId: pizzaCat, name: "Pepperoni Pizza", description: "Classic pepperoni pizza with a zesty tomato sauce.", price: 380, image: "https://images.pexels.com/photos/708587/pexels-photo-708587.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: false, preparationTime: 25, createdAt: now, updatedAt: now },

  // The Golden Wok
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c40"), restaurantId: goldenWokId, categoryId: mainCourseCat, name: "Sweet & Sour Pork", description: "Crispy pork with pineapple in a tangy sauce.", price: 390, image: "https://images.pexels.com/photos/1359326/pexels-photo-1359326.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: true, preparationTime: 20, createdAt: now, updatedAt: now },
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c41"), restaurantId: goldenWokId, categoryId: mainCourseCat, name: "Kung Pao Chicken", description: "Spicy stir-fried chicken with peanuts and chili.", price: 420, image: "https://images.pexels.com/photos/3926124/pexels-photo-3926124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: true, preparationTime: 18, createdAt: now, updatedAt: now },
  
  // The Sizzling Skewer
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c42"), restaurantId: sizzlingSkewerId, categoryId: mainCourseCat, name: "Lamb Kebabs", description: "Two skewers of marinated lamb, grilled to perfection.", price: 450, image: "https://images.pexels.com/photos/3754259/pexels-photo-3754259.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: true, preparationTime: 25, createdAt: now, updatedAt: now },
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c43"), restaurantId: sizzlingSkewerId, categoryId: mainCourseCat, name: "Chicken Shawarma", description: "Pita wrap with tender chicken and tahini sauce.", price: 300, image: "https://images.pexels.com/photos/12118868/pexels-photo-12118868.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: false, preparationTime: 15, createdAt: now, updatedAt: now },
];

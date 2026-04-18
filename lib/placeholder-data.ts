
import { Types } from 'mongoose';
import { IRestaurant, IMenuItem } from '@/types';

// Helper function to generate ObjectIDs
const toObjectId = (id: string) => new Types.ObjectId(id);
const now = new Date();

// --- RESTAURANTS ---
const ownerId = toObjectId("662a7e4b5b3a6a9b4c8d3e8b");

// Corrected type to satisfy IRestaurant
export const restaurants: IRestaurant[] = [
  {
    _id: toObjectId("663a1b9c72f10b7b0e8a7c21"),
    name: "The Gourmet Kitchen",
    description: "Exquisite continental cuisine in a fine dining setting.",
    ownerId: ownerId,
    location: { address: "123 Foodie Lane", city: "Gourmet City", state: "Tasteville", pincode: "12345" },
    cuisineTypes: ["Continental", "American"],
    rating: 4.5,
    reviewCount: 150,
    avgDeliveryTime: 35,
    deliveryFee: 3.99,
    minOrderAmount: 20,
    isOpen: true,
    isActive: true,
    coverImage: "https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: toObjectId("663a1b9c72f10b7b0e8a7c22"),
    name: "Speedy Gonzales",
    description: "Authentic Mexican street food, bursting with flavor.",
    ownerId: ownerId,
    location: { address: "456 Spice Street", city: "Gourmet City", state: "Tasteville", pincode: "12346" },
    cuisineTypes: ["Mexican"],
    rating: 4.7,
    reviewCount: 250,
    avgDeliveryTime: 25,
    deliveryFee: 2.50,
    minOrderAmount: 15,
    isOpen: true,
    isActive: true,
    coverImage: "https://images.pexels.com/photos/2087748/pexels-photo-2087748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: toObjectId("663a1b9c72f10b7b0e8a7c23"),
    name: "Mama Mia's",
    description: "Classic Italian comfort food, just like grandma used to make.",
    ownerId: ownerId,
    location: { address: "789 Pasta Place", city: "Gourmet City", state: "Tasteville", pincode: "12347" },
    cuisineTypes: ["Italian"],
    rating: 4.8,
    reviewCount: 300,
    avgDeliveryTime: 40,
    deliveryFee: 4.00,
    minOrderAmount: 25,
    isOpen: true,
    isActive: true,
    coverImage: "https://images.pexels.com/photos/1484674/pexels-photo-1484674.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: now,
    updatedAt: now,
  },
   {
    _id: toObjectId("663a1b9c72f10b7b0e8a7c24"),
    name: "The Golden Wok",
    description: "A modern take on traditional Chinese recipes.",
    ownerId: ownerId,
    location: { address: "101 Dragon Road", city: "Gourmet City", state: "Tasteville", pincode: "12348" },
    cuisineTypes: ["Chinese"],
    rating: 4.6,
    reviewCount: 210,
    avgDeliveryTime: 30,
    deliveryFee: 3.00,
    minOrderAmount: 18,
    isOpen: true,
    isActive: true,
    coverImage: "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: toObjectId("663a1b9c72f10b7b0e8a7c25"),
    name: "The Sizzling Skewer",
    description: "Authentic Middle Eastern grills and kebabs.",
    ownerId: ownerId,
    location: { address: "212 Oasis Ave", city: "Gourmet City", state: "Tasteville", pincode: "12349" },
    cuisineTypes: ["Middle Eastern"],
    rating: 4.9,
    reviewCount: 350,
    avgDeliveryTime: 45,
    deliveryFee: 5.00,
    minOrderAmount: 30,
    isOpen: true,
    isActive: true,
    coverImage: "https://images.pexels.com/photos/2939339/pexels-photo-2939339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: now,
    updatedAt: now,
  },
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
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c31"), restaurantId: gourmetKitchenId, categoryId: appetizerCat, name: "Bruschetta", description: "Grilled bread with tomatoes, garlic, basil.", price: 8.99, image: "https://images.pexels.com/photos/405999/pexels-photo-405999.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "veg", isAvailable: true, isPopular: true, preparationTime: 10, createdAt: now, updatedAt: now },
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c32"), restaurantId: gourmetKitchenId, categoryId: mainCourseCat, name: "Grilled Salmon", description: "Salmon with asparagus and lemon.", price: 22.99, image: "https://images.pexels.com/photos/3296279/pexels-photo-3296279.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: true, preparationTime: 20, createdAt: now, updatedAt: now },
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c33"), restaurantId: gourmetKitchenId, categoryId: dessertCat, name: "Lava Cake", description: "Warm chocolate cake with a gooey center.", price: 9.75, image: "https://images.pexels.com/photos/372882/pexels-photo-372882.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "veg", isAvailable: true, isPopular: false, preparationTime: 15, createdAt: now, updatedAt: now },
  
  // Speedy Gonzales
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c34"), restaurantId: speedyGonzalesId, categoryId: mainCourseCat, name: "Carne Asada Tacos", description: "Three soft corn tortillas with grilled steak.", price: 12.50, image: "https://images.pexels.com/photos/4958641/pexels-photo-4958641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: true, preparationTime: 15, createdAt: now, updatedAt: now },
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c35"), restaurantId: speedyGonzalesId, categoryId: mainCourseCat, name: "Chicken Burrito", description: "Large flour tortilla with chicken, rice, beans.", price: 14.00, image: "https://images.pexels.com/photos/5806124/pexels-photo-5806124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: false, preparationTime: 18, createdAt: now, updatedAt: now },
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c36"), restaurantId: speedyGonzalesId, categoryId: appetizerCat, name: "Guacamole & Chips", description: "Freshly made guacamole with crispy tortilla chips.", price: 7.50, image: "https://images.pexels.com/photos/6746433/pexels-photo-6746433.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "veg", isAvailable: true, isPopular: true, preparationTime: 5, createdAt: now, updatedAt: now },

  // Mama Mia's
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c37"), restaurantId: mamaMiasId, categoryId: mainCourseCat, name: "Spaghetti Carbonara", description: "Classic pasta with pancetta, egg, and cheese.", price: 18.00, image: "https://images.pexels.com/photos/128408/pexels-photo-128408.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: true, preparationTime: 22, createdAt: now, updatedAt: now },
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c38"), restaurantId: mamaMiasId, categoryId: pizzaCat, name: "Margherita Pizza", description: "Pizza with mozzarella, tomatoes, and basil.", price: 15.50, image: "https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "veg", isAvailable: true, isPopular: true, preparationTime: 25, createdAt: now, updatedAt: now },
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c39"), restaurantId: mamaMiasId, categoryId: pizzaCat, name: "Pepperoni Pizza", description: "Classic pepperoni pizza with a zesty tomato sauce.", price: 17.00, image: "https://images.pexels.com/photos/708587/pexels-photo-708587.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: false, preparationTime: 25, createdAt: now, updatedAt: now },

  // The Golden Wok
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c40"), restaurantId: goldenWokId, categoryId: mainCourseCat, name: "Sweet & Sour Pork", description: "Crispy pork with pineapple in a tangy sauce.", price: 16.50, image: "https://images.pexels.com/photos/1359326/pexels-photo-1359326.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: true, preparationTime: 20, createdAt: now, updatedAt: now },
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c41"), restaurantId: goldenWokId, categoryId: mainCourseCat, name: "Kung Pao Chicken", description: "Spicy stir-fried chicken with peanuts and chili.", price: 17.00, image: "https://images.pexels.com/photos/3926124/pexels-photo-3926124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: true, preparationTime: 18, createdAt: now, updatedAt: now },
  
  // The Sizzling Skewer
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c42"), restaurantId: sizzlingSkewerId, categoryId: mainCourseCat, name: "Lamb Kebabs", description: "Two skewers of marinated lamb, grilled to perfection.", price: 20.00, image: "https://images.pexels.com/photos/3754259/pexels-photo-3754259.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: true, preparationTime: 25, createdAt: now, updatedAt: now },
  { _id: toObjectId("663a1b9c72f10b7b0e8a7c43"), restaurantId: sizzlingSkewerId, categoryId: mainCourseCat, name: "Chicken Shawarma", description: "Pita wrap with tender chicken and tahini sauce.", price: 13.50, image: "https://images.pexels.com/photos/12118868/pexels-photo-12118868.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", foodType: "non-veg", isAvailable: true, isPopular: false, preparationTime: 15, createdAt: now, updatedAt: now },
];

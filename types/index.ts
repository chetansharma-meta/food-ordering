
import { Types } from 'mongoose';

// ─── User ────────────────────────────────────────────────────────────────────
export type UserRole = "customer" | "restaurant_owner" | "admin";

export interface IAddress {
  _id?: Types.ObjectId;
  label: string; // Home, Work, Other
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  addresses: IAddress[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Restaurant ──────────────────────────────────────────────────────────────
export type CuisineType =
  | "North Indian"
  | "South Indian"
  | "Punjabi"
  | "Mughlai"
  | "Street Food"
  | "Fast Food"
  | "Biryani"
  | "Snacks"
  | "Sweets"
  | "Desserts"
  | "Beverages"
  | "Bakery"
  | "Cafe"
  | "Indian"
  | "Other";

export interface IRestaurant {
  _id: Types.ObjectId;
  name: string;
  description: string;
  cuisineTypes: CuisineType[];
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: { lat: number; lng: number };
  };
  coverImage?: string;
  logo?: string;
  rating?: number;
  reviewCount?: number;
  avgDeliveryTime: number; // in minutes
  minOrderAmount: number;
  isOpen: boolean;
  isActive: boolean;
  ownerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deliveryFee: number;
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface ICategory {
  _id: Types.ObjectId;
  restaurantId: Types.ObjectId;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

// ─── MenuItem ────────────────────────────────────────────────────────────────
export type FoodType = "veg" | "non-veg" | "egg";

export interface IMenuItem {
  _id: Types.ObjectId;
  restaurantId: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  image?: string;
  foodType: FoodType;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface ICartItem {
  menuItemId: string;
  restaurantId: string;
  restaurantName?: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  foodType: FoodType;
}

export interface ICartRestaurantGroup {
  restaurantId: string;
  restaurantName: string;
  items: ICartItem[];
  subtotal: number;
}

export interface ICart {
  _id: string;
  userId: string;
  items: ICartItem[];
  updatedAt: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface IOrderItem {
  menuItemId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  foodType: FoodType;
}

export interface IOrderStatusHistory {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

export interface IOrder {
  _id: Types.ObjectId;
  orderId: string; // human-readable: FO-XXXXX
  userId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  restaurantName: string;
  items: IOrderItem[];
  deliveryAddress: IAddress;
  totalAmount: number;
  deliveryFee: number;
  status: OrderStatus;
  paymentMethod: "cash_on_delivery";
  paymentStatus: "pending" | "paid" | "failed";
  statusHistory: IOrderStatusHistory[];
  estimatedDeliveryTime?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export type NotificationType = "order_placed" | "status_update" | "general";

export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  orderId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

// ─── Socket Events ────────────────────────────────────────────────────────────
export interface OrderUpdateEvent {
  orderId: string;
  status: OrderStatus;
  message: string;
  timestamp: string;
}

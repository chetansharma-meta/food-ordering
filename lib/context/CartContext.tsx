
"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ICart, ICartItem, IMenuItem, IRestaurant, ICartRestaurantGroup } from "@/types";
import { menuItems as staticMenuItems, restaurants as staticRestaurants } from "@/lib/placeholder-data";
import toast from "react-hot-toast";
import { Types } from "mongoose";

// --- Helper Functions ---
const findMenuItem = (menuItemId: string): (IMenuItem & { _id: Types.ObjectId, restaurantId: Types.ObjectId, categoryId: Types.ObjectId }) | undefined => {
  return staticMenuItems.find((item) => item._id.toString() === menuItemId);
};

const findRestaurant = (restaurantId: string): (IRestaurant & { _id: Types.ObjectId }) | undefined => {
  return (staticRestaurants as any[]).find(r => r._id.toString() === restaurantId);
}

// --- Context Interfaces ---
interface CartContextType {
  cart: ICart | null;
  totalItems: number;
  totalAmount: number;
  groupedItems: ICartRestaurantGroup[];
  isLoading: boolean;
  addItem: (menuItemId: string, quantity?: number) => void;
  updateItem: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
}

// --- Context Definition ---
const CartContext = createContext<CartContextType | null>(null);

// --- Provider Component ---
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Effects ---
  useEffect(() => {
    // Load cart from localStorage on initial render
    setIsLoading(true);
    try {
      const storedCart = localStorage.getItem("food-delivery-cart");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error("Failed to parse cart from localStorage", e);
      setCartItems([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    if (!isLoading) {
      localStorage.setItem("food-delivery-cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  // --- Cart Actions ---
  const addItem = useCallback((menuItemId: string, quantity = 1) => {
    const menuItem = findMenuItem(menuItemId);
    if (!menuItem) {
      toast.error("Item not found!");
      return;
    }

    const restaurantIdStr = menuItem.restaurantId.toString();

    setCartItems(prevItems => {
      // Block adding items from different restaurants
      if (prevItems.length > 0 && prevItems[0].restaurantId !== restaurantIdStr) {
        toast.error("You can only order from one restaurant at a time. Clear your cart to continue.");
        return prevItems;
      }

      const existingItem = prevItems.find(item => item.menuItemId === menuItemId);

      if (existingItem) {
        toast.success(`Added another ${menuItem.name} to cart!`);
        return prevItems.map(item =>
          item.menuItemId === menuItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        const newItem: ICartItem = {
          menuItemId: menuItem._id.toString(),
          restaurantId: restaurantIdStr,
          name: menuItem.name,
          price: menuItem.price,
          image: menuItem.image,
          quantity: quantity,
          foodType: menuItem.foodType,
        };
        toast.success(`${menuItem.name} added to cart!`);
        return [...prevItems, newItem];
      }
    });
  }, []);

  const updateItem = useCallback((menuItemId: string, quantity: number) => {
    setCartItems(prevItems => {
      if (quantity <= 0) {
        return prevItems.filter(item => item.menuItemId !== menuItemId);
      }
      return prevItems.map(item =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    const itemInCart = cartItems.find(i => i.menuItemId === menuItemId);
    if (itemInCart) {
      toast.success(`${itemInCart.name} removed from cart.`);
    }
    updateItem(menuItemId, 0);
  }, [cartItems, updateItem]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast.success("Cart cleared.");
  }, []);

  // --- Calculated Properties ---
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const groupedItems: ICartRestaurantGroup[] = cartItems.length > 0 ? [
    (() => {
      const restaurant = findRestaurant(cartItems[0].restaurantId);
      return {
        restaurantId: cartItems[0].restaurantId,
        restaurantName: restaurant?.name || "Unknown Restaurant",
        items: cartItems,
        subtotal: totalAmount,
      };
    })()
  ] : [];

  const cart: ICart | null = cartItems.length > 0 ? {
    _id: "local-cart",
    userId: "local-user",
    items: cartItems,
    updatedAt: new Date().toISOString(),
  } : null;

  // --- Provider Value ---
  const value = {
    cart,
    totalItems,
    totalAmount,
    groupedItems,
    isLoading,
    addItem,
    updateItem,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// --- Custom Hook ---
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}

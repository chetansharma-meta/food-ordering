
"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ICart, ICartItem, IMenuItem, ICartRestaurantGroup } from "@/types";
import toast from "react-hot-toast";

// --- Helper Functions ---
async function fetchMenuItem(menuItemId: string): Promise<IMenuItem | null> {
  try {
    const res = await fetch(`/api/menu-items/${menuItemId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Failed to fetch menu item", error);
    return null;
  }
}

async function fetchRestaurantName(restaurantId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/restaurants/${restaurantId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data.name : null;
  } catch (error) {
    console.error("Failed to fetch restaurant", error);
    return null;
  }
}

// --- Context Interfaces ---
interface CartContextType {
  cart: ICart | null;
  totalItems: number;
  totalAmount: number;
  groupedItems: ICartRestaurantGroup[];
  isLoading: boolean;
  addItem: (menuItemId: string, quantity?: number) => Promise<void>;
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
  const addItem = useCallback(async (menuItemId: string, quantity = 1) => {
    const menuItem = await fetchMenuItem(menuItemId);
    if (!menuItem) {
      toast.error("Item not found!");
      return;
    }

    const restaurantIdStr = menuItem.restaurantId.toString();
    const restaurantName = (await fetchRestaurantName(restaurantIdStr)) ?? "Restaurant";

    setCartItems((prevItems) => {
      if (prevItems.length > 0 && prevItems[0].restaurantId !== restaurantIdStr) {
        toast.error("You can only order from one restaurant at a time. Clear your cart to continue.");
        return prevItems;
      }

      const existingItem = prevItems.find((item) => item.menuItemId === menuItemId);

      if (existingItem) {
        toast.success(`Added another ${menuItem.name} to cart!`);
        return prevItems.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        const newItem: ICartItem = {
          menuItemId,
          restaurantId: restaurantIdStr,
          name: menuItem.name,
          price: menuItem.price,
          image: menuItem.image,
          quantity: quantity,
          foodType: menuItem.foodType,
          restaurantName,
        } as ICartItem & { restaurantName: string };
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
    {
      restaurantId: cartItems[0].restaurantId,
      restaurantName: cartItems[0].restaurantName || "Restaurant",
      items: cartItems,
      subtotal: totalAmount,
    },
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

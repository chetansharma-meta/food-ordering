"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ICart, ICartItem } from "@/types";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

interface CartContextType {
  cart: ICart | null;
  totalItems: number;
  totalAmount: number;
  groupedItems: GroupedCartItem[];
  isLoading: boolean;
  addItem: (menuItemId: string, quantity?: number) => Promise<void>;
  updateItem: (menuItemId: string, quantity: number) => Promise<void>;
  removeItem: (menuItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

interface GroupedCartItem {
  restaurantId: string;
  restaurantName?: string;
  items: ICartItem[];
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [cart, setCart] = useState<ICart | null>(null);
  const [groupedItems, setGroupedItems] = useState<GroupedCartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setCart(null);
      setGroupedItems([]);
      setTotalItems(0);
      setTotalAmount(0);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch("/api/cart", { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setCart(data.data);
        setGroupedItems(data.data.groupedItems || []);
        setTotalItems(data.data.totalItems || 0);
        setTotalAmount(data.data.totalAmount || 0);
      }
    } catch (err) {
      console.error("Cart refresh error:", err);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(
    async (menuItemId: string, quantity = 1) => {
      if (!isAuthenticated) {
        toast.error("Please login to add items");
        return;
      }
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ menuItemId, quantity }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        await refreshCart();
        toast.success("Added to cart");
      } catch (err: unknown) {
        toast.error((err as Error).message || "Failed to add item");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated, token, refreshCart]
  );

  const updateItem = useCallback(
    async (menuItemId: string, quantity: number) => {
      try {
        const res = await fetch("/api/cart", {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ menuItemId, quantity }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        await refreshCart();
      } catch (err: unknown) {
        toast.error((err as Error).message || "Failed to update cart");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, refreshCart]
  );

  const removeItem = useCallback(
    async (menuItemId: string) => {
      await updateItem(menuItemId, 0);
    },
    [updateItem]
  );

  const clearCart = useCallback(async () => {
    try {
      await fetch("/api/cart", { method: "DELETE", headers: authHeaders() });
      await refreshCart();
    } catch (err) {
      console.error("Clear cart error:", err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems,
        totalAmount,
        groupedItems,
        isLoading,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

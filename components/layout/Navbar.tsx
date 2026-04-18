
"use client";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { ChefHat, ShoppingCart, User, LogOut } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white">
          <ChefHat className="h-7 w-7 text-blue-600" />
          <span>FoodOrder</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/restaurants" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            Restaurants
          </Link>
          <Link href="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            <ShoppingCart className="h-6 w-6" />
            {cart && cart.items.length > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                {cart.items.length}
              </span>
            )}
          </Link>
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <User className="h-6 w-6" />
                <span>{user.name}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">My Profile</Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Admin Dashboard</Link>
                )}
                <button onClick={logout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <Link href="/auth/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

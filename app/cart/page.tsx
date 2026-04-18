
"use client";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { ICartItem } from "@/types";

export default function CartPage() {
  const { groupedItems, totalItems, totalAmount, updateItem, removeItem, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const DELIVERY_FEE = 30;

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
        <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-white">Your cart is waiting</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Please log in to see your cart and start ordering.</p>
        <Link href="/auth/login" className="mt-6 inline-block px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors">
          Login to View Cart
        </Link>
      </div>
    );
  }

  if (totalItems === 0 && !isLoading) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
        <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-white">Your cart is empty</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Looks like you haven’t added anything to your cart yet.</p>
        <Link href="/restaurants" className="mt-6 inline-block px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  const restaurantCount = groupedItems.length;
  const grandTotal = totalAmount + DELIVERY_FEE * restaurantCount;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Your Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {groupedItems.map((group) => (
              <div key={group.restaurantId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-4 border-b dark:border-gray-700">
                  <h2 className="font-semibold text-lg text-gray-800 dark:text-white">{group.restaurantName || "Restaurant"}</h2>
                  <Link href={`/restaurants/${group.restaurantId}`} className="text-sm text-blue-600 hover:underline">Visit restaurant</Link>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {group.items.map((item) => (
                    <CartItemRow
                      key={item.menuItemId.toString()}
                      item={item}
                      onUpdate={updateItem}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 border-b pb-4 dark:border-gray-700">Order Summary</h2>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Items total ({totalItems})</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery fee</span>
                  <span>${(DELIVERY_FEE * restaurantCount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-800 dark:text-white border-t pt-4 mt-4 dark:border-gray-700">
                  <span>Grand Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => router.push("/checkout")}
                className="w-full mt-6 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartItemRow({ item, onUpdate, onRemove }: { item: ICartItem; onUpdate: (id: string, qty: number) => void; onRemove: (id: string) => void; }) {
  const id = item.menuItemId.toString();

  return (
    <div className="flex items-center gap-4 p-4">
      {item.image && (
        <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md object-cover" />
      )}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 dark:text-white">{item.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center border rounded-md dark:border-gray-600">
          <button onClick={() => onUpdate(id, item.quantity - 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-md"><Minus className="h-4 w-4" /></button>
          <span className="px-3 font-semibold">{item.quantity}</span>
          <button onClick={() => onUpdate(id, item.quantity + 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-md"><Plus className="h-4 w-4" /></button>
        </div>
        <p className="font-semibold w-20 text-right text-gray-800 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
        <button onClick={() => onRemove(id)} className="text-gray-500 hover:text-red-500 dark:hover:text-red-400"><Trash2 className="h-5 w-5" /></button>
      </div>
    </div>
  );
}

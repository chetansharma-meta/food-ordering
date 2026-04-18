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
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl font-semibold mb-2">Your cart is waiting</h2>
        <p className="text-muted-foreground mb-6">Please login to view your cart</p>
        <Link
          href="/auth/login"
          className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-orange-600 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (totalItems === 0 && !isLoading) {
    return (
      <div className="container py-20 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add items from restaurants to get started</p>
        <Link
          href="/"
          className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-orange-600 transition-colors"
        >
          Browse restaurants
        </Link>
      </div>
    );
  }

  const restaurantCount = groupedItems.length;
  const grandTotal = totalAmount + DELIVERY_FEE * restaurantCount;

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShoppingBag className="h-6 w-6 text-orange-500" />
        Your Cart
        <span className="text-base font-normal text-muted-foreground ml-2">
          ({totalItems} item{totalItems !== 1 ? "s" : ""})
        </span>
      </h1>

      {restaurantCount > 1 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm">
          <p className="font-medium">🍴 Items from {restaurantCount} restaurants</p>
          <p className="text-amber-700 dark:text-amber-400 mt-0.5">
            Your order will be split into {restaurantCount} separate orders, one per restaurant.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-6">
          {groupedItems.map((group) => (
            <div key={group.restaurantId} className="rounded-xl border bg-card overflow-hidden">
              <div className="px-5 py-3 bg-muted/50 border-b flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">
                    {group.restaurantName || "Restaurant"}
                  </p>
                  <p className="text-xs text-muted-foreground">{group.items.length} item(s)</p>
                </div>
                <Link
                  href={`/restaurants/${group.restaurantId}`}
                  className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                >
                  Add more
                </Link>
              </div>
              <div className="divide-y">
                {group.items.map((item) => (
                  <CartItemRow
                    key={item.menuItemId.toString()}
                    item={item}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                  />
                ))}
              </div>
              <div className="px-5 py-3 border-t bg-muted/30 flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">₹{group.subtotal}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-lg">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items total</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Delivery fee ({restaurantCount} restaurant{restaurantCount > 1 ? "s" : ""})
                </span>
                <span>₹{DELIVERY_FEE * restaurantCount}</span>
              </div>
            </div>

            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Grand Total</span>
              <span className="text-orange-500 text-lg">₹{grandTotal}</span>
            </div>

            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium flex items-center gap-2">
              <span>💵</span>
              Cash on Delivery
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: ICartItem;
  onUpdate: (id: string, qty: number) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const id = item.menuItemId.toString();
  return (
    <div className="flex items-center gap-4 px-5 py-3">
      <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0">
        {item.image ? (
          <Image src={item.image} alt={item.name} width={56} height={56} className="object-cover w-full h-full" />
        ) : (
          <div className="h-full flex items-center justify-center text-xl">🍛</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm line-clamp-1">{item.name}</p>
        <p className="text-sm text-muted-foreground">₹{item.price}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-orange-500 text-white rounded-full px-1 py-0.5 gap-1">
          <button
            onClick={() => onUpdate(id, item.quantity - 1)}
            className="h-6 w-6 flex items-center justify-center hover:bg-orange-600 rounded-full transition-colors"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdate(id, item.quantity + 1)}
            className="h-6 w-6 flex items-center justify-center hover:bg-orange-600 rounded-full transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        <span className="text-sm font-semibold w-16 text-right">
          ₹{item.price * item.quantity}
        </span>

        <button
          onClick={() => onRemove(id)}
          className="text-muted-foreground hover:text-destructive transition-colors ml-1"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

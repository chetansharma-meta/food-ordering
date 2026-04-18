"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Package, Store, Plus, ChevronRight, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import clsx from "clsx";

interface Restaurant {
  _id: string;
  name: string;
  isOpen: boolean;
  rating: number;
  reviewCount: number;
  location: { city: string };
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  preparing: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  out_for_delivery: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "out_for_delivery",
  out_for_delivery: "delivered",
};

export default function DashboardPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== "restaurant_owner" && user.role !== "admin")) {
      router.push("/");
      return;
    }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const loadData = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const [restRes, ordersRes] = await Promise.all([
      fetch("/api/restaurants", { headers }),
      // Get active orders for owned restaurants
      fetch("/api/admin/orders?limit=20", { headers }),
    ]);
    const restData = await restRes.json();
    const ordersData = await ordersRes.json();
    if (restData.success) setRestaurants(restData.data);
    if (ordersData.success) setOrders(ordersData.data);
    setIsLoading(false);
  };

  const toggleOpen = async (restaurantId: string, currentlyOpen: boolean) => {
    const res = await fetch(`/api/restaurants/${restaurantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isOpen: !currentlyOpen }),
    });
    if (res.ok) {
      setRestaurants((prev) =>
        prev.map((r) => (r._id === restaurantId ? { ...r, isOpen: !currentlyOpen } : r))
      );
      toast.success(currentlyOpen ? "Restaurant marked as closed" : "Restaurant is now open");
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setOrders((prev) =>
        (prev as { _id: string; status: string }[]).map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o
        )
      );
      toast.success(`Order marked as ${newStatus.replace("_", " ")}`);
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to update");
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="container py-8 space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  const activeOrders = (orders as { status: string }[]).filter(
    (o) => !["delivered", "cancelled"].includes(o.status)
  );

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back, {user?.name}</p>
        </div>
        <Link
          href="/api/restaurants"
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Restaurant
        </Link>
      </div>

      {/* Restaurants */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Store className="h-5 w-5 text-orange-500" />
          Your Restaurants
        </h2>
        {restaurants.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            <p className="text-3xl mb-2">🍳</p>
            <p className="font-medium">No restaurants yet</p>
            <p className="text-sm mt-1">Add your first restaurant to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {restaurants.map((r) => (
              <div key={r._id} className="rounded-xl border bg-card p-5 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.location?.city}</p>
                </div>
                <button
                  onClick={() => toggleOpen(r._id, r.isOpen)}
                  className={clsx(
                    "flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-colors",
                    r.isOpen
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  )}
                >
                  {r.isOpen ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  {r.isOpen ? "Open" : "Closed"}
                </button>
                <Link
                  href={`/dashboard/${r._id}`}
                  className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                  Manage menu
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active orders */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-orange-500" />
          Active Orders
          {activeOrders.length > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {activeOrders.length}
            </span>
          )}
        </h2>

        {activeOrders.length === 0 ? (
          <div className="rounded-xl border p-8 text-center text-muted-foreground">
            <p className="text-3xl mb-2">✅</p>
            <p>No active orders right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(activeOrders as { _id: string; orderId: string; restaurantName: string; totalAmount: number; status: string; items: { name: string; quantity: number }[] }[]).map((order) => (
              <div key={order._id} className="rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{order.orderId}</p>
                    <p className="text-xs text-muted-foreground">{order.restaurantName}</p>
                  </div>
                  <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[order.status])}>
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">₹{order.totalAmount}</span>
                  {NEXT_STATUS[order.status] && (
                    <button
                      onClick={() => updateOrderStatus(order._id, NEXT_STATUS[order.status])}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
                    >
                      Mark as {NEXT_STATUS[order.status].replace("_", " ")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

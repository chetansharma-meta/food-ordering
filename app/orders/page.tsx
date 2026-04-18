"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { IOrder } from "@/types";
import { Package, ChevronRight, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  preparing: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  out_for_delivery: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrdersPage() {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "1";

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    loadOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, statusFilter]);

  const loadOrders = async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ limit: "20" });
    if (statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`/api/orders?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setOrders(data.data);
    setIsLoading(false);
  };

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Package className="h-6 w-6 text-orange-500" />
        <h1 className="text-2xl font-bold">My Orders</h1>
      </div>

      {isSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-400">Order placed successfully!</p>
            <p className="text-sm text-green-700 dark:text-green-500">You can track your order below.</p>
          </div>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {["all", "pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={clsx(
              "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              statusFilter === s
                ? "bg-orange-500 text-white"
                : "bg-secondary hover:bg-accent"
            )}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-medium">No orders yet</p>
          <Link
            href="/"
            className="text-sm text-orange-500 hover:text-orange-600 mt-2 block"
          >
            Browse restaurants →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order._id} href={`/orders/${order._id}`}>
              <div className="p-5 rounded-xl border bg-card hover:shadow-sm transition-shadow flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{order.restaurantName}</p>
                    <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[order.status])}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {order.orderId} · {order.items.length} item(s) · ₹{order.totalAmount}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {order.items.map((i) => i.name).join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { IOrder } from "@/types";
import { Package, ChevronRight, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { format } from "date-fns";

const STATUS_STYLES: Record<string, { bg: string, text: string, border: string }> = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  preparing: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  out_for_delivery: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  delivered: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
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
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
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
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">My Orders</h1>

        {isSuccess && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300">Order placed successfully!</p>
              <p className="text-sm text-green-700 dark:text-green-400">Your order is confirmed and will be processed shortly.</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {["all", ...Object.keys(STATUS_LABELS)].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              )}
            >
              {s === "all" ? "All Orders" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Package className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-white">No orders found</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">It looks like you haven't placed any orders yet.</p>
            <Link href="/restaurants" className="mt-6 inline-block px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors">
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => <OrderCard key={order._id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: IOrder }) {
  const statusStyle = STATUS_STYLES[order.status] || {};
  return (
    <Link href={`/orders/${order._id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">{order.restaurantName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Order ID: {order.orderId}</p>
          </div>
          <div className={clsx('text-xs font-medium px-3 py-1 rounded-full', statusStyle.bg, statusStyle.text)}>
            {STATUS_LABELS[order.status]}
          </div>
        </div>
        <div className="border-t dark:border-gray-700 my-4"></div>
        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-300">Date: {format(new Date(order.createdAt), "MMMM d, yyyy")}</p>
            <p className="text-gray-600 dark:text-gray-300">Items: {order.items.length}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg text-blue-600">₹{order.totalAmount.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex justify-end mt-4">
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                View Details <ChevronRight className="h-4 w-4 ml-1" />
            </div>
        </div>
      </div>
    </Link>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex justify-between items-start">
        <div>
          <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      </div>
      <div className="border-t dark:border-gray-700 my-4"></div>
      <div className="flex justify-between items-center">
        <div>
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}

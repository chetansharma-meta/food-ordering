"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useAdminSocket } from "@/lib/hooks/useSocket";
import { Users, Store, Package, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { format } from "date-fns";

// A more detailed order type
interface Order {
  _id: string;
  orderId: string;
  customerName: string; // Assuming the API provides this
  restaurantName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalRestaurants: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleOrderUpdate = useCallback((updatedOrder: Order) => {
    setRecentOrders((prevOrders) => {
      const orderExists = prevOrders.some((o) => o._id === updatedOrder._id);
      if (orderExists) {
        // Update existing order
        return prevOrders.map((o) => (o._id === updatedOrder._id ? updatedOrder : o));
      } else {
        // Add new order to the top and maintain list size
        return [updatedOrder, ...prevOrders].slice(0, 10);
      }
    });

    // Also update pending order count in stats
    if (updatedOrder.status === 'pending') {
        setStats(prev => prev ? ({ ...prev, pendingOrders: prev.pendingOrders + 1 }) : null);
    } else {
        // More complex logic would be needed to decrement accurately
    }

  }, []);

  useAdminSocket(handleOrderUpdate);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, token]);

  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/stats", { headers }),
        fetch("/api/admin/orders?limit=10", { headers }),
      ]);
      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();

      if (statsData.success) setStats(statsData.data);
      if (ordersData.success) {
        // Enriching customer name for the example
        const ordersWithCustomer = ordersData.data.map((o: any) => ({ ...o, customerName: o.customer?.name ?? 'N/A' }));
        setRecentOrders(ordersWithCustomer);
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading || authLoading) {
    return (
      <div className="container py-8 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-xl bg-gray-200 animate-pulse" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: <Users className="h-5 w-5" /> },
    { label: "Restaurants", value: stats?.totalRestaurants ?? 0, icon: <Store className="h-5 w-5" /> },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: <Package className="h-5 w-5" /> },
    { label: "Revenue", value: `₹${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: <TrendingUp className="h-5 w-5" /> },
  ];

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Real-time platform overview</p>
        </div>
        <button onClick={loadData} className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800">
            Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="rounded-xl border p-5">
            <div className="mb-3 text-gray-500">{card.icon}</div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {(stats?.pendingOrders ?? 0) > 0 && (
        <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
          <p className="font-medium text-yellow-800">
            ⚠️ {stats?.pendingOrders} order{stats?.pendingOrders !== 1 ? "s" : ""} awaiting confirmation
          </p>
          <Link href="/admin/orders?status=pending" className="text-sm text-yellow-700 hover:underline mt-0.5 block">
            View pending orders →
          </Link>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <div className="rounded-xl border bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Order ID</th>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">Restaurant</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No recent orders</td></tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id} className="border-b last:border-b-0">
                    <td className="p-4 font-medium">{order.orderId}</td>
                    <td className="p-4 text-gray-600">{order.customerName}</td>
                    <td className="p-4 text-gray-600">{order.restaurantName}</td>
                    <td className="p-4 font-semibold">₹{order.totalAmount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={clsx("text-xs px-2 py-1 rounded-full font-medium capitalize", STATUS_COLORS[order.status] || 'bg-gray-100')}>
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{format(new Date(order.createdAt), "dd MMM, hh:mm a")}</td>
                    <td className="p-4">
                        <Link href={`/orders/${order._id}`}>
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                        </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

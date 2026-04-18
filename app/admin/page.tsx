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

  const loadData = useCallback(async () => {
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
        const ordersWithCustomer = ordersData.data.map((o: any) => ({ ...o, customerName: o.customer?.name ?? 'N/A' }));
        setRecentOrders(ordersWithCustomer);
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleOrderUpdate = useCallback((updatedOrder: Order) => {
    setRecentOrders((prevOrders) => {
      const orderExists = prevOrders.some((o) => o._id === updatedOrder._id);
      if (orderExists) {
        return prevOrders.map((o) => (o._id === updatedOrder._id ? updatedOrder : o));
      } else {
        return [updatedOrder, ...prevOrders].slice(0, 10);
      }
    });
    
    // Optimistically update stats
    if (updatedOrder.status === 'pending') {
        setStats(prev => prev ? ({ ...prev, pendingOrders: prev.pendingOrders + 1 }) : null);
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
  }, [user, authLoading, token, router, loadData]);

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: <Users className="h-6 w-6" /> },
    { label: "Restaurants", value: stats?.totalRestaurants ?? 0, icon: <Store className="h-6 w-6" /> },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: <Package className="h-6 w-6" /> },
    { label: "Revenue", value: `₹${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: <TrendingUp className="h-6 w-6" /> },
  ];

  if (authLoading || (!user && !token)) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mb-4"></div>
                <h2 className="text-xl font-semibold">Loading Dashboard...</h2>
                <p className="text-gray-500">Please wait while we get things ready.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name ?? 'Admin'}. Here's what's happening.</p>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </header>

        {isLoading && recentOrders.length === 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-lg shadow-md animate-pulse" />
              ))}
            </div>
            <div className="h-96 bg-white rounded-lg shadow-md animate-pulse" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((card, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">{card.label}</p>
                    <div className="text-gray-400">{card.icon}</div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
              ))}
            </div>
            
            {(stats?.pendingOrders ?? 0) > 0 && (
              <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4" role="alert">
                <p className="font-bold">Heads up!</p>
                <p>{stats?.pendingOrders} order{stats?.pendingOrders !== 1 ? "s are" : " is"} awaiting confirmation.</p>
                <Link href="/admin/orders?status=pending" className="font-bold underline">
                  View pending orders
                </Link>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                <p className="text-sm text-gray-500 mt-1">A list of the most recent orders.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Order ID</th>
                      <th scope="col" className="px-6 py-3">Customer</th>
                      <th scope="col" className="px-6 py-3">Restaurant</th>
                      <th scope="col" className="px-6 py-3">Amount</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                      <th scope="col" className="px-6 py-3">Date</th>
                      <th scope="col" className="px-6 py-3"><span className="sr-only">View</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-24 text-center">
                          <div className="flex flex-col items-center">
                            <Package className="w-12 h-12 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-900 mt-2">No recent orders</h3>
                            <p className="text-sm text-gray-500">New orders will appear here.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order._id} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{order.orderId}</td>
                          <td className="px-6 py-4">{order.customerName}</td>
                          <td className="px-6 py-4">{order.restaurantName}</td>
                          <td className="px-6 py-4">₹{order.totalAmount.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800')}>
                              {order.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4">{format(new Date(order.createdAt), "dd MMM, yyyy - HH:mm")}</td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/orders/${order._id}`} className="font-medium text-indigo-600 hover:text-indigo-900">
                              View
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
        )}
      </div>
    </div>
  );
}
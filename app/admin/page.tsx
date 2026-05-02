"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useAdminSocket } from "@/lib/hooks/useSocket";
import { Users, Store, Package, TrendingUp } from "lucide-react";
import clsx from "clsx";
import { format } from "date-fns";
import { OrderStatus } from "@/types";

interface Order {
  _id: string;
  orderId: string;
  restaurantName: string;
  totalAmount: number;
  status: OrderStatus;
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

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_TRANSITIONS: Record<string, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

const ADMIN_TABS = ["overview", "orders", "restaurants", "owners"] as const;
type AdminTab = (typeof ADMIN_TABS)[number];

export default function AdminPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [creatingOwner, setCreatingOwner] = useState(false);
  const [creatingRestaurant, setCreatingRestaurant] = useState(false);
  const [newOwner, setNewOwner] = useState({ name: "", email: "", password: "", phone: "", restaurantId: "" });
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    description: "",
    cuisineTypes: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    deliveryFee: 0,
    avgDeliveryTime: 30,
    minOrderAmount: 0,
    ownerId: "",
  });

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [statsRes, ordersRes, restaurantsRes, ownersRes] = await Promise.all([
        fetch("/api/admin/stats", { headers }),
        fetch("/api/admin/orders?limit=10", { headers }),
        fetch("/api/admin/restaurants?limit=50", { headers }),
        fetch("/api/admin/users?role=restaurant_owner&limit=50", { headers }),
      ]);

      const [statsData, ordersData, restaurantsData, ownersData] = await Promise.all([
        statsRes.json(),
        ordersRes.json(),
        restaurantsRes.json(),
        ownersRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (ordersData.success) setOrders(ordersData.data);
      if (restaurantsData.success) setRestaurants(restaurantsData.data);
      if (ownersData.success) setOwners(ownersData.data);
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleOrderUpdate = useCallback((payload: { orderId: string; status: OrderStatus }) => {
    setOrders((prev) => prev.map((order) => (order.orderId === payload.orderId ? { ...order, status: payload.status } : order)));
  }, []);

  useAdminSocket(handleOrderUpdate);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }
    loadData();
  }, [user, authLoading, router, loadData]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    if (!token) return;
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status } : order)));
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleToggleRestaurantOpen = async (restaurantId: string, isOpen: boolean) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOpen: !isOpen }),
      });
      const data = await res.json();
      if (data.success) {
        setRestaurants((prev) => prev.map((restaurant) => (restaurant._id === restaurantId ? { ...restaurant, isOpen: !isOpen } : restaurant)));
      }
    } catch (error) {
      console.error("Failed to toggle restaurant open state:", error);
    }
  };

  const handleAssignOwner = async (restaurantId: string, ownerId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ownerId }),
      });
      const data = await res.json();
      if (data.success) {
        setRestaurants((prev) => prev.map((restaurant) => (restaurant._id === restaurantId ? { ...restaurant, ownerId } : restaurant)));
      }
    } catch (error) {
      console.error("Failed to assign restaurant owner:", error);
    }
  };

  const handleCreateOwner = async () => {
    if (!token) return;
    setCreatingOwner(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOwner),
      });
      const data = await res.json();
      if (data.success) {
        setOwners((prev) => [data.data, ...prev]);
        setNewOwner({ name: "", email: "", password: "", phone: "", restaurantId: "" });
      }
    } catch (error) {
      console.error("Failed to create owner:", error);
    } finally {
      setCreatingOwner(false);
    }
  };

  const handleCreateRestaurant = async () => {
    if (!token) return;
    setCreatingRestaurant(true);
    try {
      const res = await fetch("/api/admin/restaurants", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newRestaurant.name,
          description: newRestaurant.description,
          cuisineTypes: newRestaurant.cuisineTypes.split(",").map((c) => c.trim()).filter(Boolean),
          location: {
            address: newRestaurant.address,
            city: newRestaurant.city,
            state: newRestaurant.state,
            pincode: newRestaurant.pincode,
          },
          ownerId: newRestaurant.ownerId,
          deliveryFee: Number(newRestaurant.deliveryFee),
          avgDeliveryTime: Number(newRestaurant.avgDeliveryTime),
          minOrderAmount: Number(newRestaurant.minOrderAmount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRestaurants((prev) => [data.data, ...prev]);
        setNewRestaurant({
          name: "",
          description: "",
          cuisineTypes: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          deliveryFee: 0,
          avgDeliveryTime: 30,
          minOrderAmount: 0,
          ownerId: "",
        });
      }
    } catch (error) {
      console.error("Failed to create restaurant:", error);
    } finally {
      setCreatingRestaurant(false);
    }
  };

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
        <header className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage orders, restaurants, and owner accounts from one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  activeTab === tab
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                )}
              >
                {tab === "overview" ? "Overview" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <main className="space-y-8">
            {activeTab === "overview" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {statCards.map((card, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">{card.label}</p>
                        <div className="text-gray-400">{card.icon}</div>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mt-4">{card.value}</p>
                    </div>
                  ))}
                </div>

                {(stats?.pendingOrders ?? 0) > 0 && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-5 rounded-lg">
                    <p className="font-semibold">Pending orders waiting</p>
                    <p>{stats.pendingOrders} order{stats.pendingOrders !== 1 ? "s" : ""} need attention.</p>
                    <button onClick={() => setActiveTab("orders")} className="mt-2 text-sm font-semibold text-yellow-800 underline">
                      Review pending orders
                    </button>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Recent orders</h2>
                    <p className="text-sm text-gray-500 mt-1">Quick actions for the latest order activity.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3">Order</th>
                          <th className="px-6 py-3">Restaurant</th>
                          <th className="px-6 py-3">Amount</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-16 text-center text-gray-400">No recent orders to display.</td>
                          </tr>
                        ) : (
                          orders.map((order) => (
                            <tr key={order._id} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium">{order.orderId}</td>
                              <td className="px-6 py-4">{order.restaurantName}</td>
                              <td className="px-6 py-4">₹{order.totalAmount.toFixed(2)}</td>
                              <td className="px-6 py-4">
                                <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800")}>{order.status.replace("_", " ")}</span>
                              </td>
                              <td className="px-6 py-4">{format(new Date(order.createdAt), "dd MMM, yyyy")}</td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => setActiveTab("orders")} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Manage</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === "orders" && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Manage orders</h2>
                    <p className="text-sm text-gray-500">Approve, prepare, and dispatch orders in real-time.</p>
                  </div>
                  <button onClick={loadData} className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm">Refresh orders</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Order</th>
                        <th className="px-6 py-3">Restaurant</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center text-gray-400">No orders available.</td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order._id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium">{order.orderId}</td>
                            <td className="px-6 py-4">{order.restaurantName}</td>
                            <td className="px-6 py-4">₹{order.totalAmount.toFixed(2)}</td>
                            <td className="px-6 py-4">
                              <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800")}>{order.status.replace("_", " ")}</span>
                            </td>
                            <td className="px-6 py-4">{format(new Date(order.createdAt), "dd MMM, yyyy")}</td>
                            <td className="px-6 py-4 space-x-2">
                              {STATUS_TRANSITIONS[order.status]?.map((nextStatus) => (
                                <button
                                  key={nextStatus}
                                  onClick={() => handleStatusChange(order._id, nextStatus)}
                                  disabled={updatingOrderId === order._id}
                                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 disabled:opacity-50"
                                >
                                  {STATUS_LABELS[nextStatus]}
                                </button>
                              ))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "restaurants" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Manage restaurants</h2>
                      <p className="text-sm text-gray-500">Review the full restaurant catalog and assign owners.</p>
                    </div>
                    <button onClick={loadData} className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm">Refresh restaurants</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">City</th>
                          <th className="px-6 py-3">Owner</th>
                          <th className="px-6 py-3">Open</th>
                          <th className="px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {restaurants.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-16 text-center text-gray-400">No restaurants available.</td>
                          </tr>
                        ) : (
                          restaurants.map((restaurant) => (
                            <tr key={restaurant._id} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium">{restaurant.name}</td>
                              <td className="px-6 py-4">{restaurant.location?.city}</td>
                              <td className="px-6 py-4">{owners.find((owner) => owner._id === restaurant.ownerId)?.email || "Unassigned"}</td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleToggleRestaurantOpen(restaurant._id, restaurant.isOpen)}
                                  className={clsx(
                                    "px-3 py-1.5 rounded-full text-xs font-medium",
                                    restaurant.isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                  )}
                                >
                                  {restaurant.isOpen ? "Open" : "Closed"}
                                </button>
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  value={restaurant.ownerId || ""}
                                  onChange={(event) => handleAssignOwner(restaurant._id, event.target.value)}
                                  className="rounded-md border border-gray-200 px-3 py-2 text-sm"
                                >
                                  <option value="">Assign owner</option>
                                  {owners.map((owner) => (
                                    <option key={owner._id} value={owner._id}>{owner.email}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Create new restaurant</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <input value={newRestaurant.name} onChange={(e) => setNewRestaurant((prev) => ({ ...prev, name: e.target.value }))} placeholder="Restaurant name" className="rounded-md border border-gray-200 px-3 py-2" />
                    <input value={newRestaurant.city} onChange={(e) => setNewRestaurant((prev) => ({ ...prev, city: e.target.value }))} placeholder="City" className="rounded-md border border-gray-200 px-3 py-2" />
                    <textarea value={newRestaurant.description} onChange={(e) => setNewRestaurant((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" className="col-span-full rounded-md border border-gray-200 px-3 py-2" rows={3} />
                    <input value={newRestaurant.address} onChange={(e) => setNewRestaurant((prev) => ({ ...prev, address: e.target.value }))} placeholder="Address" className="rounded-md border border-gray-200 px-3 py-2" />
                    <input value={newRestaurant.state} onChange={(e) => setNewRestaurant((prev) => ({ ...prev, state: e.target.value }))} placeholder="State" className="rounded-md border border-gray-200 px-3 py-2" />
                    <input value={newRestaurant.pincode} onChange={(e) => setNewRestaurant((prev) => ({ ...prev, pincode: e.target.value }))} placeholder="Pincode" className="rounded-md border border-gray-200 px-3 py-2" />
                    <input value={newRestaurant.cuisineTypes} onChange={(e) => setNewRestaurant((prev) => ({ ...prev, cuisineTypes: e.target.value }))} placeholder="Cuisines (comma separated)" className="col-span-full rounded-md border border-gray-200 px-3 py-2" />
                    <input type="number" value={newRestaurant.minOrderAmount} onChange={(e) => setNewRestaurant((prev) => ({ ...prev, minOrderAmount: Number(e.target.value) }))} placeholder="Minimum order amount" className="rounded-md border border-gray-200 px-3 py-2" />
                    <input type="number" value={newRestaurant.deliveryFee} onChange={(e) => setNewRestaurant((prev) => ({ ...prev, deliveryFee: Number(e.target.value) }))} placeholder="Delivery fee" className="rounded-md border border-gray-200 px-3 py-2" />
                    <input type="number" value={newRestaurant.avgDeliveryTime} onChange={(e) => setNewRestaurant((prev) => ({ ...prev, avgDeliveryTime: Number(e.target.value) }))} placeholder="Avg delivery time" className="rounded-md border border-gray-200 px-3 py-2" />
                    <select value={newRestaurant.ownerId} onChange={(e) => setNewRestaurant((prev) => ({ ...prev, ownerId: e.target.value }))} className="rounded-md border border-gray-200 px-3 py-2">
                      <option value="">Choose owner</option>
                      {owners.map((owner) => (
                        <option key={owner._id} value={owner._id}>{owner.email}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={handleCreateRestaurant} disabled={creatingRestaurant} className="mt-4 rounded-full bg-indigo-600 text-white px-5 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
                    {creatingRestaurant ? "Creating…" : "Create restaurant"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "owners" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Restaurant owners</h2>
                      <p className="text-sm text-gray-500">Create owner accounts and assign them to restaurants.</p>
                    </div>
                    <button onClick={loadData} className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm">Refresh owners</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Email</th>
                          <th className="px-6 py-3">Phone</th>
                          <th className="px-6 py-3">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {owners.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-16 text-center text-gray-400">No owners found.</td>
                          </tr>
                        ) : (
                          owners.map((owner) => (
                            <tr key={owner._id} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium">{owner.name}</td>
                              <td className="px-6 py-4">{owner.email}</td>
                              <td className="px-6 py-4">{owner.phone || "—"}</td>
                              <td className="px-6 py-4">{new Date(owner.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Create restaurant owner</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <input value={newOwner.name} onChange={(e) => setNewOwner((prev) => ({ ...prev, name: e.target.value }))} placeholder="Name" className="rounded-md border border-gray-200 px-3 py-2" />
                    <input value={newOwner.email} onChange={(e) => setNewOwner((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="rounded-md border border-gray-200 px-3 py-2" />
                    <input type="password" value={newOwner.password} onChange={(e) => setNewOwner((prev) => ({ ...prev, password: e.target.value }))} placeholder="Password" className="rounded-md border border-gray-200 px-3 py-2" />
                    <input value={newOwner.phone} onChange={(e) => setNewOwner((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone" className="rounded-md border border-gray-200 px-3 py-2" />
                    <select value={newOwner.restaurantId} onChange={(e) => setNewOwner((prev) => ({ ...prev, restaurantId: e.target.value }))} className="rounded-md border border-gray-200 px-3 py-2">
                      <option value="">Link to restaurant (optional)</option>
                      {restaurants.map((restaurant) => (
                        <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={handleCreateOwner} disabled={creatingOwner} className="mt-4 rounded-full bg-indigo-600 text-white px-5 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
                    {creatingOwner ? "Creating…" : "Create owner account"}
                  </button>
                </div>
              </div>
            )}
          </main>

          <aside className="space-y-6 lg:sticky lg:top-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900">Quick actions</h2>
              <div className="mt-4 space-y-3">
                <button onClick={() => setActiveTab("orders")} className="w-full rounded-md border border-gray-200 px-4 py-3 text-left text-sm font-medium hover:bg-gray-100">Review pending orders</button>
                <button onClick={() => setActiveTab("restaurants")} className="w-full rounded-md border border-gray-200 px-4 py-3 text-left text-sm font-medium hover:bg-gray-100">Manage restaurants</button>
                <button onClick={() => setActiveTab("owners")} className="w-full rounded-md border border-gray-200 px-4 py-3 text-left text-sm font-medium hover:bg-gray-100">Add restaurant owners</button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900">Admin snapshot</h2>
              <p className="text-sm text-gray-500 mt-2">Real-time visibility into platform performance.</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="font-semibold">Users</p>
                  <p>{stats?.totalUsers ?? 0}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="font-semibold">Restaurants</p>
                  <p>{stats?.totalRestaurants ?? 0}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="font-semibold">Orders</p>
                  <p>{stats?.totalOrders ?? 0}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="font-semibold">Revenue</p>
                  <p>₹{(stats?.totalRevenue ?? 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

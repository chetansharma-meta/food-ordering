import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Restaurant from "@/lib/models/Restaurant";
import Order from "@/lib/models/Order";
import { withAuth, successResponse, errorResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";

// GET /api/admin/stats
export const GET = withAuth(async (_req: NextRequest, user: JwtPayload) => {
  try {
    await connectDB();

    let restaurantFilter: Record<string, unknown> = {};
    if (user.role === "restaurant_owner") {
      restaurantFilter = { ownerId: user.id };
    }

    const restaurants = await Restaurant.find(restaurantFilter).select("_id").lean();
    const restaurantIds = restaurants.map((rest) => rest._id);
    const ordersFilter: Record<string, unknown> = {};
    if (user.role === "restaurant_owner") {
      ordersFilter.restaurantId = { $in: restaurantIds };
    }

    const [
      totalUsers,
      totalRestaurants,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      Restaurant.countDocuments(restaurantFilter),
      Order.countDocuments(ordersFilter),
      Order.countDocuments({ ...ordersFilter, status: "pending" }),
      Order.countDocuments({ ...ordersFilter, status: "delivered" }),
      Order.aggregate([
        { $match: { ...ordersFilter, status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyOrders = await Order.aggregate([
      { $match: { ...ordersFilter, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return successResponse({
      totalUsers,
      totalRestaurants,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalRevenue: revenueResult[0]?.total ?? 0,
      dailyOrders,
    });
  } catch (error) {
    console.error("[ADMIN_STATS]", error);
    return errorResponse("Internal server error", 500);
  }
}, ["admin", "restaurant_owner"]);

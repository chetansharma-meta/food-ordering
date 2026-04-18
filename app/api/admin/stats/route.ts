import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Restaurant from "@/lib/models/Restaurant";
import Order from "@/lib/models/Order";
import { withAdminAuth, getPagination, successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";

// GET /api/admin/stats
export const GET = withAdminAuth(async (_req: NextRequest, _user: JwtPayload) => {
  try {
    await connectDB();

    const [
      totalUsers,
      totalRestaurants,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      Restaurant.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "delivered" }),
      Order.aggregate([
        { $match: { status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    // Orders per day (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
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
});

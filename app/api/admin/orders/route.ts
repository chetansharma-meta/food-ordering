import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import Restaurant from "@/lib/models/Restaurant";
import { withAuth, getPagination, errorResponse, paginatedResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";

// GET /api/admin/orders
export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    await connectDB();
    const { page, limit, skip } = getPagination(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const restaurantId = searchParams.get("restaurantId");

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (restaurantId) query.restaurantId = restaurantId;

    if (user.role === "restaurant_owner") {
      const ownedRestaurants = await Restaurant.find({ ownerId: user.id }).select("_id").lean();
      const ownedIds = ownedRestaurants.map((rest) => rest._id);
      query.restaurantId = { $in: ownedIds };
      if (restaurantId && !ownedIds.some((id) => id.toString() === restaurantId)) {
        return errorResponse("Forbidden. Cannot view orders for other restaurants.", 403);
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return paginatedResponse(orders, total, page, limit);
  } catch (error) {
    console.error("[ADMIN_ORDERS_GET]", error);
    return errorResponse("Internal server error", 500);
  }
}, ["admin", "restaurant_owner"]);

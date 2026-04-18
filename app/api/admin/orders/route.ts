import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import { withAdminAuth, getPagination, errorResponse, paginatedResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";

// GET /api/admin/orders
export const GET = withAdminAuth(async (req: NextRequest, _user: JwtPayload) => {
  try {
    await connectDB();
    const { page, limit, skip } = getPagination(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const restaurantId = searchParams.get("restaurantId");

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (restaurantId) query.restaurantId = restaurantId;

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
});

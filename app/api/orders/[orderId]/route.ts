import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import Notification from "@/lib/models/Notification";
import { withAuth, withOwnerAuth, successResponse, errorResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";
import { OrderStatus } from "@/lib/models/Order";
import { emitOrderUpdate } from "@/lib/socket";

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: "Order received",
  confirmed: "Order confirmed by restaurant",
  preparing: "Your food is being prepared",
  out_for_delivery: "Out for delivery",
  delivered: "Order delivered",
  cancelled: "Order cancelled",
};

const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

// GET /api/orders/[orderId]
export const GET = withAuth(async (_req: NextRequest, user: JwtPayload, params?: Record<string, string>) => {
  try {
    await connectDB();
    const order = await Order.findOne({ _id: params?.orderId }).lean();
    if (!order) return errorResponse("Order not found", 404);

    if (user.role === "customer" && order.userId.toString() !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    return successResponse(order);
  } catch (error) {
    console.error("[ORDER_GET]", error);
    return errorResponse("Internal server error", 500);
  }
});

// PATCH /api/orders/[orderId] — update status (owner/admin)
export const PATCH = withOwnerAuth(
  async (req: NextRequest, user: JwtPayload, params?: Record<string, string>) => {
    try {
      await connectDB();
      const order = await Order.findById(params?.orderId);
      if (!order) return errorResponse("Order not found", 404);

      if (user.role === "restaurant_owner") {
        const Restaurant = (await import("@/lib/models/Restaurant")).default;
        const rest = await Restaurant.findById(order.restaurantId);
        if (!rest || rest.ownerId.toString() !== user.id) {
          return errorResponse("Forbidden", 403);
        }
      }

      const { status, note } = await req.json();
      if (!status) return errorResponse("status required");

      const currentStatus = order.status as OrderStatus;
      const allowed = VALID_STATUS_TRANSITIONS[currentStatus];

      if (!allowed.includes(status as OrderStatus)) {
        return errorResponse(`Cannot transition from "${currentStatus}" to "${status}"`);
      }

      order.status = status;
      order.statusHistory.push({ status, timestamp: new Date(), note });
      await order.save();

      await Notification.create({
        userId: order.userId,
        type: "status_update",
        title: STATUS_MESSAGES[status as OrderStatus],
        message: `Order ${order.orderId}: ${STATUS_MESSAGES[status as OrderStatus]}`,
        orderId: order._id,
      });

      // Debug: log what's on global so we can confirm shared instance
      console.log(
        "[ORDER_PATCH] global socket key present:",
        !!(global as any)["__socket_io_instance__"]
      );

      // ✅ Use _id (MongoDB ObjectId string) — matches what client joins via useParams
      emitOrderUpdate(order._id.toString(), {
        status,
        message: STATUS_MESSAGES[status as OrderStatus],
        timestamp: new Date().toISOString(),
      });

      return successResponse(order);
    } catch (error) {
      console.error("[ORDER_PATCH]", error);
      return errorResponse("Internal server error", 500);
    }
  }
);
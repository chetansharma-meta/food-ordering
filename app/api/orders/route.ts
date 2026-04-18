import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import Cart from "@/lib/models/Cart";
import Restaurant from "@/lib/models/Restaurant";
import Notification from "@/lib/models/Notification";
import { withCustomerAuth, getPagination, successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";
import { nanoid } from "crypto";

const placeOrderSchema = z.object({
  deliveryAddress: z.object({
    label: z.string().default("Home"),
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
  }),
  notes: z.string().max(200).optional(),
});

// GET /api/orders — list user's orders
export const GET = withCustomerAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    await connectDB();
    const { page, limit, skip } = getPagination(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: Record<string, unknown> = { userId: user.id };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    return paginatedResponse(orders, total, page, limit);
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return errorResponse("Internal server error", 500);
  }
});

// POST /api/orders — checkout: split cart into per-restaurant orders
export const POST = withCustomerAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = placeOrderSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

    // Load cart
    const cart = await Cart.findOne({ userId: user.id });
    if (!cart || cart.items.length === 0) {
      return errorResponse("Cart is empty", 400);
    }

    // Group cart items by restaurant
    const groups: Record<string, typeof cart.items> = {};
    cart.items.forEach((item) => {
      const rid = item.restaurantId.toString();
      if (!groups[rid]) groups[rid] = [];
      groups[rid].push(item);
    });

    const restaurantIds = Object.keys(groups);

    // Validate restaurants still exist and are open
    const restaurants = await Restaurant.find({
      _id: { $in: restaurantIds },
      isActive: true,
    }).lean();

    if (restaurants.length !== restaurantIds.length) {
      return errorResponse("One or more restaurants are no longer available");
    }

    // Shared group ID links all orders from this checkout
    const groupOrderId = nanoid(10).toUpperCase();
    const DELIVERY_FEE = 30;
    const createdOrders = [];

    for (const restaurant of restaurants) {
      const rid = restaurant._id.toString();
      const items = groups[rid];

      const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

      // Check min order
      if (itemsTotal < restaurant.minOrderAmount) {
        return errorResponse(
          `Minimum order for ${restaurant.name} is ₹${restaurant.minOrderAmount}`
        );
      }

      const order = await Order.create({
        userId: user.id,
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          foodType: i.foodType,
        })),
        deliveryAddress: parsed.data.deliveryAddress,
        totalAmount: itemsTotal + DELIVERY_FEE,
        deliveryFee: DELIVERY_FEE,
        paymentMethod: "cash_on_delivery",
        paymentStatus: "pending",
        notes: parsed.data.notes,
        groupOrderId,
        statusHistory: [{ status: "pending", timestamp: new Date() }],
        estimatedDeliveryTime: new Date(
          Date.now() + (restaurant.avgDeliveryTime || 45) * 60 * 1000
        ),
      });

      createdOrders.push(order);

      // Create notification
      await Notification.create({
        userId: user.id,
        type: "order_placed",
        title: "Order placed!",
        message: `Your order from ${restaurant.name} (${order.orderId}) has been placed successfully.`,
        orderId: order._id,
      });
    }

    // Clear cart after successful order
    await Cart.findOneAndUpdate({ userId: user.id }, { items: [] });

    return successResponse(
      {
        orders: createdOrders,
        groupOrderId,
        totalOrders: createdOrders.length,
        message:
          createdOrders.length > 1
            ? `${createdOrders.length} orders placed from different restaurants`
            : "Order placed successfully",
      },
      201
    );
  } catch (error) {
    console.error("[ORDERS_POST]", error);
    return errorResponse("Internal server error", 500);
  }
});

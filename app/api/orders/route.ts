
import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import Cart from "@/lib/models/Cart";
import Restaurant from "@/lib/models/Restaurant";
import Notification from "@/lib/models/Notification";
import { withCustomerAuth, getPagination, successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";
import { nanoid } from "nanoid";
import mongoose from "mongoose";

const placeOrderSchema = z.object({
  deliveryAddress: z.object({
    _id: z.string().optional(),
    label: z.string().default("Home"),
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
    isDefault: z.boolean().optional(),
  }),
  notes: z.string().max(200).optional(),
  items: z.array(z.object({
    menuItemId: z.string(),
    restaurantId: z.string(),
    name: z.string(),
    price: z.number(),
    image: z.string().optional(),
    quantity: z.number().min(1),
    foodType: z.enum(["veg", "non-veg", "egg"])
  }))
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
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message, 400);

    const { deliveryAddress, notes, items: cartItems } = parsed.data;

    if (!cartItems || cartItems.length === 0) {
      return errorResponse("Cart is empty", 400);
    }

    // Group cart items by restaurant
    const groups: Record<string, typeof cartItems> = {};
    cartItems.forEach((item) => {
      const rid = item.restaurantId.toString();
      if (!groups[rid]) groups[rid] = [];
      groups[rid].push(item);
    });

    const restaurantIds = Object.keys(groups);

    const restaurants = await Restaurant.find({
      _id: { $in: restaurantIds },
      isActive: true,
      isOpen: true,
    }).lean();

    if (restaurants.length !== restaurantIds.length) {
      return errorResponse("One or more restaurants are currently unavailable", 400);
    }

    const groupOrderId = nanoid(10).toUpperCase();
    const createdOrders = [];

    for (const restaurant of restaurants) {
      const rid = restaurant._id.toString();
      const itemsInGroup = groups[rid];

      const itemsTotal = itemsInGroup.reduce((sum, i) => sum + i.price * i.quantity, 0);

      if (itemsTotal < restaurant.minOrderAmount) {
        return errorResponse(
          `Minimum order for ${restaurant.name} is ₹${restaurant.minOrderAmount}`,
          400
        );
      }

      const order = new Order({
        userId: new mongoose.Types.ObjectId(user.id),
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        items: itemsInGroup.map((i) => ({
          menuItemId: new mongoose.Types.ObjectId(i.menuItemId),
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          foodType: i.foodType,
        })),
        deliveryAddress: deliveryAddress,
        totalAmount: itemsTotal + restaurant.deliveryFee,
        deliveryFee: restaurant.deliveryFee,
        paymentMethod: "cash_on_delivery",
        paymentStatus: "pending",
        notes: notes,
        groupOrderId,
        status: "pending",
        statusHistory: [{ status: "pending", timestamp: new Date() }],
        estimatedDeliveryTime: new Date(
          Date.now() + (restaurant.avgDeliveryTime || 45) * 60 * 1000
        ),
      });

      await order.save();
      createdOrders.push(order);

      await Notification.create({
        userId: new mongoose.Types.ObjectId(user.id),
        type: "order_placed",
        title: "Order placed!",
        message: `Your order from ${restaurant.name} (${order.orderId}) has been placed successfully.`,
        orderId: order._id,
      });
    }

    await Cart.findOneAndUpdate({ userId: user.id }, { $set: { items: [] } }, { new: true });

    const orderId = createdOrders.map(o => o._id).join(',');

    return successResponse(
      {
        orderId,
        groupOrderId,
        message: `Order placed successfully! ${createdOrders.length > 1 ? `(${createdOrders.length} separate orders)` : ""}`,
      },
      201
    );
  } catch (error) {
    console.error("[ORDERS_POST]", error);
    return errorResponse("Internal server error", 500);
  }
});

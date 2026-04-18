import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Cart from "@/lib/models/Cart";
import { MenuItem } from "@/lib/models/Menu";
import { withCustomerAuth, successResponse, errorResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";

const addItemSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number().min(1).max(20).default(1),
});

// GET /api/cart
export const GET = withCustomerAuth(async (_req: NextRequest, user: JwtPayload) => {
  try {
    await connectDB();
    const cart = await Cart.findOne({ userId: user.id }).lean();

    if (!cart) return successResponse({ items: [], groupedItems: [] });

    // Group by restaurant for frontend convenience
    const grouped: Record<string, { restaurantId: string; items: unknown[]; subtotal: number }> = {};
    (cart.items || []).forEach((item) => {
      const rid = item.restaurantId.toString();
      if (!grouped[rid]) {
        grouped[rid] = { restaurantId: rid, items: [], subtotal: 0 };
      }
      grouped[rid].items.push(item);
      grouped[rid].subtotal += item.price * item.quantity;
    });

    return successResponse({
      ...cart,
      groupedItems: Object.values(grouped),
      totalItems: cart.items.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    });
  } catch (error) {
    console.error("[CART_GET]", error);
    return errorResponse("Internal server error", 500);
  }
});

// POST /api/cart — add item
export const POST = withCustomerAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

    const { menuItemId, quantity } = parsed.data;

    const menuItem = await MenuItem.findOne({ _id: menuItemId, isAvailable: true }).lean();
    if (!menuItem) return errorResponse("Menu item not found or unavailable", 404);

    let cart = await Cart.findOne({ userId: user.id });
    if (!cart) {
      cart = await Cart.create({ userId: user.id, items: [] });
    }

    const existingIdx = cart.items.findIndex(
      (i) => i.menuItemId.toString() === menuItemId
    );

    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({
        menuItemId: menuItem._id,
        restaurantId: menuItem.restaurantId,
        name: menuItem.name,
        price: menuItem.discountedPrice ?? menuItem.price,
        image: menuItem.image,
        quantity,
        foodType: menuItem.foodType,
      });
    }

    await cart.save();
    return successResponse(cart);
  } catch (error) {
    console.error("[CART_POST]", error);
    return errorResponse("Internal server error", 500);
  }
});

// PATCH /api/cart — update quantity (set to 0 to remove)
export const PATCH = withCustomerAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    await connectDB();
    const { menuItemId, quantity } = await req.json();
    if (!menuItemId) return errorResponse("menuItemId required");

    const cart = await Cart.findOne({ userId: user.id });
    if (!cart) return errorResponse("Cart not found", 404);

    const idx = cart.items.findIndex((i) => i.menuItemId.toString() === menuItemId);
    if (idx === -1) return errorResponse("Item not in cart", 404);

    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }

    await cart.save();
    return successResponse(cart);
  } catch (error) {
    console.error("[CART_PATCH]", error);
    return errorResponse("Internal server error", 500);
  }
});

// DELETE /api/cart — clear entire cart
export const DELETE = withCustomerAuth(async (_req: NextRequest, user: JwtPayload) => {
  try {
    await connectDB();
    await Cart.findOneAndUpdate({ userId: user.id }, { items: [] });
    return successResponse({ message: "Cart cleared" });
  } catch (error) {
    console.error("[CART_DELETE]", error);
    return errorResponse("Internal server error", 500);
  }
});

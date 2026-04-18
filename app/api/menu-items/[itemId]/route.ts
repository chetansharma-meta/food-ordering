import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { MenuItem } from "@/lib/models/Menu";
import Restaurant from "@/lib/models/Restaurant";
import { withOwnerAuth, successResponse, errorResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";

type Params = { params: { itemId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const item = await MenuItem.findById(params.itemId).lean();
    if (!item) return errorResponse("Item not found", 404);
    return successResponse(item);
  } catch (error) {
    console.error("[MENU_ITEM_GET]", error);
    return errorResponse("Internal server error", 500);
  }
}

export const PATCH = withOwnerAuth(
  async (req: NextRequest, user: JwtPayload, params?: Record<string, string>) => {
    try {
      await connectDB();
      const item = await MenuItem.findById(params?.itemId);
      if (!item) return errorResponse("Item not found", 404);

      const restaurant = await Restaurant.findById(item.restaurantId);
      if (user.role !== "admin" && restaurant?.ownerId.toString() !== user.id) {
        return errorResponse("Forbidden", 403);
      }

      const body = await req.json();
      const allowedFields = [
        "name", "description", "price", "discountedPrice",
        "image", "foodType", "isAvailable", "isPopular",
        "preparationTime", "categoryId",
      ];
      const updates: Record<string, unknown> = {};
      allowedFields.forEach((f) => {
        if (body[f] !== undefined) updates[f] = body[f];
      });

      const updated = await MenuItem.findByIdAndUpdate(params?.itemId, updates, {
        new: true, runValidators: true,
      });
      return successResponse(updated);
    } catch (error) {
      console.error("[MENU_ITEM_PATCH]", error);
      return errorResponse("Internal server error", 500);
    }
  }
);

export const DELETE = withOwnerAuth(
  async (_req: NextRequest, user: JwtPayload, params?: Record<string, string>) => {
    try {
      await connectDB();
      const item = await MenuItem.findById(params?.itemId);
      if (!item) return errorResponse("Item not found", 404);

      const restaurant = await Restaurant.findById(item.restaurantId);
      if (user.role !== "admin" && restaurant?.ownerId.toString() !== user.id) {
        return errorResponse("Forbidden", 403);
      }

      await MenuItem.findByIdAndDelete(params?.itemId);
      return successResponse({ message: "Item deleted" });
    } catch (error) {
      console.error("[MENU_ITEM_DELETE]", error);
      return errorResponse("Internal server error", 500);
    }
  }
);

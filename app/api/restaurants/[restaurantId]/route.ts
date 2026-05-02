import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Restaurant from "@/lib/models/Restaurant";
import { withOwnerAuth, successResponse, errorResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";

type Params = { params: { restaurantId: string } };

// GET /api/restaurants/[restaurantId]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const restaurant = await Restaurant.findOne({
      _id: params.restaurantId,
      isActive: true,
    }).lean();
    if (!restaurant) return errorResponse("Restaurant not found", 404);
    return successResponse(restaurant);
  } catch (error) {
    console.error("[RESTAURANT_GET]", error);
    return errorResponse("Internal server error", 500);
  }
}

// PATCH /api/restaurants/[restaurantId]
export const PATCH = withOwnerAuth(
  async (req: NextRequest, user: JwtPayload, params?: Record<string, string>) => {
    try {
      await connectDB();
      const restaurantId = params?.restaurantId;
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) return errorResponse("Restaurant not found", 404);

      // Owners can only edit their own; admins can edit any
      if (user.role !== "admin" && restaurant.ownerId.toString() !== user.id) {
        return errorResponse("Forbidden", 403);
      }

      const body = await req.json();
      const allowedFields = [
        "name", "description", "cuisineTypes", "location",
        "coverImage", "logo", "avgDeliveryTime", "minOrderAmount",
        "deliveryFee", "isOpen",
      ];
      const updates: Record<string, unknown> = {};
      allowedFields.forEach((f) => {
        if (body[f] !== undefined) updates[f] = body[f];
      });

      if (user.role === "admin" && body.ownerId) {
        updates.ownerId = body.ownerId;
      }

      const updated = await Restaurant.findByIdAndUpdate(
        restaurantId,
        updates,
        { new: true, runValidators: true }
      );
      return successResponse(updated);
    } catch (error) {
      console.error("[RESTAURANT_PATCH]", error);
      return errorResponse("Internal server error", 500);
    }
  }
);

// DELETE /api/restaurants/[restaurantId] — soft delete
export const DELETE = withOwnerAuth(
  async (_req: NextRequest, user: JwtPayload, params?: Record<string, string>) => {
    try {
      await connectDB();
      const restaurant = await Restaurant.findById(params?.restaurantId);
      if (!restaurant) return errorResponse("Restaurant not found", 404);

      if (user.role !== "admin" && restaurant.ownerId.toString() !== user.id) {
        return errorResponse("Forbidden", 403);
      }

      await Restaurant.findByIdAndUpdate(params?.restaurantId, { isActive: false });
      return successResponse({ message: "Restaurant removed successfully" });
    } catch (error) {
      console.error("[RESTAURANT_DELETE]", error);
      return errorResponse("Internal server error", 500);
    }
  }
);

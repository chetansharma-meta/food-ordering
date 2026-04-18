import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Menu";
import Restaurant from "@/lib/models/Restaurant";
import { withOwnerAuth, successResponse, errorResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";

const categorySchema = z.object({
  restaurantId: z.string(),
  name: z.string().min(1).max(50),
  sortOrder: z.number().default(0),
});

// POST /api/categories
export const POST = withOwnerAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

    // Verify ownership
    const restaurant = await Restaurant.findById(parsed.data.restaurantId);
    if (!restaurant) return errorResponse("Restaurant not found", 404);
    if (user.role !== "admin" && restaurant.ownerId.toString() !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    const category = await Category.create(parsed.data);
    return successResponse(category, 201);
  } catch (error) {
    console.error("[CATEGORY_POST]", error);
    return errorResponse("Internal server error", 500);
  }
});

// PATCH /api/categories/[categoryId]
export const PATCH = withOwnerAuth(
  async (req: NextRequest, user: JwtPayload, params?: Record<string, string>) => {
    try {
      await connectDB();
      const category = await Category.findById(params?.categoryId).populate("restaurantId");
      if (!category) return errorResponse("Category not found", 404);

      const restaurant = await Restaurant.findById(category.restaurantId);
      if (user.role !== "admin" && restaurant?.ownerId.toString() !== user.id) {
        return errorResponse("Forbidden", 403);
      }

      const body = await req.json();
      const { name, sortOrder, isActive } = body;
      const updated = await Category.findByIdAndUpdate(
        params?.categoryId,
        { ...(name && { name }), ...(sortOrder !== undefined && { sortOrder }), ...(isActive !== undefined && { isActive }) },
        { new: true }
      );
      return successResponse(updated);
    } catch (error) {
      console.error("[CATEGORY_PATCH]", error);
      return errorResponse("Internal server error", 500);
    }
  }
);

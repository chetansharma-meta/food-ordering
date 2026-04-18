import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { MenuItem } from "@/lib/models/Menu";
import Restaurant from "@/lib/models/Restaurant";
import { withOwnerAuth, successResponse, errorResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";

const menuItemSchema = z.object({
  restaurantId: z.string(),
  categoryId: z.string(),
  name: z.string().min(2).max(100),
  description: z.string().max(300).optional(),
  price: z.number().min(0),
  discountedPrice: z.number().min(0).optional(),
  image: z.string().url().optional(),
  foodType: z.enum(["veg", "non-veg", "egg"]).default("veg"),
  isAvailable: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  preparationTime: z.number().min(1).max(120).default(15),
});

// POST /api/menu-items
export const POST = withOwnerAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = menuItemSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

    const restaurant = await Restaurant.findById(parsed.data.restaurantId);
    if (!restaurant) return errorResponse("Restaurant not found", 404);
    if (user.role !== "admin" && restaurant.ownerId.toString() !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    const item = await MenuItem.create(parsed.data);
    return successResponse(item, 201);
  } catch (error) {
    console.error("[MENU_ITEM_POST]", error);
    return errorResponse("Internal server error", 500);
  }
});

// GET /api/menu-items?restaurantId=xxx
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const categoryId = searchParams.get("categoryId");

    const query: Record<string, unknown> = {};
    if (restaurantId) query.restaurantId = restaurantId;
    if (categoryId) query.categoryId = categoryId;

    const items = await MenuItem.find(query).sort({ isPopular: -1, name: 1 }).lean();
    return successResponse(items);
  } catch (error) {
    console.error("[MENU_ITEMS_GET]", error);
    return errorResponse("Internal server error", 500);
  }
}

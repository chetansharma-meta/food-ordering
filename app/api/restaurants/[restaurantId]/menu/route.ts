import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Category, MenuItem } from "@/lib/models/Menu";
import { successResponse, errorResponse } from "@/lib/utils/api";

type Params = { params: { restaurantId: string } };

// GET /api/restaurants/[restaurantId]/menu
// Returns categories with their menu items nested
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { restaurantId } = params;

    const [categories, menuItems] = await Promise.all([
      Category.find({ restaurantId, isActive: true })
        .sort({ sortOrder: 1, name: 1 })
        .lean(),
      MenuItem.find({ restaurantId, isAvailable: true })
        .sort({ isPopular: -1, name: 1 })
        .lean(),
    ]);

    // Nest items under their category
    const menuWithItems = categories.map((cat) => ({
      ...cat,
      items: menuItems.filter(
        (item) => item.categoryId.toString() === cat._id.toString()
      ),
    }));

    return successResponse(menuWithItems);
  } catch (error) {
    console.error("[MENU_GET]", error);
    return errorResponse("Internal server error", 500);
  }
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Restaurant from "@/lib/models/Restaurant";
import { withAuth, withOwnerAuth, getPagination, successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";

const createRestaurantSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  cuisineTypes: z.array(z.string()).min(1),
  location: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  }),
  coverImage: z.string().url().optional(),
  logo: z.string().url().optional(),
  avgDeliveryTime: z.number().min(5).max(120).default(30),
  minOrderAmount: z.number().min(0).default(0),
  deliveryFee: z.number().min(0).default(0),
});

// GET /api/restaurants — public, with search & filter
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPagination(req);

    const search = searchParams.get("search");
    const cuisine = searchParams.get("cuisine");
    const city = searchParams.get("city");
    const isOpen = searchParams.get("isOpen");

    const query: Record<string, unknown> = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (cuisine) {
      query.cuisineTypes = { $in: [cuisine] };
    }
    if (city) {
      query["location.city"] = { $regex: city, $options: "i" };
    }
    if (isOpen === "true") {
      query.isOpen = true;
    }

    const [restaurants, total] = await Promise.all([
      Restaurant.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ rating: -1, createdAt: -1 })
        .lean(),
      Restaurant.countDocuments(query),
    ]);

    return paginatedResponse(restaurants, total, page, limit);
  } catch (error) {
    console.error("[RESTAURANTS_GET]", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/restaurants — owner or admin only
export const POST = withOwnerAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = createRestaurantSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

    const restaurant = await Restaurant.create({
      ...parsed.data,
      ownerId: user.id,
      rating: 0,
      reviewCount: 0,
    });

    return successResponse(restaurant, 201);
  } catch (error) {
    console.error("[RESTAURANTS_POST]", error);
    return errorResponse("Internal server error", 500);
  }
});

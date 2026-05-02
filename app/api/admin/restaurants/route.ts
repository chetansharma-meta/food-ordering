import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Restaurant from "@/lib/models/Restaurant";
import User from "@/lib/models/User";
import { withAuth, successResponse, errorResponse, paginatedResponse, getPagination } from "@/lib/utils/api";
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
  ownerId: z.string().optional(),
});

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPagination(req);
    const search = searchParams.get("search");
    const ownerIdFilter = searchParams.get("ownerId");
    const isOpen = searchParams.get("isOpen");

    const query: Record<string, unknown> = {};

    if (user.role === "restaurant_owner") {
      query.ownerId = user.id;
    } else if (ownerIdFilter) {
      query.ownerId = ownerIdFilter;
    }

    if (search) {
      query.$text = { $search: search };
    }
    if (isOpen === "true") {
      query.isOpen = true;
    }

    const [restaurants, total] = await Promise.all([
      Restaurant.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Restaurant.countDocuments(query),
    ]);

    return paginatedResponse(restaurants, total, page, limit);
  } catch (error) {
    console.error("[ADMIN_RESTAURANTS_GET]", error);
    return errorResponse("Internal server error", 500);
  }
}, ["admin", "restaurant_owner"]);

export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    await connectDB();
    const payload = await req.json();
    const parsed = createRestaurantSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    const data = parsed.data;
    const ownerId = user.role === "admin" ? data.ownerId : user.id;
    if (!ownerId) {
      return errorResponse("ownerId is required when creating a restaurant as admin.");
    }

    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== "restaurant_owner") {
      return errorResponse("Owner not found or invalid role.", 404);
    }

    const restaurant = await Restaurant.create({
      ...data,
      ownerId,
      rating: 0,
      reviewCount: 0,
    });

    return successResponse(restaurant, 201);
  } catch (error) {
    console.error("[ADMIN_RESTAURANTS_POST]", error);
    return errorResponse("Internal server error", 500);
  }
}, ["admin", "restaurant_owner"]);

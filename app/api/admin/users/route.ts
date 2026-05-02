import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Restaurant from "@/lib/models/Restaurant";
import { withAdminAuth, getPagination, errorResponse, paginatedResponse, successResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(8).max(20).optional(),
  restaurantId: z.string().optional(),
});

// GET /api/admin/users
export const GET = withAdminAuth(async (req: NextRequest, _user: JwtPayload) => {
  try {
    await connectDB();
    const { page, limit, skip } = getPagination(req);
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).select("-password").skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      User.countDocuments(query),
    ]);

    return paginatedResponse(users, total, page, limit);
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error);
    return errorResponse("Internal server error", 500);
  }
});

// POST /api/admin/users — create restaurant owner
export const POST = withAdminAuth(async (req: NextRequest, _user: JwtPayload) => {
  try {
    await connectDB();
    const payload = await req.json();
    const parsed = createUserSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    const { name, email, password, phone, restaurantId } = parsed.data;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return errorResponse("Email already registered.", 409);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: "restaurant_owner",
      addresses: [],
      isActive: true,
    });

    if (restaurantId) {
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) return errorResponse("Restaurant not found", 404);
      restaurant.ownerId = newUser._id;
      await restaurant.save();
    }

    return successResponse({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
    }, 201);
  } catch (error) {
    console.error("[ADMIN_USERS_POST]", error);
    return errorResponse("Internal server error", 500);
  }
});

// PATCH /api/admin/users?id=xxx — toggle active status or change role
export const PATCH = withAdminAuth(async (req: NextRequest, _user: JwtPayload) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    if (!userId) return errorResponse("User ID required");

    const { isActive, role } = await req.json();
    const updates: Record<string, unknown> = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (role) updates.role = role;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
    if (!user) return errorResponse("User not found", 404);

    return successResponse(user);
  } catch (error) {
    console.error("[ADMIN_USER_PATCH]", error);
    return errorResponse("Internal server error", 500);
  }
});

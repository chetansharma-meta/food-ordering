import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { withAdminAuth, getPagination, errorResponse, paginatedResponse } from "@/lib/utils/api";
import { successResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";

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

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getUserFromRequest } from "@/lib/utils/jwt";
import { successResponse, errorResponse } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return errorResponse("Unauthorized", 401);

    await connectDB();
    const user = await User.findById(payload.id).select("-password");
    if (!user || !user.isActive) return errorResponse("User not found", 404);

    return successResponse(user);
  } catch (error) {
    console.error("[ME]", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return errorResponse("Unauthorized", 401);

    await connectDB();
    const body = await req.json();
    const { name, phone } = body;

    const user = await User.findByIdAndUpdate(
      payload.id,
      { ...(name && { name }), ...(phone && { phone }) },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return errorResponse("User not found", 404);
    return successResponse(user);
  } catch (error) {
    console.error("[UPDATE_ME]", error);
    return errorResponse("Internal server error", 500);
  }
}

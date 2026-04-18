import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { withAuth } from "@/lib/utils/api";
import { successResponse, errorResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";

const addressSchema = z.object({
  label: z.string().default("Home"),
  street: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),
  isDefault: z.boolean().default(false),
});

// GET /api/users/addresses
export const GET = withAuth(async (_req: NextRequest, user: JwtPayload) => {
  await connectDB();
  const found = await User.findById(user.id).select("addresses");
  if (!found) return errorResponse("User not found", 404);
  return successResponse(found.addresses);
});

// POST /api/users/addresses — add new address
export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  await connectDB();
  const body = await req.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

  const found = await User.findById(user.id);
  if (!found) return errorResponse("User not found", 404);

  // If this is the first address or marked as default, unset others
  if (parsed.data.isDefault || found.addresses.length === 0) {
    found.addresses.forEach((a) => (a.isDefault = false));
    parsed.data.isDefault = true;
  }

  found.addresses.push(parsed.data);
  await found.save();
  return successResponse(found.addresses, 201);
});

// DELETE /api/users/addresses?id=<addressId>
export const DELETE = withAuth(async (req: NextRequest, user: JwtPayload) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const addressId = searchParams.get("id");
  if (!addressId) return errorResponse("Address ID required");

  const found = await User.findById(user.id);
  if (!found) return errorResponse("User not found", 404);

  const idx = found.addresses.findIndex((a) => a._id?.toString() === addressId);
  if (idx === -1) return errorResponse("Address not found", 404);

  const wasDefault = found.addresses[idx].isDefault;
  found.addresses.splice(idx, 1);

  // Reassign default if needed
  if (wasDefault && found.addresses.length > 0) {
    found.addresses[0].isDefault = true;
  }

  await found.save();
  return successResponse(found.addresses);
});

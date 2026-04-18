import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { signToken } from "@/lib/utils/jwt";
import { successResponse, errorResponse } from "@/lib/utils/api";

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  phone: z.string().optional(),
  role: z.enum(["customer", "restaurant_owner"]).default("customer"),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400);
    }

    const { name, email, password, phone, role } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) {
      return errorResponse("Email already registered.", 409);
    }

    const user = await User.create({ name, email, password, phone, role });

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return successResponse(
      {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
      201
    );
  } catch (error) {
    console.error("[REGISTER]", error);
    return errorResponse("Internal server error", 500);
  }
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { signToken } from "@/lib/utils/jwt";
import { successResponse, errorResponse } from "@/lib/utils/api";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400);
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email, isActive: true }).select("+password");
    if (!user) {
      return errorResponse("Invalid email or password.", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse("Invalid email or password.", 401);
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return successResponse({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("[LOGIN]", error);
    return errorResponse("Internal server error", 500);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, JwtPayload } from "./jwt";
import { UserRole } from "@/types";

// ─── Standard response helpers ────────────────────────────────────────────────
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// ─── Auth middleware ──────────────────────────────────────────────────────────
type RouteHandler = (
  req: NextRequest,
  user: JwtPayload,
  params?: Record<string, string>
) => Promise<NextResponse>;

export function withAuth(handler: RouteHandler, allowedRoles?: UserRole[]) {
  return async (
    req: NextRequest,
    context?: { params: Record<string, string> }
  ) => {
    const user = getUserFromRequest(req);

    if (!user) {
      return errorResponse("Unauthorized. Please login.", 401);
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return errorResponse("Forbidden. Insufficient permissions.", 403);
    }

    return handler(req, user, context?.params);
  };
}

// Convenience wrappers
export const withCustomerAuth = (handler: RouteHandler) =>
  withAuth(handler, ["customer", "restaurant_owner", "admin"]);

export const withOwnerAuth = (handler: RouteHandler) =>
  withAuth(handler, ["restaurant_owner", "admin"]);

export const withAdminAuth = (handler: RouteHandler) =>
  withAuth(handler, ["admin"]);

// ─── Pagination helper ────────────────────────────────────────────────────────
export function getPagination(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

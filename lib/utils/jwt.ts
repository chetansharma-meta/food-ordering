import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { UserRole } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function getTokenFromRequest(req: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  // Fall back to cookie
  const cookie = req.cookies.get("token");
  return cookie?.value ?? null;
}

export function getUserFromRequest(req: NextRequest): JwtPayload | null {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

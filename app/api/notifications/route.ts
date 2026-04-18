import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/lib/models/Notification";
import { withCustomerAuth, successResponse, errorResponse } from "@/lib/utils/api";
import { JwtPayload } from "@/lib/utils/jwt";

// GET /api/notifications
export const GET = withCustomerAuth(async (_req: NextRequest, user: JwtPayload) => {
  try {
    await connectDB();
    const notifications = await Notification.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    const unreadCount = await Notification.countDocuments({ userId: user.id, isRead: false });
    return successResponse({ notifications, unreadCount });
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return errorResponse("Internal server error", 500);
  }
});

// PATCH /api/notifications — mark all as read
export const PATCH = withCustomerAuth(async (_req: NextRequest, user: JwtPayload) => {
  try {
    await connectDB();
    await Notification.updateMany({ userId: user.id, isRead: false }, { isRead: true });
    return successResponse({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("[NOTIFICATIONS_PATCH]", error);
    return errorResponse("Internal server error", 500);
  }
});

import { NextResponse, NextRequest } from "next/server";
import { NotificationService } from "../../../../src/services/notification.service";
import { getCurrentUser } from "../../../../src/lib/auth";

/* GET /api/notifications/unread-count */
export async function GET(req: NextRequest) {
  try {
    console.log("[API] /notifications/unread-count request received");

    /* Authenticate user */
    const user = await getCurrentUser(req);

    if (!user) {
      console.warn("[API] Unauthorized unread-count request");

      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.log(`[API] Authenticated user: ${user.id}`);

    /* Fetch unread notification count */
    const unreadCount = await NotificationService.getUnreadCount(user.id);

    console.log(`[API] Unread notifications for ${user.id}: ${unreadCount}`);

    return NextResponse.json(
      {
        success: true,
        unread: unreadCount ?? 0, // fallback safety
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("[API] Failed to fetch unread notification count");
    console.error({ message: error?.message, stack: error?.stack,});

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch unread notifications count",
      },
      { status: 500 }
    );
  }
}
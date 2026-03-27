// app/api/notifications/mark-read/route.ts
import { NextResponse, NextRequest } from "next/server";
import { NotificationService } from "../../../../src/services/notification.service";
import { getCurrentUser } from "../../../../src/lib/auth"; // safer auth

export async function Post(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      console.warn("[API] Unauthorized mark notification as read");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );      
    }

    const body = await req.json() as { notificationId: string };
    const { notificationId } = body;

    console.log(`[API] Marking notification ${notificationId} as read for user ${user.id}`);

    // Call service to mark as read
    await NotificationService.markAsRead(notificationId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API] Error marking notification as read:", err);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
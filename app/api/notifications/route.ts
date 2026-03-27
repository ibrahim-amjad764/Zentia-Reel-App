// // app/api/notifications/route.ts
// import { NextResponse, NextRequest } from "next/server";
// import { NotificationService } from "../../../src/services/notification.service";
// import { getCurrentUser } from "../../../src/lib/auth";

// export async function GET(req: NextRequest) {
//   try {
//     // Get authenticated user from cookie
//     const user = await getCurrentUser(req);

//     if (!user) {
//       console.warn("[API] Unauthorized request to fetch notifications");
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     console.log(`[API] Fetching notifications for user ${user.id}`);

//     // Fetch notifications from service
//     const notifications = await NotificationService.getUserNotifications(user.id);

//     return NextResponse.json({ notifications });
//   } catch (err) {
//     console.error("[API] Error fetching notifications:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch notifications" },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../src/lib/auth";
import { AppDataSource } from "../../../src/db/data-source";
import { Notification } from "../../../src/entities/notification";
import "@/lib/notificationWsServer";

export const runtime = "nodejs";
/* GET /api/notifications  -- get all notification */
export async function GET(req: NextRequest) {
  console.log("[Notifications API] GET called");

  try {
    if (!AppDataSource) {
      console.error("[Notifications API] AppDataSource is null");
      return NextResponse.json(
        { success: false, error: "Database not initialized" },
        { status: 500 }
      );
    }

    if (!AppDataSource.isInitialized) {
      console.log("[Notifications API] Initializing AppDataSource...");
      await AppDataSource.initialize();
      console.log("[Notifications API] AppDataSource initialized");
    }

    const user = await getCurrentUser(req);
    if (!user) {
      console.warn("[Notifications API] Unauthorized request");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.log("[Notifications API] Authenticated user ID:", user.id);

    const notifications = await getUserNotificationsHandler(user.id);

    return notifications;

  } catch (err: any) {
    console.error("[Notifications API] ERROR:", {
      message: err?.message,
      stack: err?.stack,
    });

    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

async function getUserNotificationsHandler(userId: string) {
  if (!AppDataSource) {
    throw new Error("AppDataSource is null in notifications handler");
  }
  const notificationRepo = AppDataSource.getRepository(Notification);
  const notifications: Notification[] = await notificationRepo.find({
    where: { recipient: { id: userId } },
    relations: ["sender", "post"],
    order: { createdAt: "DESC" },
    take: 50,
  });
  console.log(
    `[Notifications API] Repository fetched | userId=${userId} | count=${notifications.length}`
  );

  const formatted = notifications.map((notif) => ({
    id: notif.id,
    type: notif.type,
    message: notif.message,
    read: notif.read,
    createdAt: notif.createdAt,
    postId: notif.postId ?? null,

    sender: notif.sender
      ? {
          id: notif.sender.id,
          firstName: notif.sender.firstName,
          lastName: notif.sender.lastName,
        }
      : null,
  }));

  console.log("[Notifications API] Returning formatted notifications");

  return NextResponse.json({
    success: true,
    userId,
    notifications: formatted,
  });
}

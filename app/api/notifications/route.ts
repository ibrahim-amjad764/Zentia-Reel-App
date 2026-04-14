
// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../src/lib/auth";
import { AppDataSource } from "../../../src/db/data-source";
import { Notification } from "../../../src/entities/notification";
import "../../../src/lib/notificationWsServer";

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

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[Notifications API] ERROR:", { message, stack });

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

// src/app/api/users/[id]/follow/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../src/lib/auth";
import { initDB } from "../../../../../src/db/init-db";
import { AppDataSource } from "../../../../../src/db/data-source";
import { Follow } from "../../../../../src/entities/follow";
import { User } from "../../../../../src/entities/user";
import { NotificationService } from "../../../../../src/services/notification.service";
import { NotificationType } from "../../../../../src/entities/notification";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log("[FOLLOW API] Request received");

    const { params } = context;
    const unwrappedParams = await params;
    const targetUserId = unwrappedParams.id;

    console.log("[FOLLOW API] Target user id:", targetUserId);

    if (!targetUserId) {
      console.warn("[FOLLOW API] Invalid target user");
      return NextResponse.json(
        { error: "Invalid target user" },
        { status: 400 }
      );
    }

    /* Initialize database */
    console.log("[FOLLOW API] Initializing DB...");
    await initDB();

    if (!AppDataSource!.isInitialized) {
      await AppDataSource!.initialize();
      console.log("[FOLLOW API] AppDataSource initialized");
    }

    /* Get authenticated user */
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      console.warn("[FOLLOW API] Unauthorized request");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[FOLLOW API] Current user:", currentUser.id);

    if (currentUser.id === targetUserId) {
      console.warn("[FOLLOW API] User attempted to follow themselves");
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    /* Verify target user exists */
    const userRepo = AppDataSource!.getRepository(User);
    const targetUser = await userRepo.findOneBy({ id: targetUserId });

    if (!targetUser) {
      console.warn("[FOLLOW API] Target user not found:", targetUserId);
      return NextResponse.json(
        { error: "Invalid target user" },
        { status: 400 }
      );
    }

    console.log("[FOLLOW API] Target user exists:", targetUser.id);

    /* Check existing follow relationship */
    const followRepo = AppDataSource!.getRepository(Follow);
    const existing = await followRepo.findOne({
      where: {
        followerId: currentUser.id,
        followingId: targetUserId,
      },
    });

    if (existing) {
      console.log("[FOLLOW API] Already following user");
      return NextResponse.json({
        following: true,
        message: "Already following",
      });
    }

    /* Create follow record */
    console.log("[FOLLOW API] Creating follow relationship");
    const follow = followRepo.create({
      followerId: currentUser.id,
      followingId: targetUserId,
    });

    await followRepo.save(follow);
    console.log("[FOLLOW API] Follow saved successfully");

    /* CREATE NOTIFICATION */
    console.log("[FOLLOW API] Creating follow notification");
try {
  const notification = await NotificationService.createNotification({
    recipientId: targetUser.id,
    senderId: currentUser.id,
    type: NotificationType.FOLLOW,
    message: `${currentUser.firstName || "Someone"} followed you`,
  });
  console.log("[FOLLOW API] Notification created:", notification.id);
} catch (notifErr) {
  console.error("[FOLLOW API] Failed to create notification:", notifErr);
}
    /* Final response */
    return NextResponse.json({
      following: true,
      message: "Followed successfully",
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[FOLLOW API] ERROR:", { message, stack });

    return NextResponse.json(
      {
        error: "Failed to follow user",
        details: message,
      },
      { status: 500 }
    );
  }
}
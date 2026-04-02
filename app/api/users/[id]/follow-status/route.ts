//src/app/api/users/[id]/follow-status/route.ts
// src/app/api/users/[id]/follow-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../src/lib/auth";
import { initDB } from "../../../../../src/db/init-db";
import { AppDataSource } from "../../../../../src/db/data-source";
import { Follow } from "../../../../../src/entities/follow";
import { User } from "../../../../../src/entities/user";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // params is a Promise now
) {
  try {
    const { params } = context;
    const unwrappedParams = await params; // unwrap the promise
    const targetUserId = unwrappedParams.id;

    if (!targetUserId) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    await initDB();
    if (!AppDataSource!.isInitialized) await AppDataSource!.initialize();

    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRepo = AppDataSource!.getRepository(User);
    const targetUser = await userRepo.findOneBy({ id: targetUserId });
    if (!targetUser) {
      return NextResponse.json({ error: "Invalid target user" }, { status: 400 });
    }

    if (currentUser.id === targetUserId) {
      return NextResponse.json({ following: false });
    }

    const followRepo = AppDataSource!.getRepository(Follow);
    const existing = await followRepo.findOne({
      where: { followerId: currentUser.id, followingId: targetUserId },
    });

    return NextResponse.json({ following: !!existing });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[FOLLOW STATUS API] ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch follow status", details: message },
      { status: 500 }
    );
  }
}
//src/app/api/users/[id]/unfollow/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../src/lib/auth";
import { AppDataSource } from "../../../../../src/db/data-source";
import { Follow } from "../../../../../src/entities/follow";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const targetUserId = params.id;

    const currentUser = await getCurrentUser(req);

    if (!currentUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (currentUser.id === targetUserId)
      return NextResponse.json(
        { error: "Cannot unfollow yourself" },
        { status: 400 }
      );

    if (!AppDataSource!.isInitialized) {
      await AppDataSource!.initialize();
      console.log("[POST /unfollow] DataSource initialized");
    }

    const repo = AppDataSource!.getRepository(Follow);

    const existing = await repo.findOneBy({
      followerId: currentUser.id,
      followingId: targetUserId,
    });

    if (!existing) {
      console.log("[POST /unfollow] Not following");

      return NextResponse.json({
        following: false,
        message: "You were not following this user",
      });
    }

    await repo.remove(existing);

    console.log(`[POST /unfollow] ${currentUser.id} unfollowed ${targetUserId}`);

    return NextResponse.json({
      following: false,
      message: "Unfollowed successfully",
    });
  } catch (error) {
    console.error("[POST /unfollow] Error:", error);

    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 500 }
    );
  }
}

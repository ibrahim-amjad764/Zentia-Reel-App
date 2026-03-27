// src/app/api/posts/feed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "../../../../src/db/data-source";
import { Post } from "../../../../src/entities/post";
import { Follow } from "../../../../src/entities/follow";
import { getCurrentUser } from "../../../../src/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  try {
    const followRepo = AppDataSource!.getRepository(Follow);
    const following = await followRepo.find({ where: { followerId: user.id } });
    const followingIds = following.map((f) => f.followingId);
    followingIds.push(user.id); // include self posts

    const postRepo = AppDataSource!.getRepository(Post);
    const posts = await postRepo
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.comments", "comments")
      .leftJoinAndSelect("post.likes", "likes")
      .where("post.userId IN (:...ids)", { ids: followingIds })
      .orderBy("post.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();

    const formatted = posts.map((p) => ({
      ...p,
      likesCount: p.likes?.length || 0,
      comments: p.comments || [],
    }));

    return NextResponse.json({ posts: formatted, hasMore: formatted.length === limit });
  } catch (error) {
    console.error("[Feed API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
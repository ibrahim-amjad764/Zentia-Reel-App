// app/api/posts/like/route.ts
import { NextRequest } from "next/server";
import { AppDataSource } from "../../../../src/db/data-source";
import { Like } from "../../../../src/entities/like";
import { User } from "../../../../src/entities/user";
import admin from "../../../../src/lib/firebase-admin";
import { cookies } from "next/headers";
import { initDB } from "../../../../src/db/init-db";
import { Post } from "../../../../src/entities/post";
import { NotificationService } from "../../../../src/services/notification.service";

import { NotificationType } from "../../../../src/entities/notification";


export const runtime = "nodejs";

// Get authenticated user from Firebase token
async function getAuthUser() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("auth-token");
  
  console.log("[Auth Debug] All cookies:", cookieStore.getAll());
  console.log("[Auth Debug] auth-token:", tokenCookie?.value);
  
  if (!tokenCookie?.value) return null;

  try {
    const decoded = await admin.auth().verifyIdToken(tokenCookie.value);
    console.log("[Auth Debug] Firebase decoded:", decoded.email);
    
    // Ensure DB is initialized before querying
    if (!AppDataSource?.isInitialized) await initDB();

    const user = await AppDataSource!.getRepository(User).findOneBy({
      email: decoded.email,
    });
    
    if (!user) console.log("[Auth Debug] No user found with this email");
    
    return user;
  } catch (err) {
    console.error("[Auth Debug] verifyIdToken error:", err);
    return null;
  }
}
// POST /api/posts/like - Toggle like on a post
export async function POST(req: NextRequest) {
  const postRepo = AppDataSource!.getRepository(Post);

  try {
    if (!AppDataSource?.isInitialized) await initDB();

    const { postId } = await req.json();
    const authUser = await getAuthUser();

    if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (!postId) return Response.json({ error: "postId required" }, { status: 400 });

    const post = await postRepo.findOne({
      where: { id: postId },
      relations: ["user"], // fetch post owner
    });

    if (!post) return Response.json({ message: "Post not found" }, { status: 404 });

    const likeRepo = AppDataSource!.getRepository(Like);

    let action = "";
    let likesCount = 0;

    // Check if like exists
    const existingLike = await likeRepo.findOne({
      where: { post: { id: postId }, user: { id: authUser.id } },
    });

    if (existingLike) {
      await likeRepo.remove(existingLike);
      action = "unliked";
      console.log("[Like API] UNLIKE");
    } else {
      const newLike = likeRepo.create({
        post: { id: postId },
        user: { id: authUser.id },
      });
      await likeRepo.save(newLike);
      action = "liked";
      console.log("[Like API] LIKE");

      // CREATE NOTIFICATION if someone else liked the post
      if (post.user.id !== authUser.id) {
        await NotificationService.createNotification({
          recipientId: post.user.id,
          senderId: authUser.id,
          type: NotificationType.LIKE,
          message: `${authUser.firstName || "Someone"} liked your post`,
          // postId: post.id,
        });
        console.log(`[Like API] Notification sent to post owner: ${post.user.id}`);
      }
    }

    // Count total likes
    likesCount = await likeRepo.count({ where: { post: { id: postId } } });

    return Response.json({ action, likesCount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Like API] ERROR:", err);
    return Response.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
}
// GET /api/posts/like?postIds=xxx,yyy - Get likes count for multiple posts
export async function GET(req: NextRequest) {
  try {
    if (!AppDataSource?.isInitialized) await initDB(); // Ensure DB initialized
    
    const { searchParams } = new URL(req.url);
    const postIdsParam = searchParams.get("postIds");
    if (!postIdsParam) {
      console.warn("[GET /api/posts/like] postIds not provided");
      return Response.json({ message: "postIds required" }, { status: 400 });
    } 

    const postIds = postIdsParam.split(",");
    const likeRepo = AppDataSource!.getRepository(Like);
    
    const likesData = await Promise.all(
      postIds.map(async (id) => {
        const count = await likeRepo.count({ where: { post: { id } } });
        console.log(`[GET Like API] PostId: ${id}, Likes: ${count}`);
        return { postid: id, count };
      })
    );
    
    return Response.json(likesData);
  } catch (err) {
    console.error("[GET /api/posts/like] Error:", err);
    return Response.json({ error: "Failed to fetch likes" }, { status: 500 });
  }
}


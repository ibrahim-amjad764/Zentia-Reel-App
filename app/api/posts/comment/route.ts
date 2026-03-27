// app/api/posts/comment/route.ts
import { NextRequest } from "next/server";
import { initDB } from "../../../../src/db/init-db";
import { AppDataSource } from "../../../../src/db/data-source";
import { Post } from "../../../../src/entities/post";
import { Comment } from "../../../../src/entities/comment";
import { User } from "../../../../src/entities/user";
import admin from "../../../../src/lib/firebase-admin";
import { cookies } from "next/headers";
import { In } from "typeorm";
import { NotificationService } from "../../../../src/services/notification.service";
import { NotificationType } from "../../../../src/entities/notification";

// Runs in Node.js environment
export const runtime = "nodejs";

// Get authenticated user from Firebase token
async function getAuthUser() {
  const tokenCookie = (await cookies()).get("auth-token");
  if (!tokenCookie?.value) return null;

  try {
    const decoded = await admin.auth().verifyIdToken(tokenCookie.value); // Verify token
    if (!decoded.email) return null;

    // Ensure DB is initialized before accessing AppDataSource
    await initDB();

    // Defensive check for TypeScript safety
    if (!AppDataSource) {
      console.error("[getAuthUser] AppDataSource is null after initDB");
      return null;
    }

    // Fetch user from database by email
    const userRepo = AppDataSource.getRepository(User);
    return await userRepo.findOne({ where: { email: decoded.email } });
  } catch (err: unknown) {
    console.error("Error verifying token:", err instanceof Error ? err.message : err);
    return null; // Invalid token
  }
}

// GET /api/posts/comment?postId=xxx - Get comments for a single post
// GET /api/posts/comment?postIds=xxx,yyy - Get comments for multiple posts
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  console.log("[GET /api/posts/comment] Request started");

  try {
    const { searchParams } = new URL(req.url);

    const postId = searchParams.get("postId");         // single post
    const postIdsParam = searchParams.get("postIds");  // multiple posts

    await initDB();
    if (!AppDataSource) {
      console.error("[GET /api/posts/comment] AppDataSource is null after initDB");
      return Response.json({ error: "Database not initialized" }, { status: 500 });
    }

    const commentRepo = AppDataSource.getRepository(Comment);

    let comments: Comment[] = [];

    if (postId) {
      // Single post - return in original format for feed page compatibility
      console.log(`[GET /api/posts/comment] Fetching comments for single post: ${postId}`);
      comments = await commentRepo.find({
        where: { post: { id: postId } },
        relations: ["user"], // Only include user relation for original format
        order: { createdAt: "DESC" },
      });

      const duration = Date.now() - startTime;
      console.log(
        `[GET /api/posts/comment] Fetched ${comments.length} comments for post ${postId}, Took: ${duration}ms`
      );

      // Return in original format to match working commented version
      return Response.json({ comments });

    } else if (postIdsParam) {
      // Multiple posts - return flattened format for profile page
      const postIds = postIdsParam.split(",");
      console.log(`[GET /api/posts/comment] Fetching comments for multiple posts: ${postIds.join(", ")}`);
      comments = await commentRepo.find({
        where: { post: { id: In(postIds) } },
        relations: ["user", "post"],
        order: { createdAt: "DESC" },
      });

      const response = comments.map(c => ({
        postid: c.post.id,
        commentid: c.id,
        content: c.content,
        userid: c.user.id,
        firstName: c.user.firstName,
        lastName: c.user.lastName,
        createdAt: c.createdAt,
      }));

      const duration = Date.now() - startTime;
      console.log(`[GET /api/posts/comment] Fetched ${response.length} comments for multiple posts, Took: ${duration}ms`);

      return Response.json(response);
    } else {
      console.log("[GET /api/posts/comment] Bad request - postId or postIds missing");
      return Response.json({ message: "postId or postIds is required" }, { status: 400 });
    }
  } catch (err) {
    console.error("[GET /api/posts/comment] ERROR:", err);
    return Response.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST /api/posts/comment - Add a comment to a post
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log("[POST /api/posts/comment] Request started");

  try {
    await initDB(); // Ensure DB is initialized

    if (!AppDataSource) {
      console.error("[POST /api/posts/comment] AppDataSource is null after initDB");
      return Response.json({ error: "Database not initialized" }, { status: 500 });
    }

    const user = await getAuthUser();
    if (!user) {
      console.log("[POST /api/posts/comment] Unauthorized - no valid auth token");
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { postId, content } = await req.json();
    if (!postId || !content?.trim()) {
      console.log("[POST /api/posts/comment] Bad request - postId or content missing");
      return Response.json({ message: "postId and content are required" }, { status: 400 });
    }

    const postRepo = AppDataSource.getRepository(Post);
    const commentRepo = AppDataSource.getRepository(Comment);

    const post = await postRepo.findOne({
      where: { id: postId },
      relations: ["user"], // 🔥 THIS FIXES EVERYTHING
    });
    if (!post) {
      console.log(`[POST /api/posts/comment] Post not found: ${postId}`);
      return Response.json({ message: "Post not found" }, { status: 404 });
    }

    const comment = new Comment();
    comment.post = post;
    comment.user = user;
    comment.content = content.trim();

    const savedComment = await commentRepo.save(comment);

    if (post.user.id !== user.id) {
      console.log(`[NOTIF] Sending notification to post owner ${post.user.id}`);
      await NotificationService.createNotification({
        recipientId: post.user.id,
        senderId: user.id,
        type: NotificationType.COMMENT,
        message: `${user.firstName || "Someone"} commented on your post`,
        postId: post.id,
      });
    }

    const commentWithUser = await commentRepo.findOne({
      where: { id: savedComment.id },
      relations: ["user", "post"],
    });

    const duration = Date.now() - startTime;
    console.log(`[POST /api/posts/comment] SUCCESS - Comment ID: ${savedComment.id}, Took: ${duration}ms`);

    return Response.json(
      { comment: commentWithUser, message: "Comment added successfully" },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/posts/comment] ERROR:", err);
    return Response.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
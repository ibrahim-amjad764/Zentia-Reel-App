// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { initDB } from "../../../src/db/init-db";
import { AppDataSource } from "../../../src/db/data-source";
import admin from "../../../src/lib/firebase-admin";
import { Post } from "../../../src/entities/post";
import { Like } from "../../../src/entities/like";
import { Comment } from "../../../src/entities/comment";
import { User } from "../../../src/entities/user";
import { cookies } from "next/headers";
import { In } from "typeorm";

// Helper: Get authenticated user
async function getAuthUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    console.log("[getAuthUser] No auth-token found");
    return null;
  }

  try {
    // Ensure DB is initialized before accessing AppDataSource
    await initDB();

    if (!AppDataSource) {
      console.error("[getAuthUser] AppDataSource is null after initDB");
      return null;
    }

    const decoded = await admin.auth().verifyIdToken(token);
    if (!decoded.email) return null;

    const user = await AppDataSource.getRepository(User).findOneBy({ email: decoded.email });
    console.log("[getAuthUser] User found:", user?.email);
    return user || null;
  } catch (err) {
    console.error("[getAuthUser] Error verifying token:", err);
    return null;
  }
}

// --- GET: fetch posts with likes & comments info ---
export async function GET(req: Request) {
  const startTime = Date.now();
  console.log("[GET /api/posts] Start request");

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "5"));
    const mine = searchParams.get("mine") === "1";
    const userIdParam = searchParams.get("userId");
    const skip = (page - 1) * limit;

    await initDB();
    if (!AppDataSource) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const postRepo = AppDataSource.getRepository(Post);
    const likeRepo = AppDataSource.getRepository(Like);
    const commentRepo = AppDataSource.getRepository(Comment);

    // if client is requesting posts for a specific user we allow public access;
    // otherwise enforce authentication for `mine` or global feeds.
    let currentUser: User | null = null;
    if (!userIdParam) {
      currentUser = await getAuthUser();
      if (!currentUser) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    } else {
      // we still try to resolve the auth user so we can supply `isLikedByUser`
      currentUser = await getAuthUser();
    }

    // build filtering clause
    let whereClause: any = undefined;
    if (userIdParam) {
      whereClause = { user: { id: userIdParam } };
    } else if (mine) {
      whereClause = { user: { email: currentUser?.email } };
    }

    const posts = await postRepo.find({
      where: whereClause,
      relations: ["user"],
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    if (!posts.length) {
      return NextResponse.json({ posts: [], hasMore: false });
    }

    const postIds = posts.map((p) => p.id);

    const likes = await likeRepo.find({
      where: { post: { id: In(postIds) } },
      relations: ["user", "post"],
    });

    const likesByPost: Record<
      string,
      { id: string; firstName?: string; avatarUrl?: string }[]
    > = {};
    //every like is in loop & get post id & add like to array of post id
    likes.forEach((like) => {
      const postId = like.post.id;

      if (!likesByPost[postId]) likesByPost[postId] = [];

      likesByPost[postId].push({
        id: like.user.id,
        firstName: like.user.firstName,
        avatarUrl: like.user.avatarUrl,
      });
    });

    const comments = await commentRepo.find({
      where: { post: { id: In(postIds) } },
      relations: ["user", "post"],
      order: { createdAt: "ASC" },
    });

    const commentsByPost: Record<
      string,
      {
        id: string;
        content: string;
        user: { id: string; firstName?: string; avatarUrl?: string };
      }[]
    > = {};
    //every comment  is in loop & get post id & add coment to array of post id
    comments.forEach((comment) => {
      const postId = comment.post.id;

      if (!commentsByPost[postId]) commentsByPost[postId] = [];

      commentsByPost[postId].push({
        id: comment.id,
        content: comment.content,
        user: {
          id: comment.user.id,
          firstName: comment.user.firstName,
          avatarUrl: comment.user.avatarUrl,
        },
      });
    });

    //every post is in loop &  get id & get likes & comments of post
    //,if not exist like or comment  return empty array
    const enrichedPosts = posts.map((post) => {
      const postId = post.id;
      const likesList = likesByPost[postId] || [];
      const commentsList = commentsByPost[postId] || [];

      return {
        ...post,
        likesCount: likesList.length,
        commentsCount: commentsList.length,
        isLikedByUser: currentUser ? likesList.some((l) => l.id === currentUser!.id) : false,
        likes: likesList,
        comments: commentsList,
      };
    });

    const totalPosts = whereClause
      ? await postRepo.count({ where: whereClause })
      : await postRepo.count();

    const hasMore = totalPosts > page * limit;

    console.log(
      `[GET /api/posts] Success - ${enrichedPosts.length} posts, took ${Date.now() - startTime
      }ms`
    );

    return NextResponse.json({ posts: enrichedPosts, hasMore });
  } catch (error) {
    console.error("[GET /api/posts] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// --- POST: Create new post ---
export async function POST(req: Request) {
  console.log("[POST /api/posts] Start request");

  try {
    // Ensure database is initialized using consistent initDB function
    await initDB();
    if (!AppDataSource) {
      console.error("[POST /api/posts] AppDataSource is null after initDB");
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const currentUser = await getAuthUser();
    if (!currentUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { content, images } = await req.json();

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Post content is required" }, { status: 400 });
    }

    if (images && !Array.isArray(images)) {
      return NextResponse.json({ error: "Images must be an array" }, { status: 400 });
    }

    const postRepo = AppDataSource.getRepository(Post);
    // const post = await postRepo.findOne({
    //   where: { id: postId },
    //   relation: ["user"], 
    // });

    const newPost: Partial<Post> = {
      content: content.trim(),
      images: images || [],
      user: currentUser,
    };

    const savedPost = await postRepo.save(newPost);
    console.log("[POST /api/posts] Post created:", savedPost.id);

    return NextResponse.json(savedPost, { status: 201 });
  } catch (error) {
    console.error("[POST /api/posts] Error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
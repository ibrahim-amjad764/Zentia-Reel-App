// app/api/posts/location-feed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "../../../../src/db/data-source";
import { Post } from "../../../../src/entities/post";
import { User } from "../../../../src/entities/user";
import { getCurrentUser } from "../../../../src/lib/auth";
import { initDB } from "../../../../src/db/init-db";
import { error } from "console";

/* Handle GET request to fetch posts based on location */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    console.log("[Location Feed] Initiating proximity-based discovery...");

    //Initialize DB Connection
    await initDB();
    if (!AppDataSource?.isInitialized) await AppDataSource!.initialize();

    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const radius = parseInt(searchParams.get("radius") || "50"); //Kilometers
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    if (!AppDataSource) {
      console.error("[Location Feed] Datavase not initialized");
      return NextResponse.json({ error: "Database not Initialized" }, { status: 500 });
    }

    const postRepo = AppDataSource.getRepository(Post);
    let query = postRepo.createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "author")
      .leftJoinAndSelect("post.likes", "likes")
      .leftJoinAndSelect("post.comment", "comments")
      .skip(skip)
      .take(limit);

    let strategy = "Global / Tending";

    // Proximity Filter
    if (user.lat && user.lng) {
      strategy = `Promixity (${radius}km)`;
      console.log("[Location feed] Strategy: ${strategy} | User: ${user.lat}, ${user.lg}");

      query = query.addSelect(`(6371 * acos(
            cos(radians(:userLat)) * cos(radians(post.lat)) * 
            cos(radians(post.lng) - radians(:userLng)) + 
            sin(radians(:userLat)) * sin(radians(post.lat))
          ))`, "distance")
        .setParameter("userLat", user.lat)
        .setParameter("userLng", user.lng)
        .where("post.lat IS NOT NULL") // Only posts with explicit location
        .andWhere(`(
          6371 * acos(
            cos(radians(:userLat)) * cos(radians(post.lat)) * 
            cos(radians(post.lng) - radians(:userLng)) + 
            sin(radians(:userLat)) * sin(radians(post.lat))
          )) <= :radius`, { radius });
    }

    // City/Region Filter
    else if (user.city) {
      strategy = `Regional (${user.city})`;
      console.log(`[Location Feed] Strategy: ${strategy}`);
      query = query.where("post.city = :city", {city: user.city}).orWhere("author.city = :authorCity", { authorCity: user.city });
    }

    // Global Fallback 
    else {
      console.log(`[Location Feed] Strategy: ${strategy}`);
      // Sort by popularity if no location data exists
      query = query.orderBy("post.createdAt", "DESC"); 
    }

    const posts = await query.getMany();
    
    // Format output with computed counts
    const formattedPosts = posts.map(p => ({
      ...p,
      likesCount: p.likes?.length || 0,
      commentsCount: p.comments?.length || 0,
      isLikedByUser: p.likes?.some(l => l.user?.id === user.id) || false,
      discoveryStrategy: strategy
    }));

    console.log(`[Location Feed] Success - Found ${posts.length} reels using ${strategy} in ${Date.now() - startTime}ms`);

    return NextResponse.json({
      posts: formattedPosts,
      hasMore: formattedPosts.length === limit,
      meta: {
        strategy,
        userLocation: user.location || "Unknown",
        radius: user.lat ? `${radius}km` : null
      }
    });

  } catch (error: any) {
    console.error("[Location Feed] Critical failure:", error);
    return NextResponse.json({ 
      error: "Discovery node failed to process request.",
      details: error.message 
    }, { status: 500 });
  }
}

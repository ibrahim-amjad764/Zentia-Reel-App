// app/api/achievements/route.ts
import type { Repository } from "typeorm";
import { AppDataSource } from "../../../src/db/data-source";
import { cookies } from "next/headers";
import { initDB } from "../../../src/db/init-db";
import { User } from "../../../src/entities/user";
import admin from "../../../src/lib/firebase-admin";

// Achievement interface for type safety
interface AchievementData {
  title: string;
  description?: string;
  date?: string;
  createdAt?: string;
}

// Helper function to validate achievement input
function validateAchievementInput(data: unknown): data is AchievementData {
  if (!data || typeof data !== "object") return false;
  
  const achievement = data as any;
  
  // Required fields validation
  if (!achievement.title || typeof achievement.title !== "string") {
    console.log("[Achievement API] Missing or invalid title");
    return false;
  }
  
  // Optional fields validation
  if (achievement.description && typeof achievement.description !== "string") {
    console.log("[Achievement API] Invalid description type");
    return false;
  }
  
  if (achievement.date && !isValidDate(achievement.date)) {
    console.log("[Achievement API] Invalid date format");
    return false;
  }
  
  return true;
}

// Date validation helper
function isValidDate(date: unknown): boolean {
  if (typeof date !== "string") return false;
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

// Authenticate user based on Firebase token
async function getAuthUser(
  userRepo: Repository<User>
): Promise<User | null> {
  const tokenCookie = (await cookies()).get("auth-token");
  console.log("[Achievement API] Auth Token Cookie:", tokenCookie?.value ? "Present" : "Missing");

  if (!tokenCookie?.value) {
    console.log("[Achievement API] No auth token found");
    return null;
  }

  try {
    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(tokenCookie.value);

    if (!decoded.email) {
      console.log("[Achievement API] Token decoded but no email found");
      return null;
    }

    const user = await userRepo.findOneBy({ email: decoded.email });

    console.log("[Achievement API] User lookup:", user?.email || "Not found");
    return user ?? null;
  } catch (err) {
    console.error("[Achievement API] Error verifying Firebase token:", err);
    return null;
  }
}

// POST /api/achievements - Add achievement to user's achievements array (JSONB)
export async function POST(req: Request) {
  console.log("[Achievement API] POST request - Starting JSON synchronization");
  
  try {
    await initDB();

    if (!AppDataSource) {
      console.error("[Achievement API] Critical: DataSource not ready");
      return Response.json({ error: "Database not initialized" }, { status: 500 });
    }

    const userRepo = AppDataSource.getRepository(User);

    // Authenticate user
    const user = await getAuthUser(userRepo);
    if (!user) {
      console.log("[Achievement API] Auth Failure: No user found");
      return Response.json(
        { error: "Unauthorized - Please login to add achievements" },
        { status: 401 }
      );
    }

    // Parse and validate
    const body = await req.json();
    console.log("[Achievement API] Input received:", { title: body.title });

    if (!validateAchievementInput(body)) {
      console.log("[Achievement API] Error: Missing title");
      return Response.json(
        { error: "Invalid achievement data. Title is required." },
        { status: 400 }
      );
    }

    // Prepare achievement object for the JSON column
    const now = new Date();
    const newAchievementEntry = {
      title: body.title.trim(),
      description: body.description?.trim() || undefined,
      date: body.date || undefined,
      createdAt: now.toISOString()
    };

    // Ensure array initialization
    if (!user.achievements) user.achievements = [];

    // IMMUTABLE UPDATE: Update achievements array and save to DB
    // Using spread ensures TypeORM detects the change in the JSON field
    user.achievements = [...user.achievements, newAchievementEntry];

    console.log("[Achievement API] Saving user level update for:", user.email);
    const savedUser = await userRepo.save(user);

    console.log("[Achievement API] Success: User record updated with new accomplishment");

    return Response.json({
      success: true,
      achievement: newAchievementEntry,
      achievements: savedUser.achievements,
      message: "Achievement added successfully to your profile!"
    });

  } catch (err) {
    console.error("[Achievement API] Internal Error:", err);
    return Response.json({ 
      error: "Failed to add achievement", 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// GET /api/achievements - Fetch achievements for authenticated user
export async function GET(req: Request) {
  console.log("[Achievement API] GET request received");
  
  try {
    await initDB();

    // Defensive null check
    if (!AppDataSource) {
      console.error("[Achievement API] AppDataSource is null after initDB");
      return Response.json({ error: "Database not initialized" }, { status: 500 });
    }

    const userRepo = AppDataSource.getRepository(User);

    // Authenticate user
    const user = await getAuthUser(userRepo);
    if (!user) {
      console.log("[Achievement API] Unauthorized access");
      return Response.json(
        { error: "Unauthorized - Please login to view achievements" },
        { status: 401 }
      );
    }

    // Return user's achievements
    const achievements = user.achievements || [];

    console.log("[Achievement API] Achievements fetched:", {
      userId: user.id,
      count: achievements.length
    });

    return Response.json({
      success: true,
      achievements: achievements,
      count: achievements.length
    });

  } catch (err) {
    console.error("[Achievement API] GET Error:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error("[Achievement API] Error details:", {
      name: err instanceof Error ? err.name : 'Unknown',
      message: errorMessage,
      stack: err instanceof Error ? err.stack : 'No stack trace'
    });
    
    return Response.json({ 
      error: "Failed to fetch achievements", 
      details: errorMessage 
    }, { status: 500 });
  }
}

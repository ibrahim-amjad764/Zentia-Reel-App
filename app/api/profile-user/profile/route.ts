// app/api/profile-user/profile/route.ts (or the appropriate file path)
import { initDB } from "../../../../src/db/init-db";
import { AppDataSource } from "../../../../src/db/data-source";
import { User } from "../../../../src/entities/user";
import admin from "../../../../src/lib/firebase-admin";
import { cookies } from "next/headers";
import type { Repository } from "typeorm";

// Email Format validation function
function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Normalize Tags function
function normalizeTags(input: unknown): string[] | undefined {
  if (input == null) return undefined;

  if (Array.isArray(input)) {
    const cleaned = input
      .filter((v) => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean);

    return cleaned.length ? Array.from(new Set(cleaned)) : undefined; // remove duplicates
  }

  if (typeof input === "string") {
    const cleaned = input
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    return cleaned.length ? Array.from(new Set(cleaned)) : undefined;
  }

  return undefined; // explicit fallback for TS safety
}

// Helper function to check if the error is a Firebase error
function isFirebaseError(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}

// Authenticate user based on Firebase token and handle token expiry
async function getAuthUser(
  repo: Repository<User>
) {
  const tokenCookie = (await cookies()).get("auth-token");
  console.log("Auth Token Cookie:", tokenCookie?.value);

  if (!tokenCookie?.value) {
    console.log("[getAuthUser] No auth token found");
    return null;
  }

  try {
    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(tokenCookie.value);

    if (!decoded.email) {
      console.log("[getAuthUser] Token decoded but no email found");
      return null;
    }

    const user = await repo.findOneBy({ email: decoded.email });

    console.log("[getAuthUser] User lookup:", user?.email);
    return user ?? null;
  } catch (err) {
    console.error("Error verifying Firebase token:", err);

    if (isFirebaseError(err) && err.code === "auth/id-token-expired") {
      console.error("[getAuthUser] Firebase token expired");
    } else if (err instanceof Error) {
      console.error("Error details:", err.message);
    }

    return null;
  }
}

// GET /api/profile-user/profile
export async function GET() {
  try {
    await initDB();

    // Defensive null check (fix for TS: AppDataSource possibly null)
    if (!AppDataSource) {
      console.error("[Profile API] AppDataSource is null after initDB");
      return Response.json({ error: "Database not initialized" }, { status: 500 });
    }

    const repo = AppDataSource!.getRepository(User);

    const user = await getAuthUser(repo);

    if (!user) {
      console.log("Unauthorized access or User not found.");
      return Response.json(
        { message: "Unauthorized User or User not found" },
        { status: 401 }
      );
    }

    console.log("[Profile API] GET success:", user.email);
    return Response.json(user);

  } catch (err) {
    console.log("GET /api/profile-user/profile ERROR:", err);
    return Response.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}

// PUT /api/profile-user/profile
export async function PUT(req: Request) {
  try {
    await initDB();

    // Defensive null check (fix for TS)
    if (!AppDataSource) {
      console.error("[Profile API PUT] AppDataSource is null after initDB");
      return Response.json({ error: "Database not initialized" }, { status: 500 });
    }

    const repo = AppDataSource!.getRepository(User);
    const body = await req.json();
    const target = await getAuthUser(repo);

    if (!target) {
      console.log("Unauthorized user or user not found");
      return Response.json(
        { message: "Unauthorized or user not found" },
        { status: 401 }
      );
    }

    // Validate Email
    if (body.email != null && !isValidEmail(body.email)) {
      console.log("[Profile API PUT] Invalid email format:", body.email);
      return Response.json({ message: "Invalid email format" }, { status: 400 });
    }

    // Update user fields safely
    const update: Partial<User> = {
      firstName: typeof body?.firstName === "string" ? body.firstName.trim() : target.firstName,
      lastName: typeof body?.lastName === "string" ? body.lastName.trim() : target.lastName,
      email: typeof body?.email === "string" ? body.email.trim() : target.email,
      avatarUrl: typeof body?.avatarUrl === "string" ? body.avatarUrl.trim() : target.avatarUrl,
      bio: typeof body?.bio === "string" ? body.bio.trim() : target.bio,
      jobTitle: typeof body?.jobTitle === "string" ? body.jobTitle.trim() : target.jobTitle,
      company: typeof body?.company === "string" ? body.company.trim() : target.company,
      phone: typeof body?.phone === "string" ? body.phone.trim() : target.phone,
      location: typeof body?.location === "string" ? body.location.trim() : target.location,
      website: typeof body?.website === "string" ? body.website.trim() : target.website,
      github: typeof body?.github === "string" ? body.github.trim() : target.github,
      linkedin: typeof body?.linkedin === "string" ? body.linkedin.trim() : target.linkedin,
      twitter: typeof body?.twitter === "string" ? body.twitter.trim() : target.twitter,
      skills: normalizeTags(body?.skills) ?? target.skills,
      hobbies: normalizeTags(body?.hobbies) ?? target.hobbies,
    };

    Object.assign(target, update);

    const saved = await repo.save(target);

    console.log("[Profile API] PUT success:", saved.email);
    return Response.json(saved);

  } catch (err) {
    console.error("PUT /api/profile-user/profile ERROR:", err);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}
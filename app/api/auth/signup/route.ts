import { NextResponse } from "next/server";
import { initDB } from "../../../../src/db/init-db";
import { AppDataSource } from "../../../../src/db/data-source";
import { User } from "../../../../src/entities/user";
import admin from "../../../../src/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    console.log("Signup --- API --- Hit");

    // Ensure DB initialization (safe repeated call)
    await initDB();

    // Guard against possible null (fix for TS error)
    if (!AppDataSource) {
      console.error("AppDataSource is null after initDB");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Initialize only if not already initialized (prevents duplicate connections)
    if (!AppDataSource.isInitialized) {
      console.log("Initializing AppDataSource...");
      await AppDataSource.initialize();
    }

    // Create a guaranteed local reference (fixes 'possibly null')
    const dataSource = AppDataSource;

    const authHeader = req.headers.get("Authorization");

    // Validate Authorization header format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Authorization header missing or invalid");
      return NextResponse.json({ message: "Token Missing" }, { status: 401 });
    }

    const idToken = authHeader.split(" ")[1];

    if (!idToken) {
      console.log("Bearer token missing after split");
      return NextResponse.json({ message: "Token Missing" }, { status: 401 });
    }

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(idToken);

    console.log("Token Verified:", decoded.uid, "Email:", decoded.email);

    if (!decoded.email) {
      console.error("Decoded token does not contain email");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Use safe dataSource reference
    const repo = dataSource.getRepository(User);

    // Check if user already exists
    let user = await repo.findOneBy({ email: decoded.email });

    if (user) {
      console.log("User already exists in DB:", user.email);
      return NextResponse.json(user);
    }

    console.log("Creating new DB user...");

    // Parse first & last name safely (handles single-word names)
    const nameParts = decoded.name?.trim().split(" ") || [];
    const firstName = nameParts[0] || null;
    const lastName =
      nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

    user = repo.create({
      email: decoded.email,
      firebaseUid: decoded.uid,
      firstName,
      lastName,
      isActive: true,
      createdAt: new Date(),
    });

    console.log("User Object Before Save:", user);

    // Save new user
    await repo.save(user);
    console.log("User Saved in DB:", user.email);

    // Optional double-check (can be removed in production for performance)
    const savedUser = await repo.findOneBy({ email: user.email });
    console.log("Saved User from DB:", savedUser);

    return NextResponse.json(savedUser);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Signup Error:", message);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { initDB } from "../../../../src/db/init-db";
import { AppDataSource } from "../../../../src/db/data-source";
import { User } from "../../../../src/entities/user";
import admin from "../../../../src/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    console.log("Login --- API --- Hit");

    //  Ensure DB initialization (idempotent safe call)
    await initDB();

    //  Guard check — prevents TS "possibly null" error
    if (!AppDataSource) {
      console.error("AppDataSource is null after initDB");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    //  Initialize only if not already initialized (prevents multiple connections)
    if (!AppDataSource.isInitialized) {
      console.log("Initializing AppDataSource...");
      await AppDataSource.initialize();
    }

    //  Now we create a guaranteed local reference (fix for TS null warning)
    const dataSource = AppDataSource;

    const authHeader = req.headers.get("authorization");

    //  Validate Bearer token format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Missing or invalid Bearer token");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    //  Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    console.log("Decoded Firebase UID:", decodedToken.uid);

    if (!decodedToken.email) {
      console.error("Token does not contain email");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    //  Use safe local dataSource (fix applied here)
    const repo = dataSource.getRepository(User);

    //  Check existing user by email
    let user = await repo.findOneBy({ email: decodedToken.email });

    if (!user) {
      console.log("DB user not found. Creating new user...");

      user = repo.create({
        email: decodedToken.email,
        firebaseUid: decodedToken.uid,
        isActive: true,
        createdAt: new Date(),
      });

      await repo.save(user);
      console.log("New user created in DB:", user.email);
    } else {
      console.log("User already exists:", user.email);
    }

    //  Send only safe fields to client
    const safeUser = {
      id: user.id,
      email: user.email,
      firebaseUid: user.firebaseUid,
    };

    const response = NextResponse.json(safeUser);

    //  Secure HTTP-only cookie (production safe)
    response.cookies.set("auth-token", token, {
      httpOnly: true, // Prevent XSS access
      sameSite: "lax", // CSRF protection balance
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    console.log("Login successful for:", user.email);

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Login API Error:", message);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin from "../../../../src/lib/firebase-admin";

// POST - Refresh the auth-token cookie with a new token
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Missing token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    
    // Verify the new token is valid
    const decoded = await admin.auth().verifyIdToken(token);
    if (!decoded.email) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Update the cookie with the new token
    const response = NextResponse.json({ success: true });
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1 hour (matches Firebase token expiry)
    });

    console.log("[Token Refresh] Cookie updated for:", decoded.email);
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Token Refresh] Error:", message);
    return NextResponse.json({ message: "Token refresh failed" }, { status: 401 });
  }
}
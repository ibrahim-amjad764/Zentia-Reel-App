// //api/auth/login/route
// import { NextRequest, NextResponse } from "next/server";
// import { initDB } from "@/db/init-db";
// import { AppDataSource } from "@/db/data-source";
// import { User } from "@/entities/user";
// import admin from "@/lib/firebase-admin";


// // POST
// export async function POST(req: NextRequest) {
//   try {
//     console.log("Login --- API --- Hit");
//     await initDB();
//     if (!AppDataSource.isInitialized) await AppDataSource.initialize();

//     // Check if headers exist and authorization header is present
//     const authHeader = req.headers.get("authorization"); // Use .get() for NextRequest headers
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       console.log("Missing Bearer token");
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const token = authHeader.split(" ")[1];  // Get the token part from Bearer token
//     // verification of token
//     const decodeToken = await admin.auth().verifyIdToken(token);
//     console.log("Decoded Token:", decodeToken);
//     console.log("Token verified:", decodeToken.uid);
//     const repo = AppDataSource.getRepository(User);
//     // find DB user
//     const user = await repo.findOneBy({ email: decodeToken.email! });
//     if (!user) {
//       console.log("DB user not found");
//       return NextResponse.json({ message: "User not found in DB" }, { status: 404 });
//     }
//     console.log("Returning DB user:", user.email);
//     // create SAFE user object (plain JSON)
//     const safeUser = {
//       id: user.id,
//       email: user.email,
//     };

//     const response = NextResponse.json(safeUser);
//     // set cookie on response
//     response.cookies.set("auth-token", token, {
//       httpOnly: true, // JS/browser se access nahi → secure
//       sameSite: "lax",  // CSRF attacks se bachao (Lax is safe for normal logins)
//       secure: process.env.NODE_ENV === "production", // sirf HTTPS in prod
//       path: "/", // poori website ke liye
//       maxAge: 60 * 60 * 24,  // cookie expire in 24 hours
//     });
//     console.log("Status:", response.status);
//     console.log("Headers:", response.headers.get("content-type"));
//     return response;
//   } catch (err: any) {
//     console.error("Login API Error:", err.message || err);
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }
// }


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
  } catch (err: any) {
    console.error("Login API Error:", err?.message || err);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
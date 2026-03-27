// import { initDB } from "@/db/init-db";
// import { AppDataSource } from "@/db/data-source";
// import { User } from "@/entities/user";

// export const runtime = "nodejs"; //nodejs environment
// //GET fetch users
// export async function GET() {
//   console.log("GET /api/users called");

//   await initDB();
//   console.log("Database initialized");

//   const repo = AppDataSource.getRepository(User);
//   const users = await repo.find();

//   console.log("Users fetched:", users);
//   return Response.json(users);
// }
// //POST
// export async function POST(req: Request) {
//   console.log("POST /api/users called");

//   await initDB();

//   const body = await req.json();
//   console.log("Request body:", body);

//   const repo = AppDataSource.getRepository(User);

//   const user = repo.create({
//     firstName: body.firstName ?? "Usman",
//     lastName: body.lastName ?? "Ali",
//     email: body.email ?? "Usman123@gmail.com",
//     isActive: false,
//   });

//   const saved = await repo.save(user);
//   console.log("User saved:", saved);

//   return Response.json(saved, { status: 201 });
// }

// api/users/route.ts (get users API)
import { initDB } from "../../../src/db/init-db";
import { AppDataSource } from "../../../src/db/data-source";
import { User } from "../../../src/entities/user";

export const runtime = "nodejs";

// GET all users with optional pagination
// GET /api/users
export async function GET() {
  try {
    // Initialize the database
    await initDB();

    // Make sure AppDataSource exists
    if (!AppDataSource) {
      throw new Error("Database not initialized");
    }

    // Get the repository
    const repo = AppDataSource.getRepository(User);

    // Fetch all users
    const users = await repo.find();

    // Log number of users (optional)
    console.log(`[GET /api/users] Users fetched:`, users.length);

    // Return all users as JSON
    return Response.json(users);
  } catch (err) {
    console.error("[GET /api/users ERROR]", err);
    return Response.json({ error: "Fetch failed" }, { status: 500 });
  }
}
// POST to create a user
export async function POST(req: Request) {
  try {
    await initDB();

    const body = await req.json();

    if (!body.email || !body.firstName || !body.lastName) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const repo = AppDataSource!.getRepository(User);
    const user = repo.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      avatarUrl: body.avatarUrl ?? null,
      bio: body.bio ?? null,
      jobTitle: body.jobTitle ?? null,
      company: body.company ?? null,
      phone: body.phone ?? null,
      location: body.location ?? null,
      website: body.website ?? null,
      github: body.github ?? null,
      linkedin: body.linkedin ?? null,
      twitter: body.twitter ?? null,
      skills: body.skills ?? [],
      hobbies: body.hobbies ?? [],
      isActive: body.isActive ?? true,
      firebaseUid: body.firebaseUid ?? null,
    });

    const saved = await repo.save(user);
    console.log("[POST /api/users] User created:", saved.id);

    return Response.json(saved, { status: 201 });
  } catch (err) {
    console.error("[POST /api/users ERROR]", err);
    return Response.json({ error: "User creation failed" }, { status: 500 });
  }
}
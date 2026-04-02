// src/db/data-source.ts
import { DataSource } from "typeorm";
import "pg"; // Explicitly import PostgreSQL driver
import { User } from "@entities/user";
import { Post } from "@entities/post";
import { Like } from "@entities/like";
import { Comment } from "@entities/comment";
import { Follow } from "@entities/follow";
import { Notification } from "@entities/notification";

//  AppDataSource will only exist server-side
let AppDataSource: DataSource | null = null;

// Only initialize when running in Node.js
if (typeof window === "undefined") {
  // Load environment variables from local file (safe on server)
  import("dotenv").then(dotenv => dotenv.config({ path: ".env.local" }));

  // Check critical DB environment variables
  const requiredVars = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  const missingVars = requiredVars.filter(v => !process.env[v]);

  if (missingVars.length) {
    console.error(`[data-source] Missing environment variables: ${missingVars.join(", ")}`);
    console.error("[data-source] Critical environment variables are missing. Exiting...");
    process.exit(1); // Safe: Node.js only
  }

  // Initialize TypeORM DataSource
  AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    synchronize: false, // ❌ Never use true in production; use migrations
    logging: process.env.NODE_ENV === "development", // Only log in dev
    entities: [User, Post, Like, Comment, Follow, Notification],
    migrations: [__dirname + "/../migrations/*.ts"],
    subscribers: [__dirname + "/../subscribers/*.ts"],
  });

  // Initialize and log errors if any
  AppDataSource.initialize()
    .then(() => console.log("[data-source] DataSource initialized successfully"))
    .catch(err => console.error("[data-source] DataSource initialization failed:", err));
} else if (process.env.NODE_ENV === "development") {
  // Dev-only browser log
  // console.log("[data-source] Skipped DataSource initialization in browser (development mode)");
}

export { AppDataSource };
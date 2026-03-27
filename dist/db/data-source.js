// import { DataSource } from "typeorm";
// import { User } from "../entities/user";
// import { Post } from "../entities/post";
// import { Like } from "../entities/like";
// import { Comment } from "../entities/comment";
// import { config } from "dotenv";
// // Load environment variables from .env.local file
// config({ path: '.env.local' });
// console.log("[data-source] Checking env vars...");
// console.log("[data-source] DB_HOST:", process.env.DB_HOST);
// console.log("[data-source] All env keys:", Object.keys(process.env).filter(k => k.startsWith('DB')));
// if (!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
//   console.error("[data-source] Missing environment variables!");
//   console.error("[data-source] DB_HOST:", process.env.DB_HOST);
//   console.error("[data-source] DB_PORT:", process.env.DB_PORT);
//   console.error("[data-source] DB_USER:", process.env.DB_USER);
//   console.error("[data-source] DB_PASSWORD:", process.env.DB_PASSWORD);
//   console.error("[data-source] DB_NAME:", process.env.DB_NAME);
//   // Don't throw error - just log and continue
//   // The actual database connection will fail later if vars are missing
// }
// export const AppDataSource = new DataSource({
//   type: "postgres",
//   host: process.env.DB_HOST || "localhost",
//   port: Number(process.env.DB_PORT) || 5432,
//   username: process.env.DB_USER || "postgres",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME || "postgres",
//   synchronize: true,
//   logging: true,
//   entities: [User, Post, Like, Comment],
//   migrations: [__dirname + "/../migrations/*.ts"],
//   subscribers: [__dirname + "/../subscribers/*.ts"],
// });
// data-source.ts
// src/db/data-source.ts
// src/db/data-source.ts
import { DataSource } from "typeorm";
import { User } from "../entities/user";
import { Post } from "../entities/post";
import { Like } from "../entities/like";
import { Comment } from "../entities/comment";
let AppDataSource = null;
// ✅ Only initialize in Node.js (server)
if (typeof window === "undefined") {
    // Load environment variables
    require("dotenv").config({ path: ".env.local" });
    const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingVars = requiredVars.filter(v => !process.env[v]);
    if (missingVars.length) {
        console.error(`[data-source] Missing environment variables: ${missingVars.join(", ")}`);
        console.error("[data-source] Critical environment variables are missing. Exiting...");
        process.exit(1); // Safe because we are server-side
    }
    AppDataSource = new DataSource({
        type: "postgres",
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "postgres",
        synchronize: false, // Keep this false for production, we use migrations
        logging: true,
        entities: [User, Post, Like, Comment],
        migrations: [__dirname + "/../migrations/*.ts"], // Ensure path is correct here
        subscribers: [__dirname + "/../subscribers/*.ts"],
    });
    console.log("[data-source] DataSource initialized on server.");
}
else {
    console.warn("[data-source] Skipped DataSource initialization in browser.");
}
export { AppDataSource };

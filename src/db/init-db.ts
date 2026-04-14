// src/db/init-db.ts
import { AppDataSource } from "./data-source";
import { Notification } from "@/entities/notification";

export async function initDB() {
  try {
    if (!AppDataSource) {
      console.error("[init-db] AppDataSource is null. Check data-source.ts!");
      throw new Error("AppDataSource is null");
    }

    if (!AppDataSource.isInitialized) {
      console.log("[init-db] Initializing database...");
      await AppDataSource.initialize();
      console.log("[init-db] Database connected successfully");

      const notificationRepo = AppDataSource.getRepository(Notification);
      console.log("[init-db] Notifications table is ready");

      console.log("[init-db] Checking/creating indexes...");
        await AppDataSource.query(`
          DO $$ 
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comments_user' AND tablename = 'comments') THEN
              CREATE INDEX idx_comments_user ON comments ("postId", "userId");
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_likes_user' AND tablename = 'likes') THEN
              CREATE INDEX idx_likes_user ON likes ("postId", "userId");
            END IF;
          END $$;
        `);
      console.log("[init-db] Indexes checked/created successfully");
    } else {
      console.log("[init-db] Database already initialized, skipping");
    }
  } catch (error: any) {
    console.error("[init-db] Database initialization error:", error.stack || error);
    throw error; // Let the API route handle it
  }
}
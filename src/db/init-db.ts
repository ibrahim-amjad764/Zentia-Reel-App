// src/db/init-db.ts
// import { AppDataSource } from "./data-source";

// export async function initDB() {
//     try {
//         if (!AppDataSource.isInitialized) {
//             await AppDataSource.initialize();
//             console.log("[init-db] Database connected successfully");

//             // Create indexes if they don't exist
//             await AppDataSource.query(`
//                 DO $$ 
//                 BEGIN
//                     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comments_user' AND tablename = 'comments') THEN
//                         CREATE INDEX idx_comments_user ON comments ("postId", "userId");
//                     END IF;

//                     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_likes_user' AND tablename = 'likes') THEN
//                         CREATE INDEX idx_likes_user ON likes ("postId", "userId");
//                     END IF;
//                 END $$;
//             `);
//         }
//     } catch (error) {
//         console.error('[init-db] Database initialization error:', error);
//         throw error;
//     }
// }


import { AppDataSource } from "./data-source";
import { Notification } from "@/entities/notification";

export async function initDB() {
  try {
    // Initialize the database if not already
    if (!AppDataSource!.isInitialized) {
      await AppDataSource!.initialize();
      console.log("[init-db] Database connected successfully");

      //  Synchronize notifications table (already handled by synchronize:true)
      const notificationRepo = AppDataSource!.getRepository(Notification);
      console.log("[init-db] Notifications table is ready");

      // Create indexes if they don't exist to optimize query performance
      await AppDataSource!.query(`
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
      console.log("[init-db] Database already initialized");
    }
  } catch (error) {
    console.error("[init-db] Database initialization error:", error);
    throw error;
  }
}
import { AppDataSource } from "../db/data-source";
import { Notification } from "../entities/notification"; 
import { NextRequest } from "next/server";
import { initDB } from "../db/init-db";
import { User } from "../entities/user";
import admin from "./firebase-admin";
/**
 * Get authenticated user from Firebase cookie
 * Used by all protected API routes
 */
export async function getCurrentUser(req: NextRequest) {
  try {
    console.log("AUTH --- getCurrentUser called");

    const token = req.cookies.get("auth-token")?.value;

    console.log("AUTH --- Cookie token:", token ? "FOUND" : "MISSING");

    if (!token) {
      console.log("AUTH --- No auth-token cookie");
      return null;
    }

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    console.log("AUTH --- Firebase UID:", decoded.uid);

    if (!decoded.email) {
      console.log("AUTH --- No email in token");
      return null;
    }

    // Ensure DB ready
    await initDB();

    if (!AppDataSource || !AppDataSource.isInitialized) {
      console.log("AUTH --- Initializing DataSource...");
      await AppDataSource!.initialize();
    }

    const repo = AppDataSource!.getRepository(User);

    const user = await repo.findOne({
      where: { email: decoded.email },
    });

    if (!user) {
      console.log("AUTH --- User not found in DB");
      return null;
    }

    console.log("AUTH --- Authenticated user:", user.id);

    return user;
  } catch (error) {
    console.error("AUTH --- Error verifying user:", error);
    return null;
  }
}

/**
 * Fetch unread notifications count for a given user
 * Separate function so it does not interfere with auth
 */
export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  try {
    if (!userId) return 0;

    await initDB();
    if (!AppDataSource?.isInitialized) {
      console.log("[NOTIF] --- Initializing DataSource...");
      await AppDataSource!.initialize();
    }

    const notifRepo = AppDataSource!.getRepository(Notification);
    const unreadCount = await notifRepo.count({
      where: { recipient: { id: userId }, read: false },
    });

    console.log("[NOTIF] --- Unread notifications count:", unreadCount);
    return unreadCount;
  } catch (error) {
    console.error("[NOTIF] --- Error fetching notifications count:", error);
    return 0; // fail gracefully
  }
}
// //firebase-admin.ts

import admin from "firebase-admin";

/**
 * Global cache to prevent re-initialization in dev (Next.js hot reload fix)
 */
const globalForFirebase = global as unknown as {
  firebaseAdmin?: admin.app.App;
};

function initializeFirebaseAdmin(): admin.app.App {
  // ✅ Reuse existing instance (IMPORTANT for Next.js)
  if (globalForFirebase.firebaseAdmin) {
    console.log("[Firebase Admin] Reusing existing instance");
    return globalForFirebase.firebaseAdmin;
  }

  if (admin.apps.length > 0) {
    console.log("[Firebase Admin] Using existing admin.apps instance");
    globalForFirebase.firebaseAdmin = admin.app();
    return globalForFirebase.firebaseAdmin;
  }

  try {
    console.log("[Firebase Admin] Initializing new instance...");

    const {
      FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY,
    } = process.env;

    // ✅ Strong validation (fail fast)
    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
      console.error("[Firebase Admin] Missing environment variables");
      throw new Error("Firebase Admin env variables are not properly configured");
    }

    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });

    globalForFirebase.firebaseAdmin = app;

    console.log("[Firebase Admin] Initialized successfully");

    return app;
  } catch (error) {
    console.error("[Firebase Admin] Initialization failed:", error);
    throw error;
  }
}

// ✅ Initialize once
const firebaseAdminApp = initializeFirebaseAdmin();

export default admin;
export { firebaseAdminApp };

















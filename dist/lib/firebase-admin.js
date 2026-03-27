// //firebase-admin.ts
// // Lazy initialization pattern for Firebase Admin SDK
// import admin from "firebase-admin";
// // Store initialized state privately
// let _isInitialized = false;
// // Function to properly format the private key
// function formatPrivateKey(key: string | undefined): string {
//   // Validate key exists first
//   if (!key || key.trim() === "") {
//     throw new Error("FIREBASE_PRIVATE_KEY is not defined or empty in environment variables");
//   }
//   // Log first few chars for debugging (truncated for security)
//   console.log("Processing Private Key...");
//   console.log("Raw key starts with:", key.substring(0, Math.min(30, key.length)));
//   // First replace escaped newlines (\n) with actual newlines
//   let formattedKey = key.replace(/\\n/g, '\n');
//   // Also replace \r\n with \n for Windows line endings
//   formattedKey = formattedKey.replace(/\r\n/g, '\n');
//   // Check if PEM headers exist; add them if missing
//   if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
//     console.warn("PEM header missing, adding default headers...");
//     // The key appears to be raw base64, wrap it in PEM format
//     formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
//   }
//   // Verify the key can be parsed
//   if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----') || 
//       !formattedKey.includes('-----END PRIVATE KEY-----')) {
//     console.error("Private key format is invalid after processing");
//     throw new Error("Invalid private key format - missing PEM headers");
//   }
//   return formattedKey;
// }
// // Function to initialize Firebase Admin SDK
// function initializeFirebaseAdmin(): void {
//   if (_isInitialized) return;
//   if (!admin.apps.length) {
//     try {
//       // Validate required environment variables
//       const projectId = process.env.FIREBASE_PROJECT_ID;
//       const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
//       const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
//       if (!projectId) {
//         throw new Error("FIREBASE_PROJECT_ID is not defined in environment variables");
//       }
//       if (!clientEmail) {
//         throw new Error("FIREBASE_CLIENT_EMAIL is not defined in environment variables");
//       }
//       admin.initializeApp({
//         credential: admin.credential.cert({
//           projectId: projectId,
//           clientEmail: clientEmail,
//           privateKey: privateKey,
//         })
//       });
//       _isInitialized = true;
//       console.log("Firebase Admin SDK initialized successfully");
//     } catch (error) {
//       console.error("Failed to initialize Firebase Admin SDK:", error);
//       throw error;
//     }
//   }
// }
// export default admin; 
import admin from "firebase-admin";
import path from "path";
import fs from "fs";
let _isInitialized = false;
function initializeFirebaseAdmin() {
    if (_isInitialized)
        return;
    if (!admin.apps.length) {
        try {
            // Absolute path (recommended for Next.js)
            const serviceAccountPath = path.join(process.cwd(), "src/lib/serviceAccountKey.json");
            // ✅ Path check karne ke liye
            console.log("Service Account Path:", serviceAccountPath);
            // ✅ JSON file read karo
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
            // ✅ Initialize Firebase
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            _isInitialized = true;
            console.log("Firebase Admin SDK initialized successfully");
        }
        catch (error) {
            console.error("Failed to initialize Firebase Admin SDK:", error);
            throw error;
        }
    }
}
initializeFirebaseAdmin();
export default admin;

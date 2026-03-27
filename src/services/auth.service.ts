import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "@/src/lib/firebase"
import { signOut } from "firebase/auth";
import { getAuth } from "firebase/auth"
import { app } from "@/lib/firebase"

// Function to get or refresh the Firebase token
export const getFirebaseToken = async () => {
  const auth = getAuth(app);
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error("User not logged in");
  }

  try {
    // Get a fresh token if the token is expired
    const token = await currentUser.getIdToken(true);  // 'true' forces refresh
    console.log("Firebase Token refreshed:", token?.slice(0, 10), "...");
    return token;
  } catch (error) {
    console.error("Error fetching Firebase token:", error);
    throw error;
  }
};

// Refresh token and update the auth-token cookie
export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const token = await getFirebaseToken();
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.error("Failed to refresh auth cookie");
      return false;
    }
    console.log("Auth cookie refreshed successfully");
    return true;
  } catch (error) {
    console.error("Error refreshing auth token:", error);
    return false;
  }
};

// Wrapper for fetch that auto-refreshes token on 401
export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let res = await fetch(url, options);
  
  // If 401 (Unauthorized), try refreshing token and retry once
  if (res.status === 401) {
    console.log("Got 401, attempting token refresh...");
    const refreshed = await refreshAuthToken();
    if (refreshed) {
      // Retry the original request
      res = await fetch(url, options);
    }
  }
  
  // Check if response is HTML (indicating a redirect to login page)
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("text/html")) {
    console.error("authFetch received HTML instead of JSON - likely unauthenticated");
    // Create a proper JSON error response
    return new Response(JSON.stringify({ error: "Unauthorized - Please log in" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  return res;
};

// Sign UP
export async function signUp(email: string, password: string) {
  console.log("Sign-Up Start");
  //  firebase cred object return user info & provide token method
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  console.log("FireBase User Created:", cred.user.uid);

  const idToken = await cred.user.getIdToken(true);
  console.log("Token Issued");
  console.log("Token Recived:", idToken?.slice(0, 20));

  const res = await fetch("/api/auth/signup", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  })

  if (!res.ok) {
    const msg = await res.text();
    console.error("Backend DB Creation Failed:", msg);
    throw new Error("Signup DB Sync Failed");
  }
  return await res.json();
}

// Sign IN
export async function signIn(email: string, password: string) {
  console.log("Sign-IN Start", email);

  if (!email || !password) {
    console.error("Email or Password Missing");
    throw new Error("Email and Password are required");
  }
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    console.log("FireBase Login:", credential.user.uid);

    const token = await credential.user.getIdToken(true);
    console.log("Token Fetched:", token?.slice(0, 20), "...");

    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const text = await res.text();
      console.error("Backend Auth Failed:", text);
      throw new Error("Bakend Authentication Failed");
    }

    const normalizeUser = (user: any) => ({
      ...user,
      displayName:
        user.firstName || user.lastName
          ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() // prefer real names
          : user.email.split("@")[0], // fallback to email username
    });

    const user = await res.json();
    console.log("DB User Fetched:", user);

    return normalizeUser(user);

  } catch (err: any) {
    if (err.code) {
      switch (err.code) {
        case "auth/invalid-email":
          console.error("Invalid Email Format");
          break;
        case "auth/user-not-found":
          console.error("User Not Found");
          break;
        case "auth/wrong-password":
          console.error("Wrong Password");
          break;
        default:
          console.error("Firebase Error:", err.code, err.message);
      }
    } else {
      console.error("Sign-In ERROR:", err.message || err);
    }
    throw err;
  }
}
// Logout

const auth = getAuth(app)
export const logout = async () => {
  try {
    //  Sign out from Firebase client
    await signOut(auth)

    //  Call server API to delete cookie
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include", // important so cookie is sent
    })

    console.log("Logout successful")
  } catch (error) {
    console.error("Logout failed:", error)
    throw error
  }
}
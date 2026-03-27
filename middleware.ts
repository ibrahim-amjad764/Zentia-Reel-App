// 

// Purpose: Protect routes using HttpOnly cookie
// // Runtime: Edge (CDN fast execution)

// import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get("auth-token")?.value
//   const { pathname } = request.nextUrl

//   // Block unauthenticated users
//   if (!token && pathname.startsWith("/feed")) {
//     return NextResponse.redirect(new URL("/auth/login", request.url))
//   }

//   // Prevent logged-in users from seeing auth pages
//   if (token && pathname.startsWith("/auth")) {
//     return NextResponse.redirect(new URL("/feed", request.url))
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ["/feed/:path*", "/auth/:path*"],
// }


// Purpose: Protect routes using HttpOnly cookie
// Runtime: Edge (CDN fast execution)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  console.log("Request Path:", pathname);  // Log the current requested path
  console.log("Token from cookie:", token); // Log the token value

  // Block unauthenticated users from accessing protected routes
  if (!token && pathname.startsWith("/feed")) {
    console.log("Unauthenticated access attempt on /feed - redirecting to login"); // Log unauthenticated access
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Block unauthenticated users from accessing profile pages
  if (!token && pathname.startsWith("/profile")) {
    console.log("Unauthenticated access attempt on /profile - redirecting to login"); // Log unauthenticated access
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect logged-in users from auth pages
  const authPages = ["/auth/login", "/auth/sign-up", "/auth/forgot-password"];
  if (token && pathname.startsWith("/auth")) {
    console.log("Authenticated user trying to access /auth - redirecting to feed"); // Log authenticated access to auth pages
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  // Allow guests to see login, signup, and forgot-password pages
  if (!token && authPages.some(page => pathname.startsWith(page))) {
    console.log("Guest accessing auth page, allowed");
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/feed/:path*", "/profile/:path*", "/auth/:path*"],
};

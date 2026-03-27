"use client";

import "./globals.css";
import { ReactQueryProvider } from "../src/providers/ReactQueryProvider";
import { Toaster } from "sonner"
import { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Set currentUserId on window for components that need it
  useEffect(() => {
    // Try to get userId from multiple sources
    const getUserId = () => {
      // Try to get from localStorage first
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          return user.id;
        } catch (e) {
          console.log('[Layout] Failed to parse stored user');
        }
      }
      
      // Try to get from sessionStorage
      const sessionUser = sessionStorage.getItem('currentUser');
      if (sessionUser) {
        try {
          const user = JSON.parse(sessionUser);
          return user.id;
        } catch (e) {
          console.log('[Layout] Failed to parse session user');
        }
      }
      return null;
    };

    const userId = getUserId();
    if (userId) {
      (window as any).currentUserId = userId;
      console.log('[Layout] Set currentUserId on window:', userId);
    } else {
      console.log('[Layout] No userId found in storage');
    }
  }, []);

  return (
    <html lang="en">
      <body className="min-h-screen antialiased text-black dark:text-white">
        <ReactQueryProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ReactQueryProvider>
      </body>
    </html>
  );
}

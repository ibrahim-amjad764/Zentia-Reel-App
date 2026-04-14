"use client";

import "./globals.css";

import { ReactQueryProvider } from "../src/providers/ReactQueryProvider";
import { Toaster } from "sonner"
import { useEffect } from "react";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { useStore } from "../src/store/useStore";

declare global {
  interface Window {
    currentUserId?: string;
  }
}

const fontSans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrateTheme = useStore((s) => s.hydrateTheme);

  // PURPOSE: Enforce persisted theme on first mount (no system preference).
  useEffect(() => {
    console.log("[System] Zentia Reel App - Initializing Modern UI Layer");
    console.log("[Layout] Hydrating persisted UI mode");
    hydrateTheme();
  }, [hydrateTheme]);

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
        } catch {
          console.log('[Layout] Failed to parse stored user');
        }
      }
      
      // Try to get from sessionStorage
      const sessionUser = sessionStorage.getItem('currentUser');
      if (sessionUser) {
        try {
          const user = JSON.parse(sessionUser);
          return user.id;
        } catch {
          console.log('[Layout] Failed to parse session user');
        }
      }
      return null;
    };

    const userId = getUserId();
    if (userId) {
      window.currentUserId = String(userId);
      console.log('[Layout] Set currentUserId on window:', userId);
    } else {
      console.log('[Layout] No userId found in storage');
    }
  }, []);

  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`}>
      <body className="min-h-screen antialiased bg-app">
        <ReactQueryProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ReactQueryProvider>
      </body>
    </html>
  );
}

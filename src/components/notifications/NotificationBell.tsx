"use client";

import { useEffect, useState, useRef } from "react";
import { connectNotificationSocket } from "../../lib/notificationSocket";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationDropdown } from "./NotificationDropdown";
import { useNotificationStore } from "../../store/notificationStore";
import { Bell, Sparkles } from "lucide-react";
import api from "../../lib/api";

export function NotificationBell() {
  const { unreadCount, setNotifications, setCurrentUserId } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousUnreadRef = useRef(unreadCount);
    const [shake, setShake] = useState(false); // Premium shake animation for bell

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        if (res?.data?.notifications) setNotifications(res.data.notifications);
        if (res?.data?.userId) {
          setCurrentUserId(res.data.userId);
          connectNotificationSocket(res.data.userId);
        }
      } catch (err) {
        console.error("[NotificationBell] Initialization failed:", err);
      }
    };
    checkNotifications();

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }, 15000);

    return () => clearInterval(interval);
  }, [setNotifications, setCurrentUserId]);

  useEffect(() => {
    if (unreadCount > previousUnreadRef.current) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 3000);
    }
    previousUnreadRef.current = unreadCount;
  }, [unreadCount]);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full transition-all duration-300 group"
        aria-label="Notifications"
      >
        <Bell 
          className={`h-6 w-6 transition-colors duration-500 ${
            open ? "text-[#FF7E5F]" : "text-foreground/70 group-hover:text-[#FF7E5F]"
           }${isAnimating ? "animate-bounce" : ""}`}
        />

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-1 right-1 min-w-[18px] h-4.5 flex items-center justify-center bg-gradient-to-tr from-[#FF7E5F] via-[#FFA366] to-[#FEB47B] text-black text-[10px] font-black rounded-full px-1 border border-black/10 shadow-[0_2px_10px_rgba(255,126,95,0.4)]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Halo Glow for Active State */}
        {open && (
          <motion.div 
            layoutId="bellGlow"
            className="absolute inset-0 bg-[#FF7E5F]/10 blur-md rounded-full -z-10" 
          />
        )}
      </motion.button>

      {/* BACKDROP OVERLAY */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/5 dark:bg-black/20"
              onClick={() => setOpen(false)}
            />
            <div className="z-50 relative">
              <NotificationDropdown onClose={() => setOpen(false)} />
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
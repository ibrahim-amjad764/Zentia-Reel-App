// src/components/notifications/NotificationDropdown.tsx

"use client";
import { NotificationItem } from "./NotificationItem";
import { useNotificationStore, Notification as StoreNotification } from "../../store/notificationStore";
import api from "../../lib/api";
import { useEffect, useState } from "react";
import { Bell, X, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationAPI {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  postId?: string;
  sender?: { id: string; firstName: string; lastName: string } | null;
}

interface Props {
  onClose: () => void;
}

const normalizeNotification = (n: Partial<NotificationAPI>): StoreNotification | null => {
  if (!n?.id || !n?.type) return null;

  const createdAt =
    n.createdAt && !Number.isNaN(new Date(n.createdAt).getTime())
      ? n.createdAt
      : new Date().toISOString();

  return {
    id: String(n.id),
    type: String(n.type),
    message: n.message || "New activity detected",
    read: Boolean(n.read),
    createdAt,
    postId: n.postId,
    sender: n.sender ?? undefined,
  };
};

export function NotificationDropdown({ onClose }: Props) {
  const { notifications, setNotifications, markAsRead, currentUserId } = useNotificationStore();
  const [wsStatus, setWsStatus] = useState<"connected" | "disconnected">("disconnected");

  useEffect(() => {
    let isMounted = true;
    const socket = (globalThis as any).__notificationSocket as WebSocket | undefined;
    setWsStatus(currentUserId && socket?.readyState === WebSocket.OPEN ? "connected" : "disconnected");

    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        if (!isMounted) return;

        const newData: StoreNotification[] = (res.data.notifications || [])
          .map((n: NotificationAPI) => normalizeNotification(n))
          .filter(Boolean) as StoreNotification[];

        console.log("[Notifications] Premium fetch complete:", newData.length);
        setNotifications(newData);
      } catch (err: any) {
        console.error("[Notifications] Luxury fetch failed:", err);
      }
    };
    fetchNotifications();

    return () => {
      isMounted = false;
      console.log("[Notifications] Closing secure socket view");
    };
  }, [currentUserId, setNotifications]); 

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="fixed inset-x-4 top-[80px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-4 sm:w-[420px] bg-white/90 dark:bg-[#050505]/95 backdrop-blur-3xl border border-[#FF7E5F]/20 rounded-3xl overflow-hidden z-50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
    >
      {/* LUXURY HEADER */}
      <div className="px-6 py-5 flex items-center justify-between bg-gradient-to-b from-[#FF7E5F]/5 to-transparent border-b border-[#FF7E5F]/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#FF7E5F]/10 text-[#FF7E5F]">
            <Bell size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground leading-tight">
              Activity Hub
            </h2>
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] ${
                wsStatus === "connected" ? "text-[#FFC67D]" : "text-[#FFA07A]"
              }`}>
                <span className={wsStatus === "connected" ? "w-2 h-2 bg-[#FFC67D] rounded-full" : ""}>●</span>
                {wsStatus === "connected" ? "Live Stream" : "Queued"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all text-foreground/40 hover:text-foreground"
        >
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#FF7E5F] blur-2xl opacity-10 rounded-full"></div>
              <Sparkles size={48} className="text-[#bf953f]/30 relative" />
            </div>
            <p className="text-base font-bold text-foreground opacity-80">Primal Peace</p>
            <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">Your personal universe is currently silent and serene.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#FF7E5F]/5">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`group relative px-6 py-5 flex gap-4 items-start transition-all duration-500
                ${!n.read ? "bg-[#FF7E5F]/[0.03]" : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"}
                `}
              >
                {!n.read && (
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF7E5F] rounded-r-full shadow-[0_0_10px_rgba(255,126,95,0.5)]"></div>
                )}

                <div className="shrink-0 relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1a1a1a] to-[#333] border border-[#FF7E5F]/20 flex items-center justify-center text-[#FF7E5F] font-bold text-base shadow-lg">
                    {n.sender?.firstName?.[0] || <Sparkles size={16} />}
                  </div>
                  {!n.read && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF7E5F] border-2 border-white dark:border-[#050505] rounded-full shadow-gold"></span>
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    <span className="font-bold opacity-100">{n.sender?.firstName || "A member"}</span> {n.message.replace(n.sender?.firstName || "", "").trim()}
                  </p>
                  <div className="flex items-center gap-3 mt-2.5">
                    <span className="text-[10px] text-muted-foreground/60 font-medium">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#FF7E5F]/30"></span>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#FF7E5F]/10 text-[#FEB47B] border border-[#FF7E5F]/10">
                      {n.type}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    console.log("[Notifications] Archiving luxury notice:", n.id);
                    markAsRead(n.id);
                  }}
                  className={`mt-1 transition-all duration-300 p-2 rounded-full ${n.read ? 'text-muted-foreground/20 hover:text-[#FF7E5F]' : 'text-[#FF7E5F] hover:bg-[#FF7E5F]/10'}`}
                  title="Mark as handled"
                >
                  <CheckCircle2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-4 bg-gradient-to-t from-[#FF7E5F]/5 to-transparent border-t border-[#FF7E5F]/10">
        <button
          className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-[0.3em] text-[#FEB47B] hover:text-[#FF7E5F] transition-all duration-500 overflow-hidden relative group"
          onClick={() => console.log("[Notifications] Expanding reach")}
        >
          <span className="relative z-10">Expand Experience</span>
          <div className="absolute inset-0 bg-[#FF7E5F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        </button>
      </div>
    </motion.div>
  );
}

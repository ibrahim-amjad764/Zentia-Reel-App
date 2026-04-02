// //src/components/notifications/NotificationDropdown.tsx

// "use client";
import { NotificationItem } from "./NotificationItem";
import { useNotificationStore, Notification as StoreNotification } from "../../store/notificationStore";
import api from "../../lib/api";
import { useEffect, useState } from "react";

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
    message: n.message || "New notification",
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

        console.log("[Notifications] Initial load:", newData.length);
        setNotifications(newData);
      } catch (err: any) {
        console.error("[Notifications] Fetch error:", err);
      }
    };
    fetchNotifications();

    return () => {
      isMounted = false;
      console.log("[Notifications] Dropdown cleanup done");
    };
  }, [currentUserId, setNotifications]); 

  return (
 <div className="fixed inset-x-4 top-[72px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-4 sm:w-[380px] bg-gray-50/90 dark:bg-zinc-950/90 backdrop-blur-3xl border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300 shadow-2xl">

  <div className="px-5 py-4 flex items-center justify-between border-b border-white/10">
    <div>
      <h2 className="text-base font-semibold tracking-tight text-foreground">
        Notifications
      </h2>
      <p className="text-xs text-muted-foreground/90">Stay updated with activity</p>
    </div>

    <button
      onClick={onClose}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-white/6 border border-white/10 hover:bg-white/10 hover:border-white/16 tracking-wide transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-60">
      ✕
    </button>
  </div>

  <div className="flex items-center justify-between px-5 py-2 text-xs bg-white/4 border-b border-white/10">
    <span className="text-muted-foreground italic">
      {wsStatus === "connected" ? "Real-time updates active" : "Offline mode"}
    </span>

    <span className={`flex items-center gap-1 font-medium ${
      wsStatus === "connected" ? "text-green-500" : "text-red-500"
    }`}>
      <span className="animate-pulse">●</span>
      {wsStatus === "connected" ? "Live" : "Offline"}
    </span>
  </div>

  <div className="max-h-[420px] overflow-y-auto">

    {notifications.length === 0 && (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <div className="text-4xl mb-2">🔕</div>
        <p className="text-sm">No notifications yet</p>
        <p className="text-xs">When you get activity, it will show here</p>
      </div>
    )}

    {notifications.map((n, index) => (
      <div
        key={n.id}
        className={`relative group px-5 py-4 flex gap-3 items-start transition-all duration-200 border-b last:border-none border-white/10
        hover:bg-white/6
        ${!n.read ? "bg-[oklch(0.62_0.12_210/10%)]" : "opacity-90"}
        `}>

        {!n.read && (
          <span className="absolute left-2 top-6 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
        )}

        <div className="w-10 h-10 rounded-full bg-linear-to-r from-[oklch(0.62_0.12_210)] to-[oklch(0.62_0.12_190)] flex items-center justify-center text-black font-semibold text-sm shadow-[0_0_0_1px_oklch(1_0_0/12%),0_25px_70px_-55px_var(--fx-glow-cyan)]">
          {n.sender?.firstName?.[0] || "U"}
        </div>

        <div className="flex-1">
          <div className="text-sm text-foreground/90 leading-snug">
            {n.message}
          </div>

          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2 italic">
  
            <span>
              {new Date(n.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            <span className="px-2 py-[2px] rounded-full text-foreground/90 bg-white/6 border border-white/10 text-[10px] uppercase tracking-wide italic">
              {n.type}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            console.log("[Notifications] Mark as read:", n.id);
            markAsRead(n.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-xs text-primary hover:underline tracking-wide transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          Mark
        </button>
      </div>
    ))}
  </div>

  <div className="p-3 border-t border-white/10 bg-white/4 backdrop-blur">
    <button
      className="w-full text-sm font-medium text-primary tracking-wide transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-60"
      onClick={() => console.log("[Notifications] View all")}>
      View all notifications →
    </button>
  </div>
</div> 
  );
}

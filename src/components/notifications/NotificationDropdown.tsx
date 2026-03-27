// //src/components/notifications/NotificationDropdown.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { NotificationItem } from "./NotificationItem";
// import api from "../../lib/api";

// export function NotificationDropdown({ onClose, refreshUnread }: { onClose: () => void, refreshUnread: () => void }) {
//   const [notifications, setNotifications] = useState<any[]>([]);

//   const fetchNotifications = async () => {
//     try {
//       const res = await api.get("/notifications");
//       setNotifications(res.data.notifications);
//       console.log("[NotificationDropdown] Loaded notifications:", res.data.notifications);
//     } catch (err) {
//       console.error("[NotificationDropdown] Failed to load notifications:", err);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   // Update one notification as read
//   const markAsRead = async (id: string) => {
//     try {
//       await api.post("/notifications/mark-read", { notificationId: id });
//       setNotifications(prev =>
//         prev.map(n => (n.id === id ? { ...n, read: true } : n))
//       );
//       refreshUnread(); // update bell badge
//     } catch (err) {
//       console.error("[NotificationDropdown] Failed to mark as read:", err);
//     }
//   };

//   return (
//     <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border rounded-lg shadow-lg overflow-hidden z-50">
//       <div className="p-2 border-b text-sm font-semibold text-gray-600 dark:text-gray-300 flex justify-between">
//         Notifications
//         <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
//       </div>
//       <div className="max-h-80 overflow-y-auto">
//         {notifications.length === 0 && (
//           <p className="text-center text-gray-400 p-4">No notifications</p>
//         )}
//         {notifications.map(n => (
//           <NotificationItem
//             key={n.id}
//             notification={n}
//             markAsRead={() => markAsRead(n.id)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }
{/* <div className="absolute right-0 mt-4 w-[380px] backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border border-white/20 dark:border-zinc-700 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">


  <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200 dark:border-zinc-700">
    <div>
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">
        Notifications
      </h2>
      <p className="text-xs text-gray-500">Stay updated with activity</p>
    </div>

    <button
      onClick={onClose}
      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
    >
      ✕
    </button>
  </div>

  <div className="flex items-center justify-between px-5 py-2 text-xs bg-gradient-to-r from-gray-50 to-transparent dark:from-zinc-800">
    <span className="text-gray-500 italic">
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
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <div className="text-4xl mb-2">🔕</div>
        <p className="text-sm">No notifications yet</p>
        <p className="text-xs">When you get activity, it will show here</p>
      </div>
    )}


    {notifications.map((n, index) => (
      <div
        key={n.id}
        className={`relative group px-5 py-4 flex gap-3 items-start transition-all duration-200 border-b last:border-none border-gray-100 dark:border-zinc-800
        hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent dark:hover:from-zinc-800
        ${!n.read ? "bg-blue-50/40 dark:bg-blue-900/10" : ""}
        `}
      >

        {!n.read && (
          <span className="absolute left-2 top-6 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        )}


        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
          {n.sender?.firstName?.[0] || "U"}
        </div>

        <div className="flex-1">
          <div className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
            {n.message}
          </div>

          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
  
            <span>
              {new Date(n.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            <span className="px-2 py-[2px] rounded-full bg-gray-200 dark:bg-zinc-700 text-[10px] uppercase tracking-wide">
              {n.type}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            console.log("[Notifications] Mark as read:", n.id);
            markAsRead(n.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition text-xs text-blue-500 hover:underline"
        >
          Mark
        </button>
      </div>
    ))}
  </div>

  <div className="p-3 border-t border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 backdrop-blur">
    <button
      className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 transition"
      onClick={() => console.log("[Notifications] View all")}
    >
      View all notifications →
    </button>
  </div>
</div> */}

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
 <div className="absolute right-0 mt-4 w-[380px] backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border border-white/20 dark:border-zinc-700 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">

  <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200 dark:border-zinc-700">
    <div>
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">
        Notifications
      </h2>
      <p className="text-xs text-gray-500">Stay updated with activity</p>
    </div>

    <button
      onClick={onClose}
      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 tracking-wide hover:brightness-125 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-60">
      ✕
    </button>
  </div>

  <div className="flex items-center justify-between px-5 py-2 text-xs bg-linear-to-r from-gray-50 to-transparent dark:from-zinc-800">
    <span className="text-gray-500 italic">
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
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <div className="text-4xl mb-2">🔕</div>
        <p className="text-sm">No notifications yet</p>
        <p className="text-xs">When you get activity, it will show here</p>
      </div>
    )}

    {notifications.map((n, index) => (
      <div
        key={n.id}
        className={`relative group px-5 py-4 flex gap-3 items-start transition-all duration-200 border-b last:border-none border-gray-100 dark:border-zinc-800
        hover:bg-linear-to-r hover:from-gray-50 hover:to-transparent dark:hover:from-zinc-800
        ${!n.read ? "bg-blue-50/40 dark:bg-blue-900/10" : ""}
        `}>

        {!n.read && (
          <span className="absolute left-2 top-6 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        )}

        <div className="w-10 h-10 rounded-full bg-linear-to-r bg-cyan-800 flex items-center justify-center text-white font-semibold text-sm shadow-md">
          {n.sender?.firstName?.[0] || "U"}
        </div>

        <div className="flex-1">
          <div className="text-sm text-slate-800 dark:text-gray-200 leading-snug">
            {n.message}
          </div>

          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2 italic">
  
            <span>
              {new Date(n.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            <span className="px-2 py-[2px] rounded-full text-slate-900 dark:text-slate-200 bg-gray-300 dark:bg-zinc-900 text-[10px] uppercase tracking-wide italic">
              {n.type}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            console.log("[Notifications] Mark as read:", n.id);
            markAsRead(n.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-xs text-blue-500 hover:underline tracking-wide hover:brightness-125 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          Mark
        </button>
      </div>
    ))}
  </div>

  <div className="p-3 border-t border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 backdrop-blur">
    <button
      className="w-full text-sm font-medium text-blue-600 hover:text-blue-900 tracking-wide hover:brightness-125 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-60"
      onClick={() => console.log("[Notifications] View all")}>
      View all notifications →
    </button>
  </div>
</div> 
  );
}

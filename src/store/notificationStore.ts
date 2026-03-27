import { create } from "zustand";

// Notification type (match your entity)
export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  sender?: { id: string; firstName: string; lastName: string };
  type: string;
  postId?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  currentUserId: string | null;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  setUnreadCount: (count: number) => void;
  setCurrentUserId: (userId: string | null) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  currentUserId: null,

  setNotifications: (notifications) => {
  const sanitized = notifications.filter((n) => Boolean(n?.id)).map((n) => ({
    ...n,
    createdAt:
      n.createdAt && !Number.isNaN(new Date(n.createdAt).getTime())
        ? n.createdAt
        : new Date().toISOString(),
  }));

  const existing = get().notifications;

  const map = new Map();

  // keep old
  existing.forEach(n => map.set(n.id, n));

  // overwrite with fresh DB data
  sanitized.forEach(n => map.set(n.id, n));

  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  set({
    notifications: merged,
    unreadCount: merged.filter(n => !n.read).length,
  });

  console.log("[Store] mergedNotifications:", merged.length);
},

  addNotification: (notification) => {
    if (!notification?.id) {
      console.warn("[Store] Skipped invalid notification (missing id)", notification);
      return;
    }

    const safeNotification = {
      ...notification,
      createdAt:
        notification.createdAt && !Number.isNaN(new Date(notification.createdAt).getTime())
          ? notification.createdAt
          : new Date().toISOString(),
    };

    const existing = get().notifications.find((n) => n.id === safeNotification.id);
    if (existing) {
      console.log("[Store] Duplicate notification skipped:", safeNotification.id);
      return;
    }

    set({
      notifications: [safeNotification, ...get().notifications],
      unreadCount: get().unreadCount + (safeNotification.read ? 0 : 1),
    });
    console.log("[Store] addNotification", safeNotification.id);
  },

  markAsRead: (id) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => !n.read).length,
    });
    console.log("[Store] markAsRead", id);
  },

  setUnreadCount: (count) => set({ unreadCount: count }),
  setCurrentUserId: (userId) => {
    set({ currentUserId: userId });
    console.log("[Store] setCurrentUserId", userId);
  },
}));
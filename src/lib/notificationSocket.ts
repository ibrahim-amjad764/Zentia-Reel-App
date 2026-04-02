// // src/lib/notificationSocket.ts

import { useNotificationStore } from "../store/notificationStore";

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 8;

export const connectNotificationSocket = (userId: string) => {
  if (!userId) {
    console.warn("[WS] Missing userId. Socket connection skipped.");
    return null;
  }

  // Avoid multiple connections
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    console.log("[WS] Reusing existing notification socket");
    return socket;
  }

  const baseUrl = process.env.NEXT_PUBLIC_NOTIF_WS_URL || "ws://localhost:3002";
  const wsUrl = `${baseUrl}?userId=${encodeURIComponent(userId)}`;
  socket = new WebSocket(wsUrl);
  (globalThis as any).__notificationSocket = socket;

  console.log("[WS] Connecting to:", wsUrl);

  const store = useNotificationStore.getState();

  socket.onopen = () => {
    reconnectAttempts = 0;
    console.log("[WS] Connected for user:", userId);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("[WS] New notification received:", data);
      
      if (data.type) {
        if (!data.id) {
          console.log("[WS] Ignored payload without id:", data.type);
          return;
        }
        console.log("[WS] Valid notification received:", data.id);
        const existing = useNotificationStore
      .getState()
      .notifications.find((n) => n.id === data.id);

    if (existing) {
      console.log("[WS] Duplicate skipped:", data.id);
      return;
    }

    console.log("[WS] Adding new notification:", data.id);

    useNotificationStore.getState().addNotification(data);

      } else{
        console.log("[WS] Ignored non-notification message");
      }
    } catch (err) {
      console.error("[WS] Failed to parse message:", err);
    }
  };

  socket.onclose = () => {
    console.log("[WS] Connection closed");
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn("[WS] Max reconnect attempts reached. Stopping reconnect.");
      return;
    }

    reconnectAttempts += 1;
    const backoffMs = Math.min(1000 * Math.pow(2, reconnectAttempts), 15000);
    console.log(`[WS] Reconnecting in ${backoffMs}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);

    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => connectNotificationSocket(userId), backoffMs);
  };
  socket.onerror = (err) => console.error("[WS] Error:", err);

  return socket;
};
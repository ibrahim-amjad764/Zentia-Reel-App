import { WebSocketServer, WebSocket } from "ws";

type NotificationPayload = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  type: string;
  postId?: string;
};

const globalRef = globalThis as typeof globalThis & {
  __notificationWss?: WebSocketServer;
  __notificationConnectedUsers?: Record<string, WebSocket[]>;
};

const connectedUsers =
  globalRef.__notificationConnectedUsers ||
  (globalRef.__notificationConnectedUsers = {});

const startServer = () => {
  if (globalRef.__notificationWss) {
    return globalRef.__notificationWss;
  }

  const wss = new WebSocketServer({ port: 3002, perMessageDeflate: false });
  globalRef.__notificationWss = wss;

  console.log("[NotificationWS] Server started on ws://localhost:3002");

  wss.on("connection", (ws, req) => {
    const urlParams = new URLSearchParams(req.url?.split("?")[1]);
    const userId = urlParams.get("userId");

    if (!userId) {
      console.warn("[NotificationWS] Missing userId in query, closing socket");
      ws.close(1008, "Missing userId");
      return;
    }

    if (!connectedUsers[userId]) connectedUsers[userId] = [];
    connectedUsers[userId].push(ws);
    console.log(`[NotificationWS] User connected: ${userId} | sockets=${connectedUsers[userId].length}`);

    ws.send(
      JSON.stringify({
        type: "connection",
        status: "connected",
        userId,
        message: "Connected to notification server",
        timestamp: new Date().toISOString(),
      })
    );

    ws.on("close", () => {
      connectedUsers[userId] = (connectedUsers[userId] || []).filter((s) => s !== ws);
      if (connectedUsers[userId].length === 0) {
        delete connectedUsers[userId];
      }
      console.log(`[NotificationWS] User disconnected: ${userId}`);
    });

    ws.on("error", (error) => {
      console.error(`[NotificationWS] Socket error for user ${userId}:`, error);
    });
  });

  wss.on("error", (error) => {
    console.error("[NotificationWS] Server error:", error);
  });

  return wss;
};

if (typeof window === "undefined") {
  try {
    startServer();
  } catch (error: any) {
    // In dev HMR reloads, EADDRINUSE can happen briefly; we keep process alive.
    if (error?.code === "EADDRINUSE") {
      console.warn("[NotificationWS] Port 3002 already in use. Reusing existing server process.");
    } else {
      console.error("[NotificationWS] Failed to start notification server:", error);
    }
  }
}

export function pushNotificationToUser(userId: string, notification: NotificationPayload) {
  const sockets = connectedUsers[userId] || [];
  if (!sockets.length) {
    console.log(`[NotificationWS] No active sockets for user ${userId}. Notification saved only in DB.`);
    return;
  }

  let sent = 0;
  sockets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(notification));
      sent += 1;
    }
  });

  console.log(`[NotificationWS] Pushed notification ${notification.id} to user ${userId} on ${sent} socket(s)`);
}
import WebSocket, { WebSocketServer } from 'ws';
import { AppDataSource } from '@/db/data-source';
import { Comment } from '@/entities/comment';
import { Post } from '@/entities/post';
import { User } from '@/entities/user';
import 'dotenv/config';

// --- Add this interface at the top ---
interface NotificationPayload {
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
}

// ==========================
//  DATABASE INITIALIZATION (from file 2 - SAFE ADD)
// ==========================
console.log('[WebSocket] Starting WebSocket server...');

let db;
try {
  db = AppDataSource;

  if (!db) {
    throw new Error('Database not initialized');
  }

  if (!db.isInitialized) {
    await db.initialize();
    console.log('[WebSocket] Database initialized');
  }

  console.log('[WebSocket] Database connected successfully');
} catch (error) {
  console.error('[WebSocket] Database connection failed:', error);
  process.exit(1);
}

// ==========================
//  MULTI-DEVICE SUPPORT (already in file 1)
// ==========================
const connectedUsers: Record<string, WebSocket[]> = {};

// ==========================
//  SERVER CONFIG (enhanced)
// ==========================
export const wss = new WebSocketServer({
  port: 3001,
  perMessageDeflate: false // performance optimization
});

console.log('[WebSocket] Server started on ws://localhost:3001');

// ==========================
//  BROADCAST FUNCTION (from file 2 - reusable + scalable)
// ==========================
const broadcast = (message: any) => {
  const payload = JSON.stringify(message);
  let count = 0;

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
        count++;
      } catch (err: any) {
        console.error('[WebSocket] Broadcast error:', err.message);
      }
    }
  });

  console.log(`[WebSocket] Broadcast sent to ${count} clients`);
};

// ==========================
//  SAVE COMMENT FUNCTION (clean architecture)
// ==========================
const saveComment = async (postId: string, content: string, userId: string) => {
  try {
    const commentRepo = db.getRepository(Comment);
    const postRepo = db.getRepository(Post);
    const userRepo = db.getRepository(User);

    const post = await postRepo.findOne({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const comment = new Comment();
    comment.content = content.trim();
    comment.post = post;
    comment.user = user;
    comment.createdAt = new Date();

    const saved = await commentRepo.save(comment);

    console.log('[WebSocket] Comment saved:', saved.id);

    return {
      id: saved.id,
      content: saved.content,
      postId,
      userId,
      createdAt: saved.createdAt,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl
      }
    };
  } catch (error: any) {
    console.error('[WebSocket] saveComment error:', error.message);
    throw error;
  }
};

// ==========================
//  CONNECTION HANDLER
// ==========================
wss.on('connection', (ws: WebSocket, req: any) => {

  const urlParams = new URLSearchParams(req.url?.split("?")[1]);
  const userId = urlParams.get("userId");

  if (!userId) {
    console.log('[WebSocket] Connection rejected: Missing userId');
    return ws.close();
  }

  // MULTI DEVICE SUPPORT
  if (!connectedUsers[userId]) connectedUsers[userId] = [];
  connectedUsers[userId].push(ws);

  console.log(`[WebSocket] User ${userId} connected`);

  //  SEND WELCOME MESSAGE (from file 2)
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    userId,
    message: 'Connected to WebSocket server',
    timestamp: new Date().toISOString()
  }));

  ws.on('close', () => {
    connectedUsers[userId] = connectedUsers[userId].filter((s) => s !== ws);
    console.log(`[WebSocket] User ${userId} disconnected`);
  });

  ws.on('error', (err: any) => {
    console.error(`[WebSocket] Error for user ${userId}:`, err.message);
  });

  // ==========================
  //  MESSAGE HANDLER (MERGED LOGIC)
  // ==========================
  ws.on('message', async (message: string) => {
    console.log(`[WebSocket] Received from ${userId}:`, message);

    try {
      const parsed = JSON.parse(message);
      const { postId, content, type } = parsed;

      //  SUPPORT BOTH FORMATS (IMPORTANT FIX)
      const finalType = type || 'comment';

      if (finalType === 'comment' && postId && content) {

        // SAVE COMMENT
        const savedComment = await saveComment(postId, content, userId);

        // BROADCAST
        broadcast({
          type: 'new_comment',
          comment: savedComment,
          timestamp: new Date().toISOString()
        });

        // CONFIRMATION
        ws.send(JSON.stringify({
          type: 'comment_saved',
          success: true,
          commentId: savedComment.id,
          timestamp: new Date().toISOString()
        }));

        // ==========================
        //  NOTIFICATIONS (from file 1)
        // ==========================
        const postRepo = db.getRepository(Post);
        const post = await postRepo.findOne({ where: { id: postId }, relations: ['user'] });

        if (post && post.user.id !== userId) {
          pushNotificationToUser(post.user.id, {
            id: `notif-${savedComment.id}`,
            message: `${savedComment.user.firstName || 'Someone'} commented on your post`,
            read: false,
            createdAt: new Date().toISOString(),
            sender: {
              id: savedComment.user.id,
              firstName: savedComment.user.firstName || 'User',
              lastName: savedComment.user.lastName || '',
            },
            type: "COMMENT",
            postId: post.id,
          });
        }

      } else {
        console.log('[WebSocket] Invalid message format');
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }

    } catch (error: any) {
      console.error('[WebSocket] Message error:', error.message);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });
});

// ==========================
//  NOTIFICATION FUNCTION (UNCHANGED)
// ==========================
export function pushNotificationToUser(userId: string, notification: NotificationPayload) {
  const sockets = connectedUsers[userId] || [];

  sockets.forEach((ws: WebSocket) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(notification));
    }
  });

  console.log(`[WebSocket] Notification sent to ${userId}`, notification);
}

// ==========================
//  GRACEFUL SHUTDOWN (from file 2)
// ==========================
process.on('SIGINT', () => {
  console.log('[WebSocket] Shutting down...');
  wss.close(() => {
    console.log('[WebSocket] Server closed');
    process.exit(0);
  });
});

console.log('[WebSocket] Server ready ');
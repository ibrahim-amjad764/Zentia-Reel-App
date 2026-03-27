// file 2
import WebSocket, { WebSocketServer } from 'ws';
import { AppDataSource } from './src/db/data-source.js';
import { Comment } from './src/entities/comment.js';
import { Post } from './src/entities/post.js';
import { User } from './src/entities/user.js';
import 'dotenv/config';

console.log('[WebSocket] Starting WebSocket server...');

// Initialize database
let db;
try {
  db = AppDataSource;
  if (!db) {
    throw new Error('Database not initialized');
  }
  if (!db.isInitialized) {
    await db.initialize();
  }
  console.log('[WebSocket] Database connected successfully');
} catch (error) {
  console.error('[WebSocket] Database connection failed:', error);
  process.exit(1);
}

// Create WebSocket server on port 3001
const wss = new WebSocketServer({ 
  port: 3001,
  perMessageDeflate: false
});

console.log('[WebSocket] Server started on ws://localhost:3001');

// Connected users tracking
const connectedUsers = new Map();

// Broadcast message to all connected clients
const broadcast = (message, excludeUser = null) => {
  const payload = JSON.stringify(message);
  let sentCount = 0;
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
        sentCount++;
      } catch (error) {
        console.error('[WebSocket] Error sending to client:', error.message);
      }
    }
  });
  
  console.log(`[WebSocket] Broadcast sent to ${sentCount} clients`);
  return sentCount;
};

// Save comment to database
const saveComment = async (postId, content, userId) => {
  try {
    const commentRepo = db.getRepository(Comment);
    const postRepo = db.getRepository(Post);
    const userRepo = db.getRepository(User);

    // Verify post exists
    const post = await postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error('Post not found');
    }

    // Verify user exists
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Create and save comment
    const comment = new Comment();
    comment.content = content.trim();
    comment.post = post;
    comment.user = user;
    comment.createdAt = new Date();

    const savedComment = await commentRepo.save(comment);

    // Return formatted comment
    return {
      id: savedComment.id,
      content: savedComment.content,
      postId: postId,
      userId: userId,
      createdAt: savedComment.createdAt,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl
      }
    };
  } catch (error) {
    console.error('[WebSocket] Error saving comment:', error.message);
    throw error;
  }
};

// Handle WebSocket connections
wss.on('connection', (ws, request) => {
  // Extract userId from URL query params
  const url = new URL(request.url, 'http://localhost:3001');
  const userId = url.searchParams.get('userId');

  if (!userId) {
    console.log('[WebSocket] Connection rejected: No userId provided');
    ws.close(1008, 'Missing userId');
    return;
  }

  console.log(`[WebSocket] User connected: ${userId}`);
  connectedUsers.set(userId, ws);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    message: 'Connected to comment server',
    userId: userId,
    timestamp: new Date().toISOString()
  }));

  // Handle incoming messages
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`[WebSocket] Message from ${userId}:`, message);

      const { postId, content, type } = message;

      if (type === 'comment' && postId && content) {
        // Save comment to database
        const savedComment = await saveComment(postId, content, userId);
        
        // Broadcast to all clients
        broadcast({
          type: 'new_comment',
          comment: savedComment,
          timestamp: new Date().toISOString()
        });

        // Send confirmation to sender
        ws.send(JSON.stringify({
          type: 'comment_saved',
          success: true,
          commentId: savedComment.id,
          timestamp: new Date().toISOString()
        }));
      } else {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('[WebSocket] Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  });

  // Handle connection close
  ws.on('close', (code, reason) => {
    console.log(`[WebSocket] User disconnected: ${userId} (code: ${code})`);
    connectedUsers.delete(userId);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`[WebSocket] Error for user ${userId}:`, error.message);
  });
});

// Handle server errors
wss.on('error', (error) => {
  console.error('[WebSocket] Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[WebSocket] Shutting down...');
  wss.close(() => {
    console.log('[WebSocket] Server closed');
    process.exit(0);
  });
});

console.log('[WebSocket] Server ready for connections');




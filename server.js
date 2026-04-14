const { createServer } = require("http");
import next from "next";
import express from "express";
import { WebSocketServer } from "ws";
import { DataSource } from "typeorm";
import "reflect-metadata";
import { config } from "dotenv";
// import { connected } from "process";
// import { connect } from "http2";

// Load environment variables from .env.local file
config({ path: '.env.local' });
console.log("[Server] Environment loaded - DB_HOST:", process.env.DB_HOST);

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// TypeORM DataSource configuration for raw SQL queries
// We use raw SQL to avoid entity schema mismatches with the TypeScript entities
const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false, // Don't sync - let Next.js API routes handle that
  logging: ["query", "error"], // Log all queries for debugging
});

// Initialize TypeORM database connection
const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("[Database] TypeORM connection established successfully");
    }
    return AppDataSource;
  } catch (error) {
    console.error("[Database] Failed to initialize TypeORM:", error.message);
    throw error;
  }
};

// Connected users tracking
const connectedUsers = {};

// Save comment to database using raw SQL (works with existing schema)
const saveComment = async (postId, content, userId) => {
  console.log("[Comment] ========== SAVING COMMENT ==========");
  console.log("[Comment] PostId:", postId);
  console.log("[Comment] UserId:", userId);
  console.log("[Comment] Content:", content.substring(0, 50) + "...");

  // Validate input parameters
  if (!postId || !content || !userId) {
    console.error("[Comment] ERROR: Missing required parameters");
    throw new Error("Missing required parameters: postId, content, or userId");
  }

  if (content.trim().length === 0) {
    console.error("[Comment] ERROR: Empty comment content");
    throw new Error("Comment content cannot be empty");
  }

  if (content.length > 1000) {
    console.error("[Comment] ERROR: Comment too long");
    throw new Error("Comment content cannot exceed 1000 characters");
  }

  let queryRunner;
  try {
    queryRunner = AppDataSource.createQueryRunner();
    
    // Verify post exists using raw SQL
    console.log("[Comment] Checking if post exists...");
    const postResult = await queryRunner.query(
      `SELECT id, "userId" FROM posts WHERE id = $1`,
      [postId]
    );
    
    if (!postResult || postResult.length === 0) {
      console.error("[Comment] ERROR: Post not found:", postId);
      throw new Error("Post not found");
    }
    console.log("[Comment] Post found ✓");

    // Verify user exists and get user data using raw SQL
    console.log("[Comment] Checking if user exists...");
    const userResult = await queryRunner.query(
      `SELECT id, "firstName", "lastName", "avatarUrl" FROM users WHERE id = $1`,
      [userId]
    );
    
    if (!userResult || userResult.length === 0) {
      console.error("[Comment] ERROR: User not found:", userId);
      throw new Error("User not found");
    }
    const user = userResult[0];
    console.log("[Comment] User found:", user.firstName, user.lastName, "✓");

    // Check for duplicate comments (same content from same user on same post in last minute)
    console.log("[Comment] Checking for duplicate comments...");
    const duplicateResult = await queryRunner.query(
      `SELECT id FROM comments 
       WHERE "postId" = $1 AND "userId" = $2 AND content = $3 
       AND "createdAt" > NOW() - INTERVAL '1 minute'`,
      [postId, userId, content.trim()]
    );
    
    if (duplicateResult && duplicateResult.length > 0) {
      console.error("[Comment] ERROR: Duplicate comment detected");
      throw new Error("Duplicate comment detected");
    }

    // Insert comment using raw SQL with proper foreign key columns
    console.log("[Comment] Inserting comment into database...");
    const insertResult = await queryRunner.query(
      `INSERT INTO comments (content, "postId", "userId", "createdAt")
       VALUES ($1, $2, $3, NOW())
       RETURNING id, content, "createdAt"`,
      [content.trim(), postId, userId]
    );

    const savedComment = insertResult[0];
    console.log("[Comment] ✅ Comment saved successfully!");
    console.log("[Comment] Comment ID:", savedComment.id);
    console.log("[Comment] Created at:", savedComment.createdAt);

    // Return comment with user data for broadcasting to clients
    return {
      id: savedComment.id,
      postId: postId,
      content: savedComment.content,
      createdAt: savedComment.createdAt,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
    };
  } catch (error) {
    console.error("[Comment] ❌ Database error:", error.message);
    
    // Re-throw known errors with original message
    if (error.message.includes("Post not found") ||
        error.message.includes("User not found") ||
        error.message.includes("Duplicate comment") ||
        error.message.includes("Missing required parameters") ||
        error.message.includes("Comment content")) {
      throw error;
    }
    
    // Handle database-specific errors
    if (error.code === '23503') { // Foreign key violation
      console.error("[Comment] Foreign key violation");
      throw new Error("Invalid post or user reference");
    }
    
    if (error.code === '23505') { // Unique constraint violation
      console.error("[Comment] Unique constraint violation");
      throw new Error("Duplicate comment");
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error("[Comment] Database connection refused");
      throw new Error("Database temporarily unavailable");
    }
    
    // Generic database error
    console.error("[Comment] Unexpected database error:", error);
    throw new Error("Failed to save comment due to database error");
  } finally {
    // Release the query runner if it was created
    if (queryRunner) {
      try {
        await queryRunner.release();
        console.log("[Comment] Query runner released successfully");
      } catch (releaseError) {
        console.error("[Comment] Error releasing query runner:", releaseError.message);
      }
    }
  }
};

// Broadcast message to all connected WebSocket clients
const broadcastToClients = (wss, message, senderWs = null) => {
  try {
    const payload = JSON.stringify(message);
    let clientCount = 0;
    let errorCount = 0;

    console.log("[Broadcast] Starting broadcast to", wss.clients.size, "clients");

    wss.clients.forEach((client) => {
      try {
        // Send to all connected clients (including sender for confirmation)
        if (client.readyState === 1) { // WebSocket.OPEN = 1
          client.send(payload);
          clientCount++;
          console.log("[Broadcast] Message sent to client successfully");
        } else {
          console.log("[Broadcast] Skipping client - not ready (state:", client.readyState, ")");
        }
      } catch (clientError) {
        errorCount++;
        console.error("[Broadcast] Error sending to client:", clientError.message);
        // Don't throw here, continue with other clients
      }
    });

    console.log("[Broadcast] Message sent to", clientCount, "client(s) successfully");
    if (errorCount > 0) {
      console.warn("[Broadcast] Failed to send to", errorCount, "client(s)");
    }
    
    return { success: true, clientCount, errorCount };
  } catch (error) {
    console.error("[Broadcast] Critical error during broadcast:", error.message);
    throw new Error("Failed to broadcast message to clients");
  }
};

app.prepare().then(async () => {
  // Initialize database before starting server
  await initializeDatabase();

  const server = express();

  // Create HTTP server
  const httpServer = createServer(server);

  // Create WebSocket server instance (noServer mode for path filtering)
  const wss = new WebSocketServer({ noServer: true });

  // Get Next.js upgrade handler for HMR
  const nextUpgradeHandler = app.getUpgradeHandler();

  // Handle WebSocket upgrade requests
  httpServer.on("upgrade", (request, socket, head) => {
   const url = new URL(request.url, "http://localhost");
const pathname = url.pathname;

console.log("[WebSocket] Upgrade request for:", pathname);

if (pathname === "/ws") {
  console.log("[WebSocket] Handling upgrade for /ws...");

  wss.handleUpgrade(request, socket, head, (ws) => {
    ws.userId = url.searchParams.get("userId"); // 🔥 IMPORTANT
    wss.emit("connection", ws, request);
  });
return; // Handle /ws path and return
}

    // Let Next.js handle HMR and other upgrade requests
    nextUpgradeHandler(request, socket, head);
  });

  // Handle WebSocket connections
  wss.on("connection", (ws) => {
    const userId = ws.userId;

    if (!userId) {
      console.log("[WebSocket] No userId provided, closing connection");
      try {
        ws.close(1008, "Missing userId parameter");
      } catch (closeError) {
        console.error("[WebSocket] Error closing connection:", closeError.message);
      }
      return;
    }

    // Validate userId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.log("[WebSocket] Invalid userId format:", userId);
      try {
        ws.close(1003, "Invalid userId format");
      } catch (closeError) {
        console.error("[WebSocket] Error closing connection:", closeError.message);
      }
      return;
    }

    if (!connectedUsers[userId]) connectedUsers[userId] = [];
    connectedUsers[userId].push(ws);
    console.log("[WebSocket] User Connected:", userId);
    console.log("[WebSocket] Total connected clients:", wss.clients.size);
    console.log("[WebSocket] Active users:", Object.keys(connectedUsers).length);
    
    // Send welcome message to client
    try {
      ws.send(JSON.stringify({ 
        type: "connection", 
        status: "connected", 
        message: "Successfully connected to comment server",
        userId: userId,
        timestamp: new Date().toISOString()
      }));
    } catch (welcomeError) {
      console.error("[WebSocket] Error sending welcome message:", welcomeError.message);
    }
    
    // Handle incoming messages (new comments)
    ws.on("message", async (message) => {
      try {
        console.log("[WebSocket] Received message from user:", userId);
        console.log("[WebSocket] Message length:", message.length, "bytes");

        // Parse the incoming comment data
        let data;
        try {
          data = JSON.parse(message.toString());
        } catch (parseError) {
          console.error("[WebSocket] JSON parse error:", parseError.message);
          ws.send(JSON.stringify({ 
            error: "Invalid JSON format", 
            type: "error",
            timestamp: new Date().toISOString()
          }));
          return;
        }

        const { postId, content, userId: messageUserId } = data;

        // Validate required fields
        if (!postId || !content || !messageUserId) {
          console.error("[WebSocket] Missing required fields");
          console.error("[WebSocket] postId:", !!postId, "content:", !!content, "userId:", !!messageUserId);
          ws.send(JSON.stringify({ 
            error: "Missing required fields: postId, content, or userId", 
            type: "error",
            timestamp: new Date().toISOString()
          }));
          return;
        }

        // Verify message userId matches connection userId
        if (messageUserId !== userId) {
          console.error("[WebSocket] User ID mismatch - connection:", userId, "message:", messageUserId);
          ws.send(JSON.stringify({ 
            error: "User ID mismatch", 
            type: "error",
            timestamp: new Date().toISOString()
          }));
          return;
        }

        console.log("[WebSocket] Processing comment for post:", postId);

        // Save comment to database
        const savedComment = await saveComment(postId, content, userId);
        console.log("[WebSocket] Comment saved successfully, broadcasting to clients...");

        // Broadcast the new comment to all connected clients
        const broadcastResult = broadcastToClients(wss, {
          ...savedComment,
          type: "new_comment",
          timestamp: new Date().toISOString()
        });

        console.log("[WebSocket] Broadcast completed:", broadcastResult);

        // Send confirmation to sender
        ws.send(JSON.stringify({
          type: "comment_saved",
          success: true,
          commentId: savedComment.id,
          timestamp: new Date().toISOString()
        }));

      } catch (error) {
        console.error("[WebSocket] Error processing message:", error.message);
        console.error("[WebSocket] Stack trace:", error.stack);
        
        // Send detailed error to client
        ws.send(JSON.stringify({ 
          error: error.message, 
          type: "error",
          timestamp: new Date().toISOString()
        }));
      }
    });

    // Handle WebSocket errors
    ws.on("error", (err) => {
      console.error("[WebSocket] Client error for user", userId + ":", err.message);
      console.error("[WebSocket] Error code:", err.code);
      console.error("[WebSocket] Error stack:", err.stack);
    });

    // Handle client disconnect
    ws.on("close", (code, reason) => {
      console.log("[WebSocket] Client disconnected for user:", userId);
      console.log("[WebSocket] Close code:", code, "Reason:", reason || "No reason provided");
      
      // Remove from connectedUsers
      if (connectedUsers[userId]) {
        connectedUsers[userId] = connectedUsers[userId].filter(socket => socket !== ws);
        if (connectedUsers[userId].length === 0) {
          delete connectedUsers[userId];
          console.log("[WebSocket] User", userId, "completely disconnected");
        }
      }
      
      console.log("[WebSocket] Remaining clients:", wss.clients.size);
      console.log("[WebSocket] Active users:", Object.keys(connectedUsers).length);
    });

    // Handle pong responses (for connection health)
    ws.on("pong", () => {
      console.log("[WebSocket] Received pong from user:", userId);
    });

  });

  // Serve Next.js pages and static assets
  server.all("/{*path}", (req, res) => {
    return handle(req, res);
  });

  // Start the HTTP server
  httpServer.listen(3000, (err) => {
    if (err) {
      console.error("[Server] Failed to start server:", err);
      process.exit(1);
    }
    console.log("[Server] ✅ Ready on http://localhost:3000");
    console.log("[Server] ✅ WebSocket server ready on ws://localhost:3000/ws");
    console.log("[Server] ✅ Database connected and ready");
    
    // Setup graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`[Server] Received ${signal}, starting graceful shutdown...`);
      
      // Close WebSocket server
      wss.close(() => {
        console.log("[Server] WebSocket server closed");
      });
      
      // Close HTTP server
      httpServer.close(() => {
        console.log("[Server] HTTP server closed");
        
        // Close database connection
        if (AppDataSource.isInitialized) {
          AppDataSource.destroy().then(() => {
            console.log("[Server] Database connection closed");
            process.exit(0);
          }).catch((error) => {
            console.error("[Server] Error closing database:", error);
            process.exit(1);
          });
        } else {
          process.exit(0);
        }
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error("[Server] Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };
    
    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error("[Server] Uncaught Exception:", error);
      console.error("[Server] Stack:", error.stack);
      gracefulShutdown('uncaughtException');
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error("[Server] Unhandled Rejection at:", promise, "reason:", reason);
      gracefulShutdown('unhandledRejection');
    });
    
    console.log("[Server] ✅ Graceful shutdown handlers configured");
  });
});


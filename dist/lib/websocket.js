import WebSocket, { WebSocketServer } from 'ws';
import { AppDataSource } from '@/db/data-source';
import { Comment } from '@/entities/comment';
import { Post } from '@/entities/post';
import { User } from '@/entities/user';
let wss;
export function setupWebSocketServer(server) {
    wss = new WebSocketServer({ server });
    wss.on('connection', (ws) => {
        console.log('New client connected');
        ws.on('message', async (message) => {
            console.log("Received message:", message); // Log the incoming message
            try {
                const { postId, content, userId } = JSON.parse(message);
                // Validate required fields
                if (!postId || !content || !userId) {
                    console.log("Missing required fields: postId, content, or userId");
                    return;
                }
                const commentRepo = AppDataSource.getRepository(Comment);
                const postRepo = AppDataSource.getRepository(Post);
                const userRepo = AppDataSource.getRepository(User);
                // Ensure that the post and user exist before creating a comment
                const post = await postRepo.findOneBy({ id: postId });
                const user = await userRepo.findOneBy({ id: userId });
                if (!post) {
                    console.log(`[WebSocket] Post not found with ID ${postId}`);
                    ws.send(JSON.stringify({ error: `Post with ID ${postId} not found` }));
                    return;
                }
                if (!user) {
                    console.log(`[WebSocket] User not found with ID ${userId}`);
                    ws.send(JSON.stringify({ error: `User with ID ${userId} not found` }));
                    return;
                }
                // Create new comment
                const newComment = new Comment();
                newComment.post = post;
                newComment.user = user;
                newComment.content = content;
                // Save the comment to the database
                const savedComment = await commentRepo.save(newComment);
                console.log(`[WebSocket] Saved comment: ${savedComment.id}`);
                // Broadcast the new comment to all connected clients
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) { // Ensure the connection is open
                        client.send(JSON.stringify({
                            postId,
                            content,
                            userId,
                            commentId: savedComment.id,
                            createdAt: savedComment.createdAt,
                            user: {
                                firstName: user.firstName,
                                lastName: user.lastName,
                            },
                        }));
                    }
                });
                console.log(`New comment added: ${savedComment.id}`);
            }
            catch (error) {
                console.error('Error processing message:', error);
                // Notify the client in case of error
                ws.send(JSON.stringify({ error: "An error occurred while processing your comment" }));
            }
        });
        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
}
export function getWebSocketServer() {
    return wss;
}

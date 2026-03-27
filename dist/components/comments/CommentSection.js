import { useEffect, useState, useRef, useCallback } from "react";
import { AppDataSource } from '@/db/data-source';
const CommentSection = ({ postId, userId }) => {
    // State management
    const [comments, setComments] = useState([]); // List of comments
    const [content, setContent] = useState(""); // Input field value
    const [isLoading, setIsLoading] = useState(true); // Loading state for initial fetch
    const [isSending, setIsSending] = useState(false); // Sending state for submit button
    const [connectionStatus, setConnectionStatus] = useState("connecting");
    // Use ref to avoid stale closure issues with WebSocket
    const wsRef = useRef(null);
    // Fetch existing comments from API
    const fetchComments = useCallback(async () => {
        console.log("[Comments] Fetching comments for post:", postId);
        setIsLoading(true);
        try {
            const response = await fetch(`/api/posts/comment?postId=${postId}`);
            const data = await response.json();
            console.log("[Comments] Fetched", data.comments?.length || 0, "comments");
            setComments(data.comments || []);
        }
        catch (error) {
            console.error("[Comments] Error fetching comments:", error);
        }
        finally {
            setIsLoading(false);
        }
    }, [postId]);
    // Function to save comment to the server (new method provided)
    const saveComment = async (postId, content, userId) => {
        console.log("[Comment] ========== SAVING COMMENT ==========");
        console.log("[Comment] PostId:", postId);
        console.log("[Comment] UserId:", userId);
        console.log("[Comment] Content:", content.substring(0, 50) + "...");
        const queryRunner = AppDataSource.createQueryRunner();
        try {
            // Checking post existence
            console.log("[Comment] Checking if post exists...");
            const postResult = await queryRunner.query(`SELECT id FROM posts WHERE id = $1`, [postId]);
            if (!postResult || postResult.length === 0) {
                console.error("[Comment] ERROR: Post not found:", postId);
                throw new Error("Post not found");
            }
            console.log("[Comment] Post found ✓");
            // Checking user existence
            console.log("[Comment] Checking if user exists...");
            const userResult = await queryRunner.query(`SELECT id, "firstName", "lastName", "avatarUrl" FROM users WHERE id = $1`, [userId]);
            if (!userResult || userResult.length === 0) {
                console.error("[Comment] ERROR: User not found:", userId);
                throw new Error("User not found");
            }
            console.log("[Comment] User found ✓");
            // Insert comment into database
            console.log("[Comment] Inserting comment...");
            const insertResult = await queryRunner.query(`INSERT INTO comments (content, "postId", "userId", "createdAt")
         VALUES ($1, $2, $3, NOW())
         RETURNING id, content, "createdAt"`, [content, postId, userId]);
            const savedComment = insertResult[0];
            console.log("[Comment] Comment saved successfully:", savedComment.id);
            // Return the saved comment for broadcasting
            return {
                id: savedComment.id,
                postId,
                content: savedComment.content,
                createdAt: savedComment.createdAt,
                user: {
                    id: userId,
                    firstName: userResult[0].firstName,
                    lastName: userResult[0].lastName,
                    avatarUrl: userResult[0].avatarUrl,
                },
            };
        }
        catch (error) {
            // Handle the 'unknown' error type correctly
            if (error instanceof Error) {
                console.error("[Comment] Error during saving:", error.message);
                throw error; // Re-throw the error after logging
            }
            else {
                console.error("[Comment] Unknown error occurred:", error);
                throw new Error("An unknown error occurred during saving.");
            }
        }
        finally {
            await queryRunner.release();
        }
    };
    // Set up WebSocket connection and event handlers
    useEffect(() => {
        // Fetch existing comments on mount
        fetchComments();
        // Create WebSocket connection to /ws endpoint
        console.log("[WebSocket] Connecting to ws://localhost:3000/ws...");
        const ws = new WebSocket("ws://localhost:3000/ws");
        wsRef.current = ws;
        // Connection opened successfully
        ws.onopen = () => {
            console.log("[WebSocket] Connection established");
            setConnectionStatus("connected");
        };
        // Handle incoming messages (new comments from server)
        ws.onmessage = (event) => {
            console.log("[WebSocket] Received message:", event.data);
            try {
                const response = JSON.parse(event.data);
                // Check if server returned an error
                if (response.error) {
                    console.error("[WebSocket] Server error:", response.error);
                    setIsSending(false);
                    return;
                }
                // Process valid comment response
                const newComment = response;
                console.log("[WebSocket] New comment received for post:", newComment.postId);
                // Only add comment if it belongs to this post
                if (newComment.postId === postId) {
                    setComments((prevComments) => {
                        // Avoid duplicates by checking if comment already exists
                        const exists = prevComments.some((c) => c.id === newComment.id);
                        if (exists) {
                            console.log("[WebSocket] Comment already exists, skipping");
                            return prevComments;
                        }
                        console.log("[WebSocket] Adding new comment to list");
                        return [newComment, ...prevComments];
                    });
                }
                setIsSending(false);
            }
            catch (error) {
                console.error("[WebSocket] Error parsing message:", error);
                setIsSending(false);
            }
        };
        // Handle connection errors
        ws.onerror = (error) => {
            console.error("[WebSocket] Connection error:", error);
            setConnectionStatus("error");
        };
        // Handle connection close
        ws.onclose = () => {
            console.log("[WebSocket] Connection closed");
            setConnectionStatus("disconnected");
        };
        // Cleanup: close WebSocket when component unmounts or postId changes
        return () => {
            console.log("[WebSocket] Cleaning up connection...");
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
            wsRef.current = null;
        };
    }, [postId, fetchComments]);
    // Handle posting a new comment via WebSocket
    const postComment = async () => {
        // Early return if the comment input is empty
        if (!content.trim()) {
            console.warn("[Comments] Cannot post empty comment");
            return;
        }
        const ws = wsRef.current;
        // Check if WebSocket is connected
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("[WebSocket] Not connected. Unable to send comment.");
            setConnectionStatus("disconnected"); // Update UI to reflect disconnection
            return;
        }
        console.log("[WebSocket] Sending comment...");
        // Set sending state to true when we are sending the comment
        setIsSending(true);
        try {
            // Send comment to the WebSocket server
            ws.send(JSON.stringify({
                postId,
                content: content.trim(),
                userId,
            }));
            // Clear the input field after sending the comment for better UX
            setContent("");
            // Handle the WebSocket response when the server confirms the comment
            ws.onmessage = (event) => {
                try {
                    const response = JSON.parse(event.data);
                    console.log("[WebSocket] Response from server:", response);
                    // If the response contains commentId, update the UI and stop the sending state
                    if (response.commentId) {
                        setIsSending(false); // Stop the "sending..." state
                        setComments((prevComments) => {
                            // Ensure no duplicate comments by checking the comment ID
                            const commentExists = prevComments.some((comment) => comment.id === response.commentId);
                            if (!commentExists) {
                                console.log("[WebSocket] New comment added:", response.commentId);
                                return [response, ...prevComments]; // Add the new comment to the list
                            }
                            console.log("[WebSocket] Comment already exists, skipping...");
                            return prevComments;
                        });
                    }
                }
                catch (error) {
                    console.error("[WebSocket] Error processing message:", error);
                    setIsSending(false); // Ensure we stop sending if an error occurs
                }
            };
        }
        catch (error) {
            console.error("[WebSocket] Error sending comment:", error);
            setIsSending(false); // Stop sending state if something goes wrong
        }
    };
    // Handle Enter key to submit comment
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            postComment();
        }
    };
    return (<div className="comment-section">
            {/* Header with connection status indicator */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Comments</h3>
                <span className={`text-xs px-2 py-1 rounded ${connectionStatus === "connected"
            ? "bg-green-100 text-green-800"
            : connectionStatus === "connecting"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"}`}>
                    {connectionStatus === "connected" ? "● Live" : connectionStatus === "connecting" ? "Connecting..." : "Disconnected"}
                </span>
            </div>

            {/* Comments list */}
            <div className="space-y-3 mb-4">
                {isLoading ? (<p className="text-gray-500">Loading comments...</p>) : comments.length === 0 ? (<p className="text-gray-500">No comments yet. Be the first to comment!</p>) : (comments.map((comment) => (<div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <strong className="text-sm">
                                    {comment.user.firstName} {comment.user.lastName || ""}
                                </strong>
                                {comment.createdAt && (<span className="text-xs text-gray-400">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </span>)}
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                        </div>)))}
            </div>

            {/* Comment input form */}
            <div className="flex gap-2">
                <textarea value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={handleKeyPress} placeholder="Write a comment... (Press Enter to send)" className="flex-1 p-2 border rounded-lg resize-none" rows={2} disabled={connectionStatus !== "connected" || isSending}/>
                <button onClick={postComment} disabled={!content.trim() || connectionStatus !== "connected" || isSending} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed">
                    {isSending ? "Sending..." : "Post"}
                </button>
            </div>
        </div>);
};
export default CommentSection;

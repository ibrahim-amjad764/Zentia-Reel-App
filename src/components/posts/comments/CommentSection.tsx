import { useEffect, useState, useRef, useCallback } from "react";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar"
import { Textarea } from "../../../../components/ui/textarea"
import { Button } from "../../../../components/ui/button"

interface Comment {
  id: string;
  postId: string;
  user: {
    id?: string;
    firstName: string;
    lastName?: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt?: string;
}

interface CommentSectionProps {
  postId: string;
  userId: string;
}

interface TextareaButtonProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function TextareaButton({
  value,
  onChange,
  onSend,
  onKeyDown,
  disabled,
  placeholder = "Type your message here.",
}: TextareaButtonProps) {
  return (
    <div className="grid w-full gap-2">
      <Textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        onKeyDown={onKeyDown}
        className="h-20 w-full rounded-2xl surface-glass border border-white/12 text-foreground placeholder:text-muted-foreground/70 ring-neon" />
      <Button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="rounded-full disabled:cursor-not-allowed"
      >
        Send message
      </Button>
    </div>
  );
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

const CommentSection = ({ postId, userId }: CommentSectionProps) => {
  // State management
  const [comments, setComments] = useState<Comment[]>([]); // List of comments
  const [content, setContent] = useState<string>(""); // Input field value
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state for initial fetch
  const [isSending, setIsSending] = useState<boolean>(false); // Sending state for submit button
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");

  const wsRef = useRef<WebSocket | null>(null);

  const fetchComments = useCallback(async () => {
    console.log("[Comments] Fetching comments for post:", postId);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/posts/comment?postId=${postId}`);
      const data = await response.json();
      console.log("[Comments] Fetched", data.comments?.length || 0, "comments");
      setComments(data.comments || []);
    } catch (error) {
      console.error("[Comments] Fetch error");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    let isActive = true; // prevents state updates after cleanup

    console.log(`[WebSocket] Effect triggered for postId: ${postId}`);

    fetchComments();

    //  Use environment variable for WebSocket URL
    const WS_BASE_URL = process.env.NEXT_PUBLIC_COMMENTS_WS_URL;

    if (!WS_BASE_URL) {
      console.log("[WebSocket] NEXT_PUBLIC_COMMENTS_WS_URL not set - skipping realtime WebSocket and using HTTP only");
      setConnectionStatus("disconnected");

      return () => {
        isActive = false;
        if (wsRef.current) {
          try {
            wsRef.current.close();
          } catch (error) {
            console.error("[WebSocket] Error closing WebSocket during env-disabled cleanup:", error);
          } finally {
            wsRef.current = null;
          }
        }
      };
    }

    console.log(`[WebSocket] Connecting to ${WS_BASE_URL}...`);
    console.log("[WebSocket] Note: If connection fails, WebSocket server may not be running or URL is incorrect");

    // Use WebSocket with error handling and fallback
    let ws: WebSocket | null = null;

    try {
      console.log("[WebSocket] Attempting to create WebSocket connection...");
      ws = new WebSocket(`${WS_BASE_URL}?userId=${userId}`); // ✅ here we explicitly use env variable
      wsRef.current = ws;
      console.log("[WebSocket] WebSocket object created successfully");
    } catch (error) {
      console.error("[WebSocket] Failed to create WebSocket:", error);
      setConnectionStatus("error");
      console.log("[WebSocket] Falling back to HTTP-only mode - comments will work without real-time updates");
      return;
    }

    // -------------------------
    // OPEN
    // -------------------------
    ws.onopen = () => {
      if (!isActive) return;

      console.log("[WebSocket] Connection established");
      setConnectionStatus("connected");
    };

    // -------------------------
    // MESSAGE
    // -------------------------
    ws.onmessage = (event) => {
      if (!isActive) return;

      console.log("[WebSocket] Raw message received:", event.data);

      try {
        const response = JSON.parse(event.data);

        if (response.type === 'new_comment') {
          const newComment = response.comment;

          if (!newComment) {
            console.error("[WebSocket] No comment data in new_comment message");
            return;
          }

          console.log(`[WebSocket] Parsed comment (id: ${newComment.id}) for post: ${newComment.postId}`);

          // Only update if this socket instance is still current
          if (wsRef.current !== ws) {
            console.warn("[WebSocket] Stale socket message ignored");
            return;
          }

          if (newComment.postId === postId) {
            // Update the comment section with new comment (without duplicates)
            setComments((prev) => {
              if (prev.some((c) => c.id === newComment.id)) return prev; // Avoid duplicates
              return [newComment, ...prev]; // Add new comment at the top
            });
          }

          setIsSending(false);
        } else if (response.type === 'comment_saved') {
          // Comment was saved successfully
          console.log("[WebSocket] Comment saved confirmation received");
          setIsSending(false);
        } else if (response.type === 'connection') {
          // Connection established message
          console.log("[WebSocket] Connection confirmation received");
        } else if (response.error) {
          console.error("[WebSocket] Server error:", response.error);
          setIsSending(false);
        } else {
          // Handle legacy format (direct comment object)
          const newComment: Comment = response;

          console.log(`[WebSocket] Parsed legacy comment (id: ${newComment.id}) for post: ${newComment.postId}`);

          // Only update if this socket instance is still current
          if (wsRef.current !== ws) {
            console.warn("[WebSocket] Stale socket message ignored");
            return;
          }

          if (newComment.postId === postId) {
            // Update the comment section with new comment (without duplicates)
            setComments((prev) => {
              if (prev.some((c) => c.id === newComment.id)) return prev; // Avoid duplicates
              return [newComment, ...prev]; // Add new comment at the top
            });
          }

          setIsSending(false);
        }
      } catch (error) {
        console.error("[WebSocket] JSON parse error:", error);
        setIsSending(false);
      }
    };

    // -------------------------
    // ERROR
    // -------------------------
    ws.onerror = (error) => {
      if (!isActive) return;

      // Silent handling - WebSocket server not running is expected behavior
      console.log("[WebSocket] WebSocket server not available - using HTTP fallback");
      setConnectionStatus("disconnected");
    };

    // -------------------------
    // CLOSE
    // -------------------------
    ws.onclose = (event) => {
      if (!isActive) return;

      console.log(
        `[WebSocket] Connection closed (code: ${event.code}, reason: ${event.reason})`
      );

      setConnectionStatus("disconnected");
    };

    return () => {
      console.log(
        `[WebSocket] Cleaning up connection for postId: ${postId}`
      );

      isActive = false;

      if (wsRef.current === ws && ws) {
        console.log("[WebSocket] Setting wsRef.current to null");
        wsRef.current = null;
      }

      // Always close — safe even if CONNECTING
      if (ws) {
        console.log("[WebSocket] Closing WebSocket connection");
        try {
          ws.close();
        } catch (error) {
          console.error("[WebSocket] Error closing WebSocket:", error);
        }
      }
    };
  }, [postId, fetchComments]);

  const postComment = async () => {
    if (!content.trim()) {
      console.warn("[Comments] Cannot post empty comment");
      return;
    }

    const ws = wsRef.current;

    // Check if WebSocket is connected, fallback to HTTP if not
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log("[Comments] WebSocket not connected, using HTTP fallback");
      setConnectionStatus("disconnected");

      // HTTP fallback for posting comments
      try {
        setIsSending(true);
        console.log("[Comments] Posting comment via HTTP...");

        const response = await fetch('/api/posts/comment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId,
            content: content.trim(),
            userId
          })
        });

        if (response.ok) {
          console.log("[Comments] Comment posted successfully via HTTP");
          setContent("");
          await fetchComments(); // Refresh comments
        } else {
          console.error("[Comments] Failed to post comment via HTTP:", response.status);
        }
      } catch (error) {
        console.error("[Comments] Error posting comment via HTTP:", error);
      } finally {
        setIsSending(false);
      }
      return;
    }

    console.log("[WebSocket] Sending comment...");
    setIsSending(true);

    try {
      // Send comment to the WebSocket server
      ws.send(
        JSON.stringify({
          type: "comment",
          postId,
          content: content.trim(),
          userId
        })
      );

      // Clear the input field after sending the comment for better UX
      setContent("");
      // Don't fetch comments here - wait for WebSocket response
    } catch (error) {
      console.error("[WebSocket] Error sending comment:", error);
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCommentButtonClick();
    }
  };

  const handleCommentButtonClick = () => {
    if (isSending) return;
    if (!content.trim()) return;

    postComment();
  };

  return (
    <div className="comment-section surface-glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold tracking-tight text-foreground">Comments</h3>
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${connectionStatus === "connected"
            ? "bg-[oklch(0.80_0.10_165)] text-black"
            : connectionStatus === "connecting"
              ? "bg-[oklch(0.84_0.10_95)] text-black"
              : "bg-[oklch(0.70_0.20_25)] text-white"} transition-all duration-300 shadow-[0_0_0_1px_oklch(1_0_0/12%)]`}>
          {connectionStatus === "connected" ? "● Live" : connectionStatus === "connecting" ? "Connecting..." : "Disconnected"}
        </span>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex gap-4 animate-pulse">
            <div className="h-10 w-10 bg-white/10 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
              <div className="h-2 bg-white/10 rounded w-3/4"></div>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map((comment, index) => (
            <div key={comment.id ?? `comment-${index}`} className="space-y-2">
              <div className="flex gap-4 items-start p-3 bg-white/4 border border-white/10 rounded-2xl shadow-[0_20px_60px_-50px_rgba(0,0,0,0.85)] transition-[transform,background-color,border-color] duration-200 ease-out hover:bg-white/6 hover:border-white/14 hover:-translate-y-0.5">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>{comment.user.firstName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex gap-1 items-center">
                      <strong className="text-sm font-medium text-foreground/90">
                        {comment.user.firstName} {comment.user.lastName || ""}
                      </strong>
                      {comment.createdAt && (
                        <span className="text-xs text-muted-foreground italic">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/90">{comment.content}</p>
                </div>
              </div>
              {/* Add hr between comments except after the last one */}
              {index !== comments.length - 1 && (
                <hr className="border-white/10" />
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt text-sm text-gray-500 italic ">
        <TextareaButton
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onSend={handleCommentButtonClick}
          disabled={isSending}
          onKeyDown={handleKeyPress}
          placeholder="Write a comment... (Press Enter to send)" />
      </div>
    </div>
  );
};

export default CommentSection;
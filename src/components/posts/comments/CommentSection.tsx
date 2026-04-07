import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { Textarea } from "../../../../components/ui/textarea";
import { Button } from "../../../../components/ui/button";
import { MessageCircle, Plus, Loader2 } from "lucide-react";

/**
 * Zentia Premium Comment Section
 * 
 * Purpose: Provides a real-time, visually rich discussion interface for posts.
 * 
 * Design: Features soft color integration, glassmorphism, and smooth animations
 * that align with the Zentia brand identity (Coral, Peach, Slate).
 */

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

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

const CommentSection = ({ postId, userId }: CommentSectionProps) => {
  // --- State management ---
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");

  const wsRef = useRef<WebSocket | null>(null);

  // --- Data Fetching ---
  const fetchComments = useCallback(async () => {
    console.log("[Zentia Discussions] Retrieving archives for:", postId);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/posts/comment?postId=${postId}`);
      if (!response.ok) throw new Error("Connection failed");
      const data = await response.json();
      setComments(data.comments || []);
      console.log(`[Zentia Discussions] ${data.comments?.length || 0} signals synchronized.`);
    } catch (error) {
      console.error("[Zentia Discussions] Archive retrieval failure:", error);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  // --- Real-time Logic (WebSocket) ---
  useEffect(() => {
    let isActive = true;
    fetchComments();

    const WS_BASE_URL = process.env.NEXT_PUBLIC_COMMENTS_WS_URL;

    if (!WS_BASE_URL) {
      console.log("[Zentia Real-time] Stream URL not found. Falling back to HTTP.");
      setConnectionStatus("disconnected");
      return () => { isActive = false; };
    }

    let ws: WebSocket | null = null;

    try {
      console.log("[Zentia Real-time] Attempting stream connection...");
      ws = new WebSocket(`${WS_BASE_URL}?userId=${userId}`);
      wsRef.current = ws;
    } catch (error) {
      console.error("[Zentia Real-time] Stream connection failed:", error);
      setConnectionStatus("error");
      return;
    }

    ws.onopen = () => {
      if (!isActive) return;
      console.log("[Zentia Real-time] Discussion stream established.");
      setConnectionStatus("connected");
    };

    ws.onmessage = (event) => {
      if (!isActive) return;
      try {
        const response = JSON.parse(event.data);
        if (response.type === 'new_comment' || !response.type) {
          const newComment = response.comment || response;
          if (newComment.postId === postId) {
            setComments(prev => {
              if (prev.some(c => c.id === newComment.id)) return prev;
              return [newComment, ...prev];
            });
            setIsSending(false);
            console.log("[Zentia Real-time] New spark received.");
          }
        }
      } catch (err) {
        console.error("[Zentia Real-time] Message parse error");
      }
    };

    ws.onerror = () => {
      if (!isActive) return;
      console.log("[Zentia Real-time] Discussion stream interrupted. Auto-recovering via HTTP.");
      setConnectionStatus("disconnected");
    };

    ws.onclose = () => {
      if (!isActive) return;
      setConnectionStatus("disconnected");
    };

    return () => {
      isActive = false;
      if (ws) ws.close();
    };
  }, [postId, userId, fetchComments]);

  // --- Handlers ---
  const postComment = async () => {
    if (!content.trim() || isSending) return;
    setIsSending(true);

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      // HTTP Fallback
      try {
        console.log("[Zentia Discussions] Posting spark via HTTP...");
        const response = await fetch('/api/posts/comment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, content: content.trim(), userId })
        });

        if (response.ok) {
          setContent("");
          await fetchComments();
        }
      } catch (err) {
        console.error("[Zentia Discussions] Post failure");
      } finally {
        setIsSending(false);
      }
      return;
    }

    // WebSocket Send
    console.log("[Zentia Real-time] Broadcasting spark...");
    ws.send(JSON.stringify({ type: "comment", postId, content: content.trim(), userId }));
    setContent("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      postComment();
    }
  };

  return (
    <div className="p-6 pt-2 space-y-6">
      {/* Discussion Header */}
      <div className="flex items-center justify-between border-b border-[#FFDAB9]/20 pb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#4A4A4A] dark:text-gray-300">Discussions</h3>
          <span className="bg-[#FF7F50]/10 text-[#FF7F50] px-2 py-0.5 rounded-lg text-[10px] font-bold">
            {comments.length}
          </span>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
          connectionStatus === "connected" 
            ? "border-[#00897B]/20 text-[#00897B] bg-[#E0F2F1]/50" 
            : "border-[#FFB74D]/20 text-[#FFB74D] bg-[#FFF3E0]/50"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === "connected" ? "bg-[#00897B] animate-pulse" : "bg-[#FFB74D]"}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {connectionStatus === "connected" ? "Live Signals" : "HTTP Feed"}
          </span>
        </div>
      </div>

      {/* Unified Input Field */}
      <div className="relative group bg-white/50 dark:bg-black/20 rounded-[2rem] p-1.5 border border-[#FFDAB9]/30 shadow-sm focus-within:border-[#FF7F50]/50 transition-all">
        <div className="flex items-end gap-2">
          <Avatar className="h-9 w-9 ml-1 mb-1 border-2 border-white dark:border-[#2A2A2A]">
            <AvatarFallback className="bg-gradient-to-br from-[#FFDAB9] to-[#FDE1D3] text-[#FF7F50] text-[10px] font-black uppercase text-center">
              ME
            </AvatarFallback>
          </Avatar>
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Spark a thought..."
            className="flex-1 min-h-[44px] max-h-[120px] bg-transparent border-none focus-visible:ring-0 resize-none py-3 px-2 text-sm text-[#4A4A4A] dark:text-white placeholder:text-[#94A3B8] transition-all"
            disabled={isSending}
          />
          <Button 
            size="icon"
            onClick={postComment}
            disabled={isSending || !content.trim()}
            className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#FF7E5F] to-[#FEB47B] text-white shadow-md active:scale-95 transition-all mb-1 mr-1"
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
          </Button>
        </div>
      </div>

      {/* Comment Stream */}
      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-none">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse opacity-50">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            </div>
          ))
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center opacity-30">
            <MessageCircle size={32} className="mb-2" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Silence has a beauty.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {comments.map((comment, i) => (
              <motion.div 
                key={comment.id || `c-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group/item flex gap-4 p-4 rounded-[1.75rem] border border-transparent hover:border-[#FFDAB9]/30 hover:bg-white/40 dark:hover:bg-white/5 transition-all duration-300"
              >
                <Avatar className="w-10 h-10 border-2 border-white dark:border-[#2A2A2A] shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-[#F5F5DC] to-[#FDE1D3] text-[#A8A29E] font-black text-[10px] uppercase">
                    {comment.user.firstName?.[0] || "Z"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#4A4A4A] dark:text-gray-200">
                      {comment.user.firstName} {comment.user.lastName || ""}
                    </span>
                    <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-tighter">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "Present"}
                    </span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-[#5A5A5A] dark:text-gray-400 font-medium">
                    {comment.content}
                  </p>
                  
                  <div className="flex items-center gap-4 pt-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button className="text-[10px] font-black text-[#FF7F50] uppercase tracking-tighter hover:underline">Reply</button>
                    <button className="text-[10px] font-black text-[#00897B] uppercase tracking-tighter hover:underline">Appreciate</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="pt-4 text-center border-t border-[#FFDAB9]/10">
         <p className="text-[8px] font-black text-[#94A3B8] uppercase tracking-[0.4em]">Zentia Conversation Field • Verified Signals</p>
      </div>
    </div>
  );
};

export default CommentSection;
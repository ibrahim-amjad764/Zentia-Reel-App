"use client";

/**
 * Zentia Premium Feed Page Component
 * 
 * Purpose: Provides a high-end, visually stunning social feed with 
 * enhanced interactions, premium aesthetics, and robust performance.
 * 
 * Features:
 * - Premium Class Design: Soft gradients, tinted surfaces, and glassmorphism.
 * - Zentia Color System: Warm beige, soft peach, vibrant coral accents.
 * - Immersive Media: Larger previews, soft rounded corners, and zoom-on-hover.
 * - Robust state management for infinite scroll and real-time interactions.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import InfiniteScroll from "react-infinite-scroll-component";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";

// UI Components from local library
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { SidebarProvider } from "../../components/ui/sidebar";
import { SkeletonLoader } from "../../components/ui/SkeletonLoader";
import { Button } from "../../components/ui/button";

// Icons
import {
  MessageCircle, Heart, Share2, Plus, Sparkles, TrendingUp, Users, Zap,
  Loader2, ChevronLeft, ChevronRight, Bookmark, MoreHorizontal,
  Play, Smile, Link as LinkIcon, Download, ChevronLeft as BackIcon, Mail
} from "lucide-react";

// Domain Components & Services
import { FollowButton } from "../../src/components/membership/profile-page/FollowButton";
import { searchUsers } from "../../src/services/user.service";
import { useDebounce } from "../../src/lib/useDebounce";
import { LikeButton } from "../../src/components/posts/likes/LikeButton";
import { authFetch } from "../../src/services/auth.service";
import CommentSection from "../../src/components/posts/comments/CommentSection";
import PremiumNavbar from "../../components/layout/PremiumNavbar";
import { CreatePostModal } from "../../src/components/posts/CreatePostModal";

// --- Interfaces ---

interface User {
  id: string;
  firstName?: string;
  lastName?: string | null;
  email: string;
  avatarUrl?: string;
}

interface Post {
  id: string;
  content: string;
  images?: string[];
  videos?: string[];
  createdAt: string;
  user: User;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  time?: string;
  isLikedByUser?: boolean;
  reactions?: Array<{ emoji: string; count: number; userReacted?: boolean }>;
}

interface FetchPostsResponse {
  posts: Post[];
  hasMore: boolean;
}

interface SearchUser {
  id: string | number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// --- API Service Functions ---

/** 
 * Fetch posts from the server with pagination support 
 * Includes detailed tracing for debugging and performance monitoring.
 */
const fetchPosts = async (page: number): Promise<FetchPostsResponse> => {
  try {
    console.log(`[API] Zentia Feed Fetch initiated: Page ${page}`);
    const res = await authFetch(`/api/posts?page=${page}&limit=10`);

    if (!res.ok) throw new Error(`Fetch Alert: ${res.status}`);

    const data = await res.json();
    console.log(`[API] Feed Synchronized: ${data.posts?.length || 0} signals received.`);

    return {
      posts: data.posts || [],
      hasMore: data.hasMore || false
    };
  } catch (error) {
    console.error("[API] Feed Synchronization Error:", error);
    toast.error("Connecting to the universe... Please wait.");
    return { posts: [], hasMore: false };
  }
};

// --- Sub-components ---

/**  
 * FeedPost Component: A premium card representing a unique moment in the Zentiaverse.
 * Redesigned with layered colors, gradients, and immersive micro-interactions.
 */
const FeedPost = React.memo(({
  post,
  activeIndex,
  isCommentSectionVisible,
  userId,
  handleCommentButtonClick,
  nextImage,
  prevImage,
  reactions,
  onReaction,
  onShare,
  onBookmark,
  isBookmarked,
}: {
  post: Post;
  activeIndex: number;
  isCommentSectionVisible: boolean;
  userId: string;
  handleCommentButtonClick: () => void;
  nextImage: (postId: string, length: number) => void;
  prevImage: (postId: string) => void;
  reactions?: Array<{ emoji: string; count: number; userReacted?: boolean }>;
  onReaction?: (emoji: string) => void;
  onShare?: (post: Post) => void;
  onBookmark?: (post: Post) => void;
  isBookmarked?: boolean;
}) => {
  const [showReactions, setShowReactions] = useState(false);

  // Optimized full name resolution
  const explorerName = useMemo(() =>
    `${post.user.firstName ?? 'Zentia Voyager'} ${post.user.lastName ?? ''}`.trim(),
    [post.user.firstName, post.user.lastName]
  );

  /**
   * ZEN DIRECTIONAL LOGIC (Optimized)
   * Tracks the gallery's motion vector synchronously.
   * Derived state from prop ensures zero-frame lag in animation direction.
   */
  const [[page, direction], setPage] = useState([activeIndex, 0]);

  if (activeIndex !== page) {
    const vector = activeIndex > page ? 1 : -1;
    console.log(`[Interaction] Vector Synchronized: ${vector} (${page} -> ${activeIndex})`);
    setPage([activeIndex, vector]);
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : dir < 0 ? '-100%' : 0,
      opacity: 1, // Keep opacity high for a continuous feel
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir > 0 ? '-100%' : dir < 0 ? '100%' : 0,
      opacity: 0.8, // Subtle fade to emphasize the incoming image
    })
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
      className="group/card relative mb-14"
    >
      <Card
        className="relative overflow-hidden rounded-[2.5rem] bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        {/* Subtle Gradient Glow Overlay */}
        {/* <div className="absolute inset-0 bg-gradient-to-tr from-[#FF7E5F]/5 via-transparent to-[#FEB47B]/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000 pointer-events-none" /> */}
        <div className="absolute inset-0 rounded-[2.5rem] border border-white/30 opacity-40 pointer-events-none" />

        {/* className="mb-6 relative overflow-hidden rounded-3xl bg-card border border-border shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5"> */}
        {/* Post Header */}
        <CardHeader className="flex flex-row items-center justify-between gap-4 p-6 pb-4 relative z-10">
          <div className="flex items-center gap-4">
            <Link
              href={`/profile/${post.user.id}`}
              className="relative group/avatar"
              onClick={() => console.log(`[Navigation] Viewing Explorer: ${post.user.id}`)}
            >
              <div className="absolute -inset-1.5 bg-gradient-to-br from-[#FF7E5F] to-[#FEB47B] rounded-full opacity-0 group-hover/avatar:opacity-100 blur-sm transition-all duration-700" />
              <Avatar className="h-13 w-13 border-2 border-white dark:border-[#1E1E1E] relative z-10 shadow-sm transition-transform duration-500 group-hover/avatar:scale-110">
                <AvatarFallback className="bg-gradient-to-br from-[#FDE1D3] to-[#FFDAB9] text-[#FF7E5F] font-black text-xl">
                  {post.user.email?.[0].toUpperCase() || "Z"}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex flex-col">
              <Link
                href={`/profile/${post.user.id}`}
                className="text-[20px] font-bold tracking-tight text-[#424242] dark:text-gray-100 hover:text-[#FF7E5F] transition-colors flex items-center gap-1.5"
              >
                {explorerName}
                {/* <Sparkles size={14} className="text-[#FF7E5F] opacity-0 group-hover/card:opacity-100 transition-opacity" /> */}
              </Link>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#9E9E9E] font-semibold tracking-wide uppercase">
                <span>{post.time ?? new Date(post.createdAt).toLocaleDateString()}</span>
                <span className="h-1 w-1 bg-[#9E9E9E]/40 rounded-full" />
                {/* <span className="text-[#00897B] font-bold">Premium Voyager</span> */}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FollowButton userId={post.user.id} />
            {/* <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all">
              <MoreHorizontal size={20} />
            </Button> */}
          </div>
        </CardHeader>

        {/* Visual Content Field */}
        <CardContent className="px-10 py-4 text-[16px] leading-[1.6] text-[#616161] dark:text-[#E0E0E0] font-medium whitespace-pre-wrap relative z-10 transition-colors">
          {post.content}
        </CardContent>

        {/* Reactions Display */}
        {reactions && reactions.length > 0 && (
          <div className="px-7 pb-3 flex items-center gap-3 flex-wrap">
            {reactions.map((reaction, index) => (
              <div
                key={reaction.emoji}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${reaction.userReacted
                  ? 'bg-[#FF7E5F]/15 text-[#FF7E5F] border border-[#FF7E5F]/30'
                  : 'bg-[#F5F5F5] text-[#757575] dark:bg-[#2A2A2A] dark:text-[#B0B0B0]'
                  }`}
              >
                <span className="text-base">{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Media Zone (High-Fidelity Image Slider) */}
        {post.images && post.images.length > 0 && (
          <div className="px-5 pb-5 relative z-20">
            <div className="relative group w-full h-[400px] md:h-[520px] overflow-hidden rounded-[2.2rem] shadow-sm bg-[#F5F5F5] dark:bg-black/20 border border-black/5 dark:border-white/5">
              
              {/* Precision Slide Engine (Directional & Ultra-Fluid) */}
              <div className="absolute inset-x-0 inset-y-0 select-none touch-none overflow-hidden rounded-[2.2rem]">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { duration: 0.7, ease: [0.32, 0.72, 0, 1] },
                      opacity: { duration: 0.5 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = offset.x;
                      const velocityX = velocity.x;
                      if (swipe < -50 || velocityX < -500) {
                        console.log(`[Interaction] Tactical Forward Pulse: ${post.id}`);
                        nextImage(post.id, post.images?.length ?? 0);
                      } else if (swipe > 50 || velocityX > 500) {
                        console.log(`[Interaction] Tactical Backward Pulse: ${post.id}`);
                        prevImage(post.id);
                      }
                    }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Image
                      src={post.images[activeIndex] || ""}
                      alt={`Zentia Signal ${activeIndex + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 group-hover:brightness-110 transition-all duration-[2000ms] easy-in-out"
                      priority={activeIndex === 0}
                      draggable={false}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Ambient Fade (Cinematic) */}
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Precision Carousel Controls */}
              {post.images.length > 1 && (
                <>
                  <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-all duration-500 z-[40]">
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-full h-12 w-12 bg-white/10 dark:bg-black/30 text-white backdrop-blur-xl border-white/20 hover:bg-[#FF7E5F] hover:border-[#FF7E5F] hover:scale-110 transition-all active:scale-90"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`[Interaction] Tactical Navigation Triggered (Prev): ${post.id}`);
                        prevImage(post.id);
                      }}
                    >
                      <ChevronLeft size={28} />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-full h-12 w-12 bg-white/10 dark:bg-black/30 text-white backdrop-blur-xl border-white/20 hover:bg-[#FF7E5F] hover:border-[#FF7E5F] hover:scale-110 transition-all active:scale-90"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`[Interaction] Tactical Navigation Triggered (Next): ${post.id}`);
                        nextImage(post.id, post.images?.length ?? 0);
                      }}
                    >
                      <ChevronRight size={28} />
                    </Button>
                  </div>

                  {/* Navigation Breadcrumbs (Advanced Dots) */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 z-[40]">
                    {post.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Custom jump logic could go here if needed
                        }}
                        className={`h-1.5 rounded-full transition-all duration-1000 ease-[0.19, 1, 0.22, 1] ${
                          idx === activeIndex 
                            ? 'w-10 bg-white shadow-[0_0_15px_rgba(255,255,255,1)]' 
                            : 'w-1.5 bg-white/30 hover:bg-white/60'
                        }`}
                        aria-label={`Jump to panel ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Global Action Field */}
        <CardFooter className="flex flex-col gap-5 px-7 py-6 relative z-10">
          {/* Subtle Action Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#FFDAB9]/40 dark:via-white/10 to-transparent" />

          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 md:gap-5">
              {/* Like Button (Design Preserved per request) */}
              <LikeButton
                postId={post.id}
                initialIsLiked={post.isLikedByUser || false}
                initialLikesCount={post.likesCount || 0}
                userId={userId}
              />

              {/* Comment Button (Design Preserved per request) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log(`[Interaction] Discussion opened for signal: ${post.id}`);
                  handleCommentButtonClick();
                }}
                className="group/btn flex items-center gap-2.5 rounded-full px-4 h-11 text-[#757575] dark:text-gray-400 hover:bg-[#FDE1D3]/40 hover:text-[#FF7E5F] transition-all"
              >
                <div className="relative">
                  <MessageCircle className="h-5 w-5 group-hover/btn:scale-110 transition-transform duration-300" />
                  {isCommentSectionVisible && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF7E5F] rounded-full border-2 border-white dark:border-[#1E1E1E]" />
                  )}
                </div>
                <span className="text-[14px] font-black">{post.commentsCount ?? 0}</span>
              </Button>

              {/* Reaction Trigger (Zentia Style) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log(`[Interaction] Pulse menu toggled for: ${post.id}`);
                  setShowReactions(!showReactions);
                }}
                className="hidden sm:flex items-center gap-2.5 rounded-full px-5 h-11 text-[#757575] dark:text-gray-400 bg-transparent hover:bg-gradient-to-r hover:from-[#FF7E5F] hover:to-[#FEB47B] hover:text-white transition-all shadow-none hover:shadow-lg active:scale-95 duration-500"
              >
                <Smile size={20} />
                <span className="text-[13px] font-black uppercase tracking-widest">Pulse</span>
              </Button>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare?.(post)}
                className="group flex flex-1 sm:flex-none items-center justify-center gap-2.5 rounded-full px-5 h-11 text-[#757575] dark:text-gray-400 bg-transparent hover:bg-gradient-to-r hover:from-[#FF7E5F] hover:to-[#FEB47B] hover:text-white transition-all duration-500"
              >
                <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="hidden xs:inline text-[13px] font-black uppercase tracking-widest">Broadcast</span>
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onBookmark?.(post)}
                className={`rounded-full h-11 w-11 transition-colors ${
                  isBookmarked 
                    ? "text-orange-400 hover:text-orange-500" 
                    : "text-[#757575] hover:text-[#FFDAB9]"
                }`}
              >
                <Bookmark 
                  size={22} 
                  className={`transition-all duration-300 ${
                    isBookmarked ? "fill-current scale-110" : ""
                  }`} 
                />
              </Button>
            </div>
          </div>
        </CardFooter>

        {/* Discussion Stream Overlay */}
        <AnimatePresence>
          {isCommentSectionVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
              className="overflow-hidden border-t border-[#FFDAB9]/20 dark:border-white/5 bg-white/30 dark:bg-black/10"
            >
              <CommentSection postId={post.id} userId={userId} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reaction Popover (Pulse System) */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 15 }}
              className="absolute bottom-24 left-10 px-4 py-2.5 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-2xl rounded-full border border-[#FFDAB9]/40 shadow-2xl z-50 flex items-center gap-5"
            >
              {["👍", "😊", "😂", "❤️", "🔥"].map((emoji) => (
                <button
                  key={emoji}
                  className="text-2xl hover:scale-[1.6] transition-transform duration-300 active:scale-90"
                  onClick={() => {
                    console.log(`[Interaction] Reacted with ${emoji} to signal: ${post.id}`);
                    setShowReactions(false);
                    onReaction?.(emoji);
                    // toast.success("Reaction Synchronized!");
                  }}
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
});

FeedPost.displayName = "FeedPost";

// --- Main Feed Page Controller ---

export default function FeedPage() {
  // --- Local State Engine ---
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [activeIndices, setActiveIndices] = useState<Record<string, number>>({});
  const [hydrationComplete, setHydrationComplete] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [visibleComments, setVisibleComments] = useState<Record<string, boolean>>({});
  const [postReactions, setPostReactions] = useState<Record<string, Array<{ emoji: string; count: number; userReacted?: boolean }>>>({});

  // Search state management
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Share state management
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareToast, setShareToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [currentSharePost, setCurrentSharePost] = useState<Post | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Bookmark state management
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bookmarkedPosts');
        console.log('[Bookmark] Loading saved bookmarks:', saved);
        if (saved) {
          const parsed = JSON.parse(saved) as string[];
          const bookmarkSet = new Set<string>(parsed);
          console.log('[Bookmark] Parsed bookmarks:', Array.from(bookmarkSet));
          setBookmarkedPosts(bookmarkSet);
        }
      } catch (error) {
        console.error('[Bookmark] Error loading bookmarks:', error);
        localStorage.removeItem('bookmarkedPosts');
      } finally {
        setBookmarksLoaded(true);
      }
    } else {
      setBookmarksLoaded(true);
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (bookmarksLoaded && typeof window !== 'undefined') {
      try {
        const bookmarkArray = Array.from(bookmarkedPosts);
        console.log('[Bookmark] Saving bookmarks to localStorage:', bookmarkArray);
        localStorage.setItem('bookmarkedPosts', JSON.stringify(bookmarkArray));
      } catch (error) {
        console.error('[Bookmark] Error saving bookmarks:', error);
      }
    }
  }, [bookmarkedPosts, bookmarksLoaded]);
  const debouncedQuery = useDebounce(query, 400);

  // --- External Data Pipeline ---
  const { data, isLoading, isError } = useQuery<FetchPostsResponse>({
    queryKey: ["zentia-feed-stream", page],
    queryFn: () => fetchPosts(page),
    retry: 2,
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60, // 1 minute signal freshness
  });

  // --- Global Lifecycle Loops ---
  useEffect(() => {
    document.title = "Zentia | Universe Feed";
    console.log("[Lifecycle] Zentia Feed System Handled.");
  }, []);

  useEffect(() => {
    if (!data) return;
    setHasMore(data.hasMore);
    setAllPosts((prev) => {
      if (page === 1) return data.posts;
      const existingIds = new Set(prev.map(p => p.id));
      const freshPeaks = data.posts.filter(p => !existingIds.has(p.id));
      return [...prev, ...freshPeaks];
    });
  }, [data, page]);

  useEffect(() => {
    if (!isLoading && !isError) {
      const timer = setTimeout(() => {
        setHydrationComplete(true);
        console.log("[UI] Zentia Visual Stream Hydrated.");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isError]);

  useEffect(() => {
    let active = true;
    const executeSearch = async () => {
      if (!debouncedQuery) {
        setUsers([]);
        return;
      }
      setSearchLoading(true);
      try {
        const results = await searchUsers(debouncedQuery);
        if (active) setUsers(results as SearchUser[]);
      } catch (err) {
        console.error("[Search] Signal Failure:", err);
      } finally {
        if (active) setSearchLoading(false);
      }
    };
    executeSearch();
    return () => { active = false; };
  }, [debouncedQuery]);

  // --- Logic Handlers ---
  const fetchNextSignal = useCallback(() => {
    if (!hasMore || loadingMore || isLoading) return;
    console.log("[Logic] Fetching next feed signal page...");
    setLoadingMore(true);
    setPage((p) => p + 1);
    setLoadingMore(false);
  }, [hasMore, loadingMore, isLoading]);

  const toggleDiscussion = useCallback((postId: string) => {
    setVisibleComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  }, []);

  const handleReaction = useCallback((postId: string, emoji: string) => {
    setPostReactions(prev => {
      const currentReactions = prev[postId] || [];
      const existingReactionIndex = currentReactions.findIndex(r => r.emoji === emoji);

      if (existingReactionIndex >= 0) {
        // Toggle existing reaction
        const updatedReactions = [...currentReactions];
        const reaction = updatedReactions[existingReactionIndex];
        if (reaction.userReacted) {
          reaction.count = Math.max(0, reaction.count - 1);
          reaction.userReacted = false;
        } else {
          reaction.count += 1;
          reaction.userReacted = true;
        }

        // Remove reaction if count is 0
        if (reaction.count === 0) {
          updatedReactions.splice(existingReactionIndex, 1);
        }

        return { ...prev, [postId]: updatedReactions };
      } else {
        // Add new reaction
        return {
          ...prev,
          [postId]: [...currentReactions, { emoji, count: 1, userReacted: true }]
        };
      }
    });
  }, []);

  const handleManualSearch = async () => {
    setSearchLoading(true);
    try {
      const results = await searchUsers(query);
      setUsers(results);
    } catch (err) {
      console.error("[Search] Manual Signal Fail:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Share handlers
  const showShareToast = (message: string) => {
    setShareToast({ message, visible: true });
    setTimeout(() => {
      setShareToast({ message: '', visible: false });
    }, 3000);
  };

  const handleShare = (platform: string, post: Post) => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const postTitle = post.content?.slice(0, 50) + '...' || 'Check out this post on Zentia!';
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(postUrl);
        showShareToast('Post link copied to clipboard!');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}&summary=${encodeURIComponent(postTitle)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(postTitle + ': ' + postUrl)}`, '_blank');
        break;
      case 'download':
        showShareToast('Download feature coming soon!');
        break;
    }
    setShowShareMenu(false);
  };

  const openShareMenu = (post: Post) => {
    setCurrentSharePost(post);
    setShowShareMenu(true);
  };

  // Bookmark handler
  const toggleBookmark = (post: Post) => {
    console.log('[Bookmark] Toggling bookmark for post:', post.id);
    console.log('[Bookmark] Current bookmarks:', Array.from(bookmarkedPosts));
    
    const isBookmarked = bookmarkedPosts.has(post.id);
    console.log('[Bookmark] Is bookmarked:', isBookmarked);
    
    if (isBookmarked) {
      // Remove bookmark
      setBookmarkedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        console.log('[Bookmark] Removed bookmark. New set:', Array.from(newSet));
        return newSet;
      });
      showShareToast('Post removed from bookmarks');
    } else {
      // Add bookmark
      setBookmarkedPosts(prev => {
        const newSet = new Set(prev).add(post.id);
        console.log('[Bookmark] Added bookmark. New set:', Array.from(newSet));
        return newSet;
      });
      showShareToast('Post saved to bookmarks');
    }
  };

  // --- Content Render Matrix ---
  const feedStreamContent = useMemo(() => {
    if (isLoading || !hydrationComplete) return <SkeletonLoader />;

    if (isError) return (
      <div className="flex flex-col items-center justify-center py-28 text-center bg-white/20 dark:bg-black/10 backdrop-blur-xl rounded-[3rem] border border-red-200/20">
        <Sparkles className="h-12 w-12 text-[#FF7E5F] mb-6 animate-pulse" />
        <h3 className="text-xl font-black text-[#424242] dark:text-white tracking-tight">Signal Interruption</h3>
        <p className="text-[#9E9E9E] mt-3 max-w-sm font-semibold">The universe is recalibrating. Restore connection to resume your stream.</p>
        <Button
          variant="outline"
          className="mt-8 rounded-full px-10 h-12 border-[#FF7E5F] text-[#FF7E5F] hover:bg-[#FF7E5F] hover:text-white transition-all font-black uppercase tracking-widest"
          onClick={() => window.location.reload()}
        >
          Restore Pulse
        </Button>
      </div>
    );

    if (allPosts.length === 0) return (
      <div className="flex flex-col items-center justify-center py-32 text-center bg-white/20 dark:bg-black/20 backdrop-blur-3xl rounded-[4rem]">
        <div className="w-24 h-24 rounded-full bg-[#FFDAB9]/20 flex items-center justify-center mb-8">
          <Zap size={40} className="text-[#FF7E5F]/50" />
        </div>
        <h3 className="text-2xl font-black text-[#424242] dark:text-white tracking-tighter">Quiet Horizon</h3>
        <p className="text-[#9E9E9E] mt-3 font-semibold">Be the first explorer to spark a discussion.</p>
      </div>
    );

    return (
      <InfiniteScroll
        dataLength={allPosts.length}
        next={fetchNextSignal}
        hasMore={hasMore}
        scrollThreshold={0.9}
        loader={
          <div className="flex justify-center p-16">
            <Loader2 className="h-10 w-10 text-[#FF7E5F] animate-spin opacity-40" />
          </div>
        }
        endMessage={
          <div className="flex flex-col items-center py-24 text-[#9E9E9E]">
            <Sparkles className="h-8 w-8 mb-4 text-[#FF7E5F] animate-bounce" />
            <p className="text-[12px] uppercase tracking-[0.5em] font-black">Universe Stream Complete</p>
          </div>
        }
      >
        <div className="space-y-0">
          {allPosts.map((post, idx) => (
            <FeedPost
              key={`${post.id}-${idx}`}
              post={post}
              activeIndex={activeIndices[post.id] ?? 0}
              isCommentSectionVisible={visibleComments[post.id] || false}
              handleCommentButtonClick={() => toggleDiscussion(post.id)}
              userId={post.user.id}
              nextImage={(pid, len) => setActiveIndices(prev => ({ ...prev, [pid]: Math.min((prev[pid] ?? 0) + 1, len - 1) }))}
              prevImage={(pid) => setActiveIndices(prev => ({ ...prev, [pid]: Math.max((prev[pid] ?? 0) - 1, 0) }))}
              reactions={postReactions[post.id] || []}
              onReaction={(emoji: string) => handleReaction(post.id, emoji)}
              onShare={openShareMenu}
              onBookmark={toggleBookmark}
              isBookmarked={bookmarkedPosts.has(post.id)}
            />
          ))}
        </div>
      </InfiniteScroll>
    );
  }, [allPosts, isLoading, hydrationComplete, isError, hasMore, activeIndices, visibleComments, fetchNextSignal, toggleDiscussion, postReactions, handleReaction, bookmarkedPosts, bookmarksLoaded]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col font-sans antialiased overflow-x-hidden">

        {/* Zentia Custom Navbar (Structure Preserved) */}
        <PremiumNavbar
          query={query}
          setQuery={setQuery}
          handleSearch={handleManualSearch}
          searchLoading={searchLoading}
          users={users}
        />

        {/* Redesigned Background System (Warm Gradients) */}
        <div className="fixed inset-0 -z-50 bg-[#FDFCFB] dark:bg-[#020203]" />
        <div className="fixed inset-0 -z-40 bg-gradient-to-br from-[#FDFCFB] via-[#FFF1E6] to-[#FFE5D9] dark:from-[#0F172A] dark:via-[#09090B] dark:to-[#171717]" />

        {/* Dynamic Glow Entities */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-30 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#FFDAB9]/15 dark:bg-[#FF7E5F]/5 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute bottom-[20%] right-[-5%] w-[50%] h-[50%] bg-[#00897B]/5 dark:bg-[#1E88E5]/5 rounded-full blur-[140px]" />
        </div>

        {/* Precision Tech Grid Overlay */}
        <div className="fixed inset-0 -z-20 pointer-events-none opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(#FF7E5F 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black 10%, transparent 90%)'
          }}
        />

        <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-20 relative z-10">

          {/* Premium Zentia Stat Dashboard
          <motion.div
            className="flex flex-nowrap md:flex-row justify-center items-center gap-3 md:gap-6 mb-12 md:mb-20 overflow-x-auto pb-4 no-scrollbar px-3 md:px-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
          >
            {[
              { icon: Users, label: "5.4K", sub: "Explorers", color: "text-[#FF4D4D]", bg: "bg-[#FF4D4D]/10", border: "border-[#FF4D4D]/10" },
              { icon: TrendingUp, label: "2.1K", sub: "Hot Signals", color: "text-[#00897B]", bg: "bg-[#00897B]/10", border: "border-[#00897B]/10" },
              { icon: Zap, label: "128K", sub: "Sparks", color: "text-[#FFD700]", bg: "bg-[#FFD700]/10", border: "border-[#FFD700]/10" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8, scale: 1.05 }}
                className={`group relative bg-white/50 dark:bg-zinc-900/40 backdrop-blur-3xl border ${stat.border} rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-7 text-center cursor-default transition-all duration-700 min-w-[110px] xs:min-w-[130px] sm:min-w-[200px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_35px_60px_-20px_rgba(0,0,0,0.1)]`}
              >
                <div className={`w-9 h-9 xs:w-11 xs:h-11 md:w-9 md:h-9 mx-auto mb-2 xs:mb-3 md:mb-4 rounded-lg xs:rounded-xl md:rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                  <stat.icon size={18} className="xs:size-18 md:size-18" />
                </div>
                <div className="text-lg xs:text-xl md:text-2xl font-black text-[#424242] dark:text-white tracking-tighter">{stat.label}</div>
                <div className="text-[8px] xs:text-[9px] md:text-[10px] uppercase font-black text-[#9E9E9E] tracking-[0.2em] xs:tracking-[0.3em] md:tracking-[0.3em] mt-1 xs:mt-2">{stat.sub}</div>
              </motion.div>
            ))}
          </motion.div> */}

          <div className="relative min-h-[700px] space-y-12">
            <AnimatePresence mode="wait">
              {feedStreamContent}
            </AnimatePresence>
          </div>
        </main>

        {/* Zentia Floating Action Hub */}
        <div className="fixed bottom-10 right-10 z-[100]">
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Button
              onClick={() => {
                console.log("[Interaction] Open Create Explorer Signal UI");
                setPostModalOpen(true);
              }}
              className="h-18 w-18 md:h-16 md:w-auto md:px-10 rounded-full shadow-[0_20px_50px_rgba(255,126,95,0.4)] hover:shadow-[0_25px_60px_rgba(255,126,95,0.6)] transition-all hover:-translate-y-2 group relative overflow-hidden bg-gradient-to-br from-[#FF7E5F] via-[#FF7E5F] to-[#FEB47B] border-none"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-4 text-white font-black text-xl">
                <Plus size={28} className="group-hover:rotate-90 transition-transform duration-700" />
                <span className="hidden md:inline uppercase tracking-[0.2em] text-sm">Universal Spark</span>
              </div>
            </Button>
          </motion.div>
        </div>

        <CreatePostModal open={postModalOpen} onClose={() => setPostModalOpen(false)} />
        
        {/* Share Dropdown Menu - YouTube Style Modal */}
        {showShareMenu && currentSharePost && createPortal(
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm" 
              onClick={() => setShowShareMenu(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md surface-glass rounded-3xl border border-white/20 dark:border-orange-500/30 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 dark:border-orange-500/20 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground dark:text-white">Share this post</h3>
                  <button
                    onClick={() => setShowShareMenu(false)}
                    className="w-8 h-8 rounded-full hover:bg-white/10 dark:hover:bg-orange-500/20 flex items-center justify-center transition-colors"
                  >
                    <BackIcon size={20} className="text-foreground dark:text-white rotate-180" />
                  </button>
                </div>
                
                {/* Post Preview */}
                <div className="px-6 py-4 border-b border-white/10 dark:border-orange-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                      {currentSharePost.user.firstName?.slice(0, 1) || 'U'}{currentSharePost.user.lastName?.slice(0, 1) || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground dark:text-white">
                        {currentSharePost.user.firstName} {currentSharePost.user.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground dark:text-white/60">
                        {currentSharePost.content?.slice(0, 50) || 'Share this post with others'}...
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Share Options */}
                <div className="p-4 space-y-2">
                  {/* Copy Link */}
                  <button
                    onClick={() => handleShare('copy', currentSharePost)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-primary/10 dark:hover:bg-orange-500/20 transition-all duration-200 text-left group"
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 dark:bg-orange-500/10 group-hover:bg-primary/20 dark:group-hover:bg-orange-500/30 transition-colors">
                      <LinkIcon size={18} className="text-muted-foreground group-hover:text-primary dark:group-hover:text-orange-400 transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-medium text-foreground dark:text-white group-hover:text-primary dark:group-hover:text-orange-400 transition-colors">Copy link</div>
                      <div className="text-sm text-muted-foreground dark:text-white/60">Copy post URL to clipboard</div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-orange-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <BackIcon size={14} className="text-primary dark:text-orange-400 rotate-180" />
                    </div>
                  </button>
                  
                  {/* Twitter */}
                  <button
                    onClick={() => handleShare('twitter', currentSharePost)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-primary/10 dark:hover:bg-orange-500/20 transition-all duration-200 text-left group"
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-sky-500/10 group-hover:bg-sky-500/20 transition-colors">
                      <Share2 size={18} className="text-sky-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-medium text-foreground dark:text-white group-hover:text-sky-500 transition-colors">Twitter</div>
                      <div className="text-sm text-muted-foreground dark:text-white/60">Share to your followers</div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-sky-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <BackIcon size={14} className="text-sky-500 rotate-180" />
                    </div>
                  </button>
                  
                  {/* Facebook */}
                  <button
                    onClick={() => handleShare('facebook', currentSharePost)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-primary/10 dark:hover:bg-orange-500/20 transition-all duration-200 text-left group"
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                      <div className="w-5 h-5 bg-blue-500 rounded-sm group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-medium text-foreground dark:text-white group-hover:text-blue-500 transition-colors">Facebook</div>
                      <div className="text-sm text-muted-foreground dark:text-white/60">Share with friends</div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <BackIcon size={14} className="text-blue-500 rotate-180" />
                    </div>
                  </button>
                  
                  {/* LinkedIn */}
                  <button
                    onClick={() => handleShare('linkedin', currentSharePost)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-primary/10 dark:hover:bg-orange-500/20 transition-all duration-200 text-left group"
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-700/10 group-hover:bg-blue-700/20 transition-colors">
                      <div className="w-5 h-5 bg-blue-700 rounded-sm group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-medium text-foreground dark:text-white group-hover:text-blue-700 transition-colors">LinkedIn</div>
                      <div className="text-sm text-muted-foreground dark:text-white/60">Share professionally</div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-blue-700/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <BackIcon size={14} className="text-blue-700 rotate-180" />
                    </div>
                  </button>
                  
                  {/* WhatsApp */}
                  <button
                    onClick={() => handleShare('whatsapp', currentSharePost)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-primary/10 dark:hover:bg-orange-500/20 transition-all duration-200 text-left group"
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                      <Share2 size={18} className="text-green-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-medium text-foreground dark:text-white group-hover:text-green-500 transition-colors">WhatsApp</div>
                      <div className="text-sm text-muted-foreground dark:text-white/60">Share via chat</div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <BackIcon size={14} className="text-green-500 rotate-180" />
                    </div>
                  </button>
                  
                  {/* Download Post */}
                  <button
                    onClick={() => handleShare('download', currentSharePost)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-primary/10 dark:hover:bg-orange-500/20 transition-all duration-200 text-left group"
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 dark:bg-orange-500/10 group-hover:bg-primary/20 dark:group-hover:bg-orange-500/30 transition-colors">
                      <Download size={18} className="text-muted-foreground group-hover:text-primary dark:group-hover:text-orange-400 transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-medium text-foreground dark:text-white group-hover:text-primary dark:group-hover:text-orange-400 transition-colors">Download post</div>
                      <div className="text-sm text-muted-foreground dark:text-white/60">Save post data</div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-orange-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <BackIcon size={14} className="text-primary dark:text-orange-400 rotate-180" />
                    </div>
                  </button>
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 dark:border-orange-500/20">
                  <button
                    onClick={() => setShowShareMenu(false)}
                    className="w-full py-3 rounded-2xl bg-muted/50 dark:bg-orange-500/10 hover:bg-muted dark:hover:bg-orange-500/20 transition-colors text-sm font-medium text-foreground dark:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>,
          document.body
        )}
        
        {/* Share Toast Notification */}
        {shareToast.visible && createPortal(
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[10001]"
          >
            <div className="surface-glass px-6 py-4 rounded-2xl border border-white/20 dark:border-orange-500/30 shadow-2xl flex items-center gap-3 min-w-[300px]">
              <div className="w-8 h-8 rounded-full bg-primary/20 dark:bg-orange-500/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-primary dark:bg-orange-500 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground dark:text-white">
                  {shareToast.message}
                </div>
              </div>
            </div>
          </motion.div>,
          document.body
        )}
      </div>
    </SidebarProvider>
  );
}
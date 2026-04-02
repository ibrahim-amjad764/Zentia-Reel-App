"use client";

/**
 * Zentia Feed Page Component
 * 
 * Purpose: Provides a dynamic, infinite-scrolling social feed with image carousels,
 * search functionality, real-time stats, and interactive post features.
 * 
 * Features:
 * - Dynamic Stats Bar with glassmorphism
 * - Infinite scrolling for performance
 * - Multi-image carousel with indicators
 * - Integrated Notification and Search systems
 * - Premium UI/UX with Framer Motion animations
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import InfiniteScroll from "react-infinite-scroll-component";
import Image from "next/image";
import Link from "next/link";
// UI Components
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { PremiumModeToggle } from "../../components/ui/premium-mode-toggle";
import { ModeToggleButton } from "../../components/ui/mode-toggle";
import { SidebarProvider } from "../../components/ui/sidebar";
import { SkeletonLoader } from "../../components/ui/SkeletonLoader";
import { Button } from "../../components/ui/button";
import ProfileDropdown from "../../components/ui/dropdown-profile";
// Icons
import { MessageCircle, Heart, Share2, Plus, Sparkles, TrendingUp, Users, Zap, Loader2, ChevronLeft, ChevronRight, Search} from "lucide-react";
// Domain Components & Services
import { NotificationBell } from "../../src/components/notifications/NotificationBell";
import { CreatePostModal } from "../../src/components/posts/CreatePostModal";
import { FollowButton } from "../../src/components/membership/profile-page/FollowButton";
import { searchUsers } from "../../src/services/user.service";
import { useDebounce } from "../../src/lib/useDebounce";
import { LikeButton } from "../../src/components/posts/likes/LikeButton";
import { authFetch } from "../../src/services/auth.service";
import { auth } from "../../src/lib/firebase";
import SearchSuggestions from "../../src/components/notifications/SearchSuggestions";
import CommentSection from "../../src/components/posts/comments/CommentSection";
import SearchBar from "../../src/components/notifications/SearchBar";
// --- Interfaces ---

interface User {
  id: string;
  firstName?: string;
  lastName?: string | null;
  email: string;
}

interface Post {
  id: string;
  content: string;
  images?: string[];
  createdAt: string;
  user: User;
  likesCount?: number;
  time?: string;
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
/** Fetch posts from the server with pagination support */
const fetchPosts = async (page: number): Promise<FetchPostsResponse> => {
  try {
    console.log(`[API] Fetching posts for page ${page}...`);
    const res = await authFetch(`/api/posts?page=${page}&limit=5`);

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) throw new Error("Expected JSON, got something else.");

    const data = await res.json();
    console.log(`[API] Posts received: ${Array.isArray(data) ? data.length : data.posts?.length || 0}`);

    if (Array.isArray(data)) return { posts: data, hasMore: true };
    return { posts: data.posts || [], hasMore: data.hasMore || false };
  } catch (error) {
    console.error("[API] Error fetching posts:", error);
    return { posts: [], hasMore: false };
  }
};

// --- Sub-components ---
/**  FeedPost Component Optimized for readability and minimal nesting. */
const FeedPost = React.memo(({
  post,
  activeIndex,
  isCommentSectionVisible,
  userId,
  likedPosts,
  handleCommentButtonClick,
  nextImage,
  prevImage,
}: {
  post: Post;
  activeIndex: number;
  isCommentSectionVisible: boolean;
  userId: string;
  likedPosts: Set<string>;
  handleLike: (postId: string) => void;
  handleCommentButtonClick: () => void;
  nextImage: (postId: string, length: number) => void;
  prevImage: (postId: string) => void;
}) => {
  const isLiked = likedPosts.has(post.id);

  const fullName = useMemo(() =>
    `${post.user.firstName ?? 'Anonymous'} ${post.user.lastName ?? ''}`.trim(),
    [post.user.firstName, post.user.lastName]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      // Removed layout prop to prevent unwanted 'zoom' effects during item transitions
      className="group/card">
      <Card
        // onMouseEnter={() => console.log(`[UI] Hovering post: ${post.id}`)}
        // className="mb-6 relative overflow-visible rounded-[2.5rem] bg-white/95 dark:bg-zinc-900/98 backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:translate-y-0 hover:scale-100"
        // // style={{ border: 'none', outline: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)' }}
        className="mb-6 relative overflow-hidden rounded-3xl bg-card border border-border shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center justify-between gap-3 p-4" style={{ borderBottom: 'none' }}>
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.user.id}`} className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-purple-600 rounded-full opacity-0 group-hover:opacity-40 blur transition-opacity duration-300" />
              <Avatar className="h-11 w-11 border-2 border-white/20 dark:border-white/10 transition-transform group-hover:scale-105 relative z-10">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {post.user.email?.[0].toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex flex-col">
              <Link
                href={`/profile/${post.user.id}`}
                className="text-sm font-bold tracking-tight text-foreground transition-colors hover:text-primary"
                onClick={() => console.log(`[Interaction] Profile clicked: ${post.user.id}`)} >
                {fullName}
              </Link>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80">
                {post.time ?? new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <FollowButton userId={post.user.id} />
        </CardHeader>

        <CardContent className="px-5 py-2 text-sm leading-relaxed text-foreground/90" style={{ borderBottom: 'none' }}>
          {post.content}
        </CardContent>

        {/* Carousel Section - Removed mt-2 and added overflow-hidden for seamless fit */}
        {post.images && post.images.length > 0 && (
          <div className="relative group w-full h-[340px] overflow-hidden bg-black/10">
            <Image
              src={post.images[activeIndex] || ""}
              alt="Post Image"
              fill
              className="object-cover transition-opacity duration-300"
              loading="eager"/>

            {/* Ultra-Smooth Bottom Gradient Fade - Fixes Problem 2 & improves blend with footer */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-[5]" />

            {/* Carousel Controls - Only visible if more than 1 image */}
            {post.images.length > 1 && (
              <>
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full h-8 w-8 bg-black/20 text-white backdrop-blur-sm border-white/10"
                    onClick={() => {
                      console.log(`[Carousel] Previous image clicked for postId: ${post.id}`);
                      prevImage(post.id);
                    }}
                    disabled={activeIndex === 0}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full h-8 w-8 bg-black/20 text-white backdrop-blur-sm border-white/10"
                    onClick={() => {
                      console.log(`[Carousel] Next image clicked for postId: ${post.id}`);
                      nextImage(post.id, post.images?.length ?? 0);
                    }}
                    disabled={activeIndex === post.images!.length - 1}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Visual Indicators Overlay */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1 rounded-full bg-black/30 backdrop-blur-md">
                  {post.images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                        }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        {/* Transparent Footer - Eliminates the corner artifact by removing redundant internal layer backgrounds */}
        <CardFooter className="flex items-center justify-center gap-4 bg-transparent px-4 py-4 relative z-[6]" style={{ borderTop: 'none' }}>
          <LikeButton
            postId={post.id}
            initialIsLiked={isLiked}
            initialLikesCount={post.likesCount || 0}
            userId={userId}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log(`[Interaction] Comments toggled for postId: ${post.id}`);
              handleCommentButtonClick();
            }}
            className="flex items-center justify-center gap-2 rounded-xl text-muted-foreground transition-all hover:bg-primary/5 hover:text-primary active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Comments</span>
          </Button>

          {/* <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => console.log(`[Interaction] Share clicked for postId: ${post.id}`)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl text-muted-foreground transition-all hover:bg-primary/5 hover:text-primary active:scale-95"
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs font-medium">Share</span>
          </Button> */}
        </CardFooter>

        <AnimatePresence>
          {isCommentSectionVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-black/5"
            >
              <CommentSection postId={post.id} userId={userId} />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
});

FeedPost.displayName = "FeedPost";
// --- Main Component ---

export default function FeedPage() {
  // State
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [activeIndices, setActiveIndices] = useState<Record<string, number>>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [delayedLoading, setDelayedLoading] = useState(true);
  const [openPost, setOpenPost] = useState(false);
  const [isCommentSectionVisible, setIsCommentSectionVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  // Queries
  const { data, isLoading, isError } = useQuery<FetchPostsResponse>({
    queryKey: ["posts", page],
    queryFn: () => fetchPosts(page),
    retry: 2,
    placeholderData: (prev) => prev,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Effects
  useEffect(() => {
    document.title = "Feed | Zentia Universe";
    // console.log("[Lifecycle] FeedPage mounted");
  }, []);

  // Post Data Management
  useEffect(() => {
    if (!data) return;

    console.log(`[Data] Received ${data.posts.length} posts for page ${page}`);

    setHasMore(data.hasMore);

    setAllPosts((prev) => {
      if (page === 1) return data.posts;

      // Deduplicate by ID to prevent ghosting or duplicates
      const existingIds = new Set(prev.map((p) => p.id));
      const freshPosts = data.posts.filter((p) => !existingIds.has(p.id));

      if (freshPosts.length === 0 && data.posts.length > 0) {
        // console.warn("[Data] All received posts were duplicates.");
      }

      return [...prev, ...freshPosts];
    });
  }, [data, page]);

  // Handle fake Loading delay for premium feel
  useEffect(() => {
    if (!isLoading && !isError) {
      const timer = setTimeout(() => {
        setDelayedLoading(false);
        console.log("[UI] Skeleton loading cleared");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isError]);

  // Search Logic
  useEffect(() => {
    let isActive = true;

    const fetchUsers = async () => {
      if (!debouncedQuery) {
        setUsers([]);
        return;
      }

      console.log(`[Search] Querying for: ${debouncedQuery}`);
      setSearchLoading(true);

      try {
        const results = await searchUsers(debouncedQuery);
        if (isActive) setUsers(results as SearchUser[]);
      } catch (err) {
        console.error("[Search] Failed to fetch users:", err);
      } finally {
        if (isActive) setSearchLoading(false);
      }
    };

    fetchUsers();
    return () => { isActive = false; };
  }, [debouncedQuery]);

  // Interaction Handlers
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    // console.log("[UI] Loading more posts triggered...");

    // Smooth transition delay
    await new Promise((res) => setTimeout(res, 800));
    setPage((prev) => prev + 1);
    setLoadingMore(false);
  }, [hasMore, loadingMore]);

  const nextImage = useCallback((postId: string, length: number) => {
    setActiveIndices((prev) => ({
      ...prev,
      [postId]: Math.min((prev[postId] ?? 0) + 1, length - 1)
    }));
  }, []);

  const prevImage = useCallback((postId: string) => {
    setActiveIndices((prev) => ({
      ...prev,
      [postId]: Math.max((prev[postId] ?? 0) - 1, 0)
    }));
  }, []);

  const handleSearch = async () => {
    console.log(`[Action] Manual search: ${query}`);
    setSearchLoading(true);
    try {
      const results = await searchUsers(query);
      setUsers(results);
    } catch (err) {
      console.error("[Search] Manual search failed:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast("Login required to like posts");
        return;
      }

      const token = await user.getIdToken(true);
      console.log(`[Action] Toggling like for Post: ${postId}`);

      const response = await fetch("/api/posts/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) throw new Error("Failed to process like");

      const resData = await response.json();
      setLikedPosts((prev) => {
        const next = new Set(prev);
        resData.liked ? next.add(postId) : next.delete(postId);
        return next;
      });

      toast(resData.message || (resData.liked ? "Liked!" : "Unliked"));
    } catch (error) {
      console.error("[Action] Like failed:", error);
      toast("Action failed. Try again.");
    }
  };

  // --- Render Helpers ---

  const mainContent = useMemo(() => {
    if (isLoading || delayedLoading) return <SkeletonLoader />;
    if (isError) return <div className="text-center py-12 text-muted-foreground">Unable to load feed. Please try again.</div>;
    if (allPosts.length === 0) return <div className="text-center py-12 text-muted-foreground">The universe is quiet. No posts yet.</div>;

    return (
      <InfiniteScroll
        dataLength={allPosts.length}
        next={loadMorePosts}
        hasMore={hasMore}
        scrollThreshold={0.9}
        loader={
          <div className="flex justify-center p-6 bg-transparent">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        }
        endMessage={
          <div className="flex flex-col items-center py-8 text-muted-foreground select-none">
            <Sparkles className="h-5 w-5 mb-2 opacity-50" />
            <p className="text-xs uppercase tracking-widest">You've reached the end of the universe</p>
          </div>
        }
      >
        {allPosts.map((post, idx) => (
          <FeedPost
            key={`${post.id}-${idx}`}
            post={post}
            activeIndex={activeIndices[post.id] ?? 0}
            handleLike={handleLike}
            handleCommentButtonClick={() => setIsCommentSectionVisible((p) => !p)}
            isCommentSectionVisible={isCommentSectionVisible}
            userId={post.user.id}
            likedPosts={likedPosts}
            nextImage={nextImage}
            prevImage={prevImage}
          />
        ))}
      </InfiniteScroll>
    );
  }, [allPosts, isLoading, delayedLoading, isError, hasMore, activeIndices, likedPosts, isCommentSectionVisible, loadMorePosts, nextImage, prevImage]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-background selection:bg-primary/30">

        {/* Header Navigation */}
        <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white dark:bg-card">
          <div className="mx-auto flex max-w-7xl h-16 items-center justify-between gap-4 px-4 sm:px-6">

            {/* Logo */}
            <Link href="/feed" className="flex items-center gap-2 group shrink-0">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-primary to-purple-600 p-[2px] transition-transform group-hover:scale-105 active:scale-95 shadow-lg">
                <div className="h-full w-full rounded-[9px] bg-background overflow-hidden relative">
                  <Image src="/logo.png" alt="Z" fill className="object-cover scale-150" />
                </div>
              </div>
              <span className="hidden sm:block text-xl font-bold tracking-tighter text-foreground bg-clip-text">
                Zentia
              </span>
            </Link>

            {/* Search Shell */}
            <div className="relative flex-1 max-w-lg">
              <SearchBar
                value={query}
                onChange={setQuery}
                onSearch={handleSearch}
                placeholder="Search the universe..."
              />
              {(query || searchLoading) && (
                <SearchSuggestions
                  users={users}
                  loading={searchLoading}
                  query={query}
                  onClose={() => setQuery("")}
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                <NotificationBell />
                <PremiumModeToggle />
              </div>
              <ProfileDropdown trigger={
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
                  <Avatar className="h-8 w-8 border border-white/10">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              } />
            </div>
          </div>
        </header>

        {/* Main Layout Content */}
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 relative bg-transparent">

          {/* Enhanced Stats Dashboard */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {[
              { icon: Users, label: "2.5K", sub: "Explorers", color: "text-cyan-400" },
              { icon: TrendingUp, label: "847", sub: "Trends", color: "text-purple-400" },
              { icon: Zap, label: "12.3K", sub: "Sparks", color: "text-pink-400" }
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-lg p-4 text-center transition-all hover:scale-105 hover:shadow-xl"
              >
                <stat.icon
                  className={`w-5 h-5 mx-auto mb-2 ${stat.color} transition-transform group-hover:scale-110`}
                />
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{stat.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.sub}</div>
              </div>
            ))}
          </motion.div>

          <div className="relative min-h-[500px]">
            {mainContent}
          </div>
        </main>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            onClick={() => {
              console.log("[Action] Modal: New Post opened");
              setOpenPost(true);
            }}
            className="h-14 rounded-full px-6 shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-primary/50 transition-all hover:-translate-y-1 active:translate-y-0 text-md font-semibold gap-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Post</span>
          </Button>
        </div>

        <CreatePostModal open={openPost} onClose={() => setOpenPost(false)} />
      </div>
    </SidebarProvider>
  );
}
"use client";

import { useState, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader2, Grid, Layout, Image as ImageIcon, Info, Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import ProfileAboutPanel from "./ProfileAboutPanel";

// Types
interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    firstName: string;
    lastName?: string;
  };
  createdAt: string;
}

interface Post {
  id: string;
  content: string;
  images?: string[];
  createdAt: string;
  likesCount?: number;
  comments?: Comment[];
}

interface ProfileCardProps {
  hasMore: boolean;
  posts?: Post[];
  loadMore: () => Promise<void>;
  user?: any; // Added for About tab on mobile
}

const ProfileCard = ({ posts = [], hasMore, loadMore, user }: ProfileCardProps) => {
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "about">("posts");
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: "posts", label: "Posts", icon: <Layout size={18} /> },
    { id: "media", label: "Media", icon: <ImageIcon size={18} /> },
    { id: "about", label: "Details", icon: <Info size={18} />, mobileOnly: true },
  ];

  const loadMoreWithTimeout = async () => {
    setLoading(true);
    const minDelay = 800;
    const start = Date.now();
    await loadMore();
    const elapsed = Date.now() - start;
    if (elapsed < minDelay) await new Promise((res) => setTimeout(res, minDelay - elapsed));
    setLoading(false);
  };

  const mediaPosts = posts.filter(p => p.images && p.images.length > 0);

  return (
    <div className="w-full">
      {/* TABS NAVIGATION */}
      {/* <div className="sticky top-[80px] md:top-[96px] z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-y border-zinc-200 dark:border-zinc-800 mb-8"> */}
      <div className="sticky top-[80px] md:top-[96px] z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-y text-card-foreground-border dark:border-zinc-800 rounded-2xl mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center md:justify-start gap-8 overflow-x-auto no-scrollbar py-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 py-4 px-2 transition-all duration-300 group ${tab.mobileOnly ? "md:hidden" : ""
                  } ${activeTab === tab.id
                    ? "text-[#FF7E5F]"
                    : "text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"
                  }`}
              >
                <span className={`transition-transform duration-300 ${activeTab === tab.id ? "scale-110" : "group-hover:scale-110"}`}>
                  {tab.icon}
                </span>
                <span className="text-sm font-bold uppercase tracking-widest">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7E5F] to-[#FEB47B] rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === "posts" && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <InfiniteScroll
                dataLength={posts.length}
                next={loadMoreWithTimeout}
                hasMore={hasMore}
                loader={<InfiniteSkeletonGrid />}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {posts.map((post, idx) => (
                  <PostCard key={post.id} post={post} index={idx} />
                ))}
              </InfiniteScroll>
              {posts.length === 0 && !loading && <EmptyState message="No posts yet. Start the journey." />}
            </motion.div>
          )}

          {activeTab === "media" && (
            <motion.div
              key="media"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4"
            >
              {mediaPosts.map((post, idx) => (
                <MediaGridItem key={post.id} post={post} index={idx} />
              ))}
              {mediaPosts.length === 0 && <EmptyState message="No media uploaded yet." />}
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="md:hidden"
            >
              <ProfileAboutPanel user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PostCard = ({ post, index }: { post: Post; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group p-2"
    >
      {/* <Card className="overflow-hidden bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-white/20 dark:border-zinc-800 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col"> */}
      <Card className="overflow-hidden bg-text-card-foreground dark:bg-zinc-900/40 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-xs hover:shadow-xs transition-all duration-300 h-full flex flex-col">
        {post.images && post.images.length > 0 && (
          <div className="relative aspect-square overflow-hidden">
            <img
              src={post.images[0]}
              alt="Post"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-sm md:text-base text-gray-800 dark:text-zinc-200 line-clamp-3 leading-relaxed mb-4">
              {post.content}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex gap-4">
              <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-zinc-400 hover:text-red-500 transition-colors">
                <Heart size={16} /> {post.likesCount || 0}
              </button>
              <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-zinc-400 hover:text-[#FF7E5F] transition-colors">
                <MessageCircle size={16} /> {post.comments?.length || 0}
              </button>
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-zinc-600">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const MediaGridItem = ({ post, index }: { post: Post; index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.03 }}
    whileHover={{ scale: 0.98 }}
    className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-lg"
  >
    <img
      src={post.images![0]}
      alt="Media"
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
    />
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-300">
      <div className="flex items-center gap-1 text-white"><Heart size={18} fill="white" /> {post.likesCount || 0}</div>
      <div className="flex items-center gap-1 text-white"><MessageCircle size={18} fill="white" /> {post.comments?.length || 0}</div>
    </div>
  </motion.div>
);

const InfiniteSkeletonGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-64 rounded-[2.5rem] bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
    ))}
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="p-6 rounded-full bg-zinc-100 dark:bg-zinc-900 mb-4">
      <Grid className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{message}</h3>
    <p className="text-sm text-gray-500 dark:text-zinc-500">Share your universe with the world.</p>
  </div>
);

export default ProfileCard;

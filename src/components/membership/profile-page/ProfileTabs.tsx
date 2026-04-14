
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LikeButton } from "../../../../src/components/posts/likes/LikeButton";
import { useState } from "react";
import PostItem from "../../posts/PostItem";
import Link from "next/link";


// --------------------------
// Types
// --------------------------
interface User {
  id: string;
  firstName: string;
  avatarUrl?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  postId: string;
  user: User;
}

interface Like {
  id: string;
  postId?: string;
  user: User;
}

interface Post {
  id: string;
  content: string;
  images?: string[];
  createdAt: string;
  likesCount: number;
  comments?: Comment[];
  user: User;
}

interface ProfileTabsProps {
  posts: Post[];
  comments: Comment[];
  likes: Like[];
  followers: User[];
  following: User[];
}

// --------------------------
// ProfileTabs Component
// --------------------------
export default function ProfileTabs({
  posts = [],
  comments = [],
  likes = [],
  followers = [],
  following = [],
}: ProfileTabsProps) {
  const [active, setActive] = useState<
    "posts" | "comments" | "likes" | "followers" | "following"
  >("posts");



  const followersCount = followers.length;
  const followingCount = following.length;
  const tabs: {
    key: typeof active;
    label: string;
  }[] = [
      { key: "posts", label: ` (${followersCount}) Posts` },
      { key: "followers", label: `(${followersCount}) Followers ` },
      { key: "following", label: `(${followingCount}) Following ` },
    ];

  return (
    <div className="space-y-6">
      {/* Tab Menu */}
      <div className="flex gap-3 border-b border-white/10 pb-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <motion.button
            key={tab.key}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`relative px-4 py-2 font-medium text-sm transition-colors duration-200 ${active === tab.key
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
              }`}
            onClick={() => setActive(tab.key)} >
            {tab.label}
            {active === tab.key && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-[oklch(0.62_0.12_210)] to-[oklch(0.62_0.12_190)] rounded"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}  />
            )}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="relative min-h-[150px]">
        <AnimatePresence mode="wait">
          {active === "posts" && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"  >
              {posts.length > 0 ? (
                posts.map((p) => {
                  console.log("Rendering post:", p.id, "Likes:", p.likesCount);

                  return (
                    <div key={p.id} className="border rounded-lg p-4 space-y-2 hover:shadow-sm transition-shadow">
                      <PostItem post={p} /> {/* existing post content */}

                      {/* Like Button Section */}
                      <div className="flex items-center mt-2">
                        <LikeButton
                          postId={p.id}
                          userId={p.user.id} // ⚠️ temporary (see note below)
                          initialIsLiked={false} // later dynamic karenge
                          initialLikesCount={p.likesCount} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400 text-center italic">No posts yet.</p>
              )}
            </motion.div>
          )}
          {active === "comments" && (
            <motion.div
              key="comments"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"  >
              {comments.length > 0 ? (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 border-b rounded-lg hover:bg-gray-50 transition-colors"  >
                    <strong>{c.user.firstName}:</strong> {c.content}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center italic">No comments yet.</p>
              )}
            </motion.div>
          )}

          {active === "likes" && (
            <motion.div
              key="likes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"  >
              {likes.length > 0 ? (
                likes.map((l) => (
                  <div
                    key={l.id}
                    className="p-3 border-b rounded-lg hover:bg-gray-50 transition-colors"  >
                    Liked Post: {l.postId || "Unknown"}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center italic">No likes yet.</p>
              )}
            </motion.div>
          )}

          {/* --------------------------
                 Followers Section 
              -------------------------- */}
          {active === "followers" && (
            <motion.div
              key="followers"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"  >
              {followers.length > 0 ? (
                <div className="flex flex-col divide-y">
                  {followers.map((f) => {
                    console.log("Rendering follower:", f.firstName); // debug log
                    return (
                      <Link key={f.id} href={`/profile/${f.id}`}>
                        <div className="flex items-center gap-4 p-3 hover:bg-gray-100 cursor-pointer transition-colors">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                            {f.avatarUrl ? (
                              <img
                                src={f.avatarUrl}
                                alt={f.firstName}
                                className="w-full h-full object-cover"   />
                            ) : (
                              <span className="flex items-center justify-center w-full h-full bg-blue-500 text-white font-bold">
                                {f.firstName?.[0]?.toUpperCase() || "U"}
                              </span>
                            )}
                          </div>
                          {/* Username */}
                          <span className="text-sm font-medium">{f.firstName}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-center italic p-6">
                  No followers yet.
                </p>
              )}
            </motion.div>
          )}

          {/* --------------------------
                  Following Section 
             -------------------------- */}
          {active === "following" && (
            <motion.div
              key="following"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"  >
              {following.length > 0 ? (
                <div className="flex flex-col divide-y">
                  {following.map((f) => {
                    console.log("Rendering following:", f.firstName); // debug log
                    return (
                      <Link key={f.id} href={`/profile/${f.id}`}>
                        <div className="flex items-center gap-4 p-3 hover:bg-gray-100 cursor-pointer transition-colors">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                            {f.avatarUrl ? (
                              <img
                                src={f.avatarUrl}
                                alt={f.firstName}
                                className="w-full h-full object-cover"  />
                            ) : (
                              <span className="flex items-center justify-center w-full h-full bg-blue-500 text-white font-bold">
                                {f.firstName?.[0]?.toUpperCase() || "U"}
                              </span>
                            )}
                          </div>
                          {/* Username */}
                          <span className="text-sm font-medium">{f.firstName}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-center italic p-6">
                  Not following anyone yet.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

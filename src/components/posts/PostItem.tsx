//src/components/posts/PostItem.tsx
"use client";

import { Card } from "../../../components/ui/card";
import React from "react";
import UserProfileSummary from "../membership/profile-page/UserProfileSummary";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { LikeButton } from "./likes/LikeButton";
import { Heart } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  user: { id: string; firstName: string; lastName?: string };
  createdAt: string;
}

interface Post {
  id: string;
  content: string;
  images?: string[];
  createdAt: string;
  likesCount: number;
  comments?: Comment[];
  user: { id: string; firstName?: string; avatarUrl?: string };
  isLikedByUser?: boolean; // Added to track like state
}

interface PostItemProps {
  post: Post;
  userId?: string; // Added for LikeButton functionality
}

export default function PostItem({ post, userId }: PostItemProps) {
  console.log("[PostItem] Rendering post:", post.id, "isLikedByUser:", post.isLikedByUser);

  return (
    <Card className="p-5 max-w-3xl mx-auto">
      <UserProfileSummary user={post.user} />

      <p className="text-sm sm:text-base text-foreground/90 mt-3 warp-break-words">
        {post.content}
      </p>

      {post.images?.length ? (
        <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-white/12 mt-4 shadow-[0_30px_90px_-55px_rgba(0,0,0,0.85)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={post.images[0]}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={post.images[0]}
                alt="Post image"
                fill
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      ) : null}

      <div className="w-full flex justify-between items-center mt-1">
        <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
        
        {/* Like Button - shows colored state if already liked */}
        {userId && (
          <LikeButton
            postId={post.id}
            initialIsLiked={post.isLikedByUser || false}
            initialLikesCount={post.likesCount || 0}
            userId={userId}
          />
        )}
      </div>

      {/* Fallback display if no userId provided */}
      {!userId && (
        <p className="font-semibold text-sm mt-2 text-foreground/90 flex items-center gap-2">
          <Heart className={`h-4 w-4 ${post.isLikedByUser ? "fill-current text-red-500" : ""}`} />
          Likes: <span className="italic text-muted-foreground">{post.likesCount || 0}</span>
        </p>
      )}

      <div className="text-sm mt-2">
        <p className="font-semibold mb-1 text-foreground/90">
          Comments (<span className="italic">{post.comments?.length || 0}</span>):
        </p>
        {!post.comments || post.comments.length === 0 ? (
          <p className="text-muted-foreground">No comments yet.</p>
        ) : (
          <ul className="space-y-2">
            {post.comments.map((c) => (
              <li key={c.id} className="border-t border-white/10 pt-2 space-y-1">
                <div>
                  <strong>{c.user.firstName} {c.user.lastName || ""}</strong>:
                  {c.content}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}


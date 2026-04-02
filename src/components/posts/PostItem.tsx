//src/components/posts/PostItem.tsx
"use client";

import { Card } from "../../../components/ui/card";
import React from "react";
import UserProfileSummary from "../membership/profile-page/UserProfileSummary";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
}

interface PostItemProps {
  post: Post;
}

export default function PostItem({ post }: PostItemProps) {
  console.log("[PostItem] Rendering post:", post.id);

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

      <div className="w-full flex justify-end mt-1">
        <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
      </div>

      <p className="font-semibold text-sm mt-2 text-foreground/90">
        Likes: <span className="italic text-muted-foreground">{post.likesCount || 0}</span>
      </p>

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


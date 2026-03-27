//src/components/posts/PostItem.tsx
"use client";

import { Card } from "../../../components/ui/card";
import React from "react";
import UserProfileSummary from "../membership/profile-page/UserProfileSummary";

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
    <Card className="p-4 bg-white border border-gray-200 shadow-sm dark:bg-zinc-800 max-w-3xl mx-auto">
      <UserProfileSummary user={post.user} />

      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400 mt-2 warp-break-words">
        {post.content}
      </p>

      {post.images?.length ? (
        <img
          src={post.images[0]}
          alt="Post image"
          className="w-full max-h-72 object-cover rounded-md mt-3" />
      ) : null}

      <div className="w-full flex justify-end mt-1">
        <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
      </div>

      <p className="font-semibold text-sm mt-2">Likes: <span className="italic">{post.likesCount || 0}</span></p>

      <div className="text-sm mt-2">
        <p className="font-semibold mb-1">
          Comments (<span className="italic">{post.comments?.length || 0}</span>):
        </p>
        {!post.comments || post.comments.length === 0 ? (
          <p className="text-gray-400">No comments yet.</p>
        ) : (
          <ul className="space-y-2">
            {post.comments.map((c) => (
              <li key={c.id} className="border-t pt-2 space-y-1">
                <div>
                  <strong>{c.user.firstName} {c.user.lastName || ""}</strong>:
                  {c.content}
                </div>
                <p className="text-xs text-gray-400">
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


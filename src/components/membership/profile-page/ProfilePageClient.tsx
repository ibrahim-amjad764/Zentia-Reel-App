"use client";

import { FollowButton } from "../profile-page/FollowButton";
import { Loader2 } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import InfiniteScroll from "react-infinite-scroll-component";
import ProfileHeader from "./ProfileHeader";
import ProfileContent from "./ProfileContent";
import React from "react";
import Link from "next/link";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  email?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
  postId: string;
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

interface ProfilePageClientProps {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    createdAt?: string;
    isActive?: boolean;
  };
  posts: Post[];
  comments: Comment[];
  likes: { id: string; postId?: string; userId: string }[];
  followers: User[];
  following: User[];
  editable?: boolean;
}

const POSTS_LIMIT = 10;

export default function ProfilePageClient({
  user,
  posts: initialPosts,
  comments,
  likes,
  followers,
  following,
  editable = true,
}: ProfilePageClientProps) {
  const [posts, setPosts] = React.useState<Post[]>(initialPosts);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState<boolean>(initialPosts.length === POSTS_LIMIT);
  const [loading, setLoading] = React.useState(false);

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/posts?userId=${user.id}&page=${nextPage}&limit=${POSTS_LIMIT}`, {
        credentials: "include",
      });
      if (!res.ok) return;

      const data = await res.json();
      const newPosts: Post[] = (data.posts || []).map((p: any) => ({
        ...p,
        comments: (p.comments || []).filter((c: any) => c.user?.id === user.id),
        likesCount: (p.likes || []).filter((l: any) => l.user?.id === user.id).length,
      }));

      setPosts((prev) => [...prev, ...newPosts]);
      setPage(nextPage);
      setHasMore(newPosts.length === POSTS_LIMIT);
    } catch (err) {
      console.error("[ProfilePageClient] loadMorePosts error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      {/* Profile Header */}
      <ProfileHeader user={user} />
      <div className="space-y-6">
        <h3 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-gray-300">
          Posts by {user.firstName || "User"} ({posts.length})
        </h3>
        {/* Follow button for the profile being viewed */}
        <div className="my-2">
          <FollowButton userId={user.id} />
        </div>
        {posts.length === 0 ? (
          <p className="text-center text-gray-400 italic">No posts yet.</p>
        ) : (
          <InfiniteScroll
            dataLength={posts.length}
            next={loadMorePosts}
            hasMore={hasMore}
            scrollThreshold={0.9}
            loader={<Loader2 className="h-6 w-6 animate-spin my-4 flex mx-auto" />}
            endMessage={<p className="text-center text-gray-600 italic mt-4">No more posts.</p>}>
            <div className="space-y-4">
              {posts.map((post) => (
                <Card
                  key={`post-${post.id}`}
                  className="p-4 bg-white border border-gray-200 shadow-sm dark:bg-zinc-800" >
                  {/* User Info */}
                  <Link href={`/profile/${post.user.id}`} className="flex items-center space-x-2 mb-2 cursor-pointer">
                    {post.user.avatarUrl ? (
                      <img src={post.user.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
                        {post.user.firstName?.[0] || "U"}
                      </div>
                    )}
                    <span className="font-semibold text-sm">{post.user.firstName || "User"}</span>
                  </Link>

                  {/* Post Content */}
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400 break-words">{post.content}</p>

                  {/* Post Images */}
                  {post.images && post.images.length > 0 && (
                    <img src={post.images[0]} alt="Post image" className="w-full max-h-72 object-cover rounded-md mt-3" />
                  )}

                  {/* Post Info */}
                  <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                  <p className="font-semibold text-sm mt-1">Likes: {post.likesCount || 0}</p>

                  {/* Comments */}
                  <div className="text-sm mt-2">
                    <p className="font-semibold mb-1">Comments ({post.comments?.length || 0}):</p>
                    {(!post.comments || post.comments.length === 0) ? (
                      <p className="text-gray-400">No comments yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {post.comments.map((c) => (
                          <li key={`comment-${c.id}`} className="border-t pt-1">
                            <p>
                              <strong>{c.user.firstName} {c.user.lastName || ""}:</strong> {c.content}
                            </p>
                            <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>

      {/* Edit Profile Section */}
      {editable && <ProfileContent user={user} onSave={async () => { }} onCancel={() => { }} isSaving={false} />}
    </div>
  );
}
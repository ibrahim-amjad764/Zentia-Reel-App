"use client";

import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "../../../../components/ui/card";

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
}

const ProfileCard = ({ posts = [], hasMore, loadMore }: ProfileCardProps) => {
  
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Expand / Collapse
  const toggleExpand = (id: string) => {
    setExpandedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Comment Input
  const handleCommentChange = (id: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [id]: value }));
  };

  // Load more with delay
  const loadMoreWithTimeout = async () => {
    setLoading(true);
    const minDelay = 1200;
    const start = Date.now();

    await loadMore();

    const elapsed = Date.now() - start;
    if (elapsed < minDelay) {
      await new Promise((res) => setTimeout(res, minDelay - elapsed));
    }

    setLoading(false);
  };

  return (
    <div className="w-full px-3 sm:px-4 md:px-6">
      <div className="w-full max-w-2xl mx-auto space-y-7">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
            My Posts
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {posts.length} total
          </span>
        </div>

        {/* Skeleton Loader */}
        {loading && posts.length === 0 && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 animate-pulse">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded mb-3" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-zinc-700 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-16 border border-dashed border-gray-300 dark:border-zinc-700 rounded-2xl">
            <p className="text-gray-400 text-sm">No posts yet</p>
            <p className="text-xs text-gray-300 mt-1">Start sharing something </p>
          </div>
        )}

        {/* Posts */}
        {posts.length > 0 && (
          <InfiniteScroll
            dataLength={posts.length}
            next={loadMoreWithTimeout}
            hasMore={hasMore}
            scrollThreshold={0.9}
            loader={
              <div className="flex justify-center my-6">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            }
          >
            <div className="space-y-6">
              {posts.map((post) => {
                const isExpanded = expandedPosts[post.id];
                const isLong = post.content.length > 120;

                return (
                  <Card
                    key={post.id}
                    className="group p-5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {/* Content */}
                    <p className="text-[15px] text-gray-800 dark:text-gray-300 leading-relaxed">
                      {isLong && !isExpanded
                        ? post.content.slice(0, 120) + "..."
                        : post.content}
                    </p>

                    {isLong && (
                      <button
                        onClick={() => toggleExpand(post.id)}
                        className="text-xs mt-1 text-gray-500 hover:underline"
                      >
                        {isExpanded ? "Show less" : "Read more"}
                      </button>
                    )}

                    {/* Image */}
                    {post.images?.length ? (
                      <div className="mt-4 overflow-hidden rounded-xl">
                        <img
                          src={post.images[0]}
                          alt="Post"
                          className="w-full max-h-80 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : null}

                    {/* Meta */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800">
                      <span className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleString()}
                      </span>

                      <div className="flex items-center gap-4">

                        {/* Like Button */}
                        <motion.button
                          whileTap={{ scale: 0.75 }}
                          className="flex items-center gap-1 text-gray-600 dark:text-gray-300"
                        >
                          <motion.span
                            whileTap={{ scale: 1.4 }}
                            transition={{ duration: 0.2 }}
                          >
                            ❤️
                          </motion.span>
                          {post.likesCount || 0}
                        </motion.button>

                        {/* Comments Count */}
                        <span className="text-gray-500 text-sm">
                          💬 {post.comments?.length || 0}
                        </span>
                      </div>
                    </div>

                    {/* Comment Input */}
                    <div className="mt-4 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) =>
                          handleCommentChange(post.id, e.target.value)
                        }
                        className="flex-1 text-sm px-3 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 outline-none"
                      />
                      <button className="text-sm text-blue-500 hover:underline">
                        Post
                      </button>
                    </div>

                    {/* Comments */}
                    <div className="mt-4 space-y-3">
                      {post.comments?.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-xs">
                            {comment.user.firstName?.[0]}
                          </div>

                          <div className="flex-1 bg-gray-50 dark:bg-zinc-800 rounded-2xl px-4 py-2">
                            <p className="text-sm text-gray-800 dark:text-gray-300">
                              <span className="font-semibold">
                                {comment.user.firstName}
                              </span>{" "}
                              {comment.content}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                  </Card>
                );
              })}
            </div>
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
    // return (
    //   <div className="w-full px-3 sm:px-4 md:px-6">
    //     <div className="w-full max-w-2xl mx-auto space-y-6">
    //       <h3 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-gray-300">
    //         My Posts ({posts.length})
    //       </h3>
  
    //       {posts.length === 0 && (
    //         <p className="text-center text-gray-400 text-m italic">No posts yet.</p>
    //       )}
  
    //       {posts.length > 0 && (
    //         <InfiniteScroll
    //           dataLength={posts.length}
    //           next={loadMoreWithTimeout} // use the wrapper
    //           hasMore={hasMore}
    //           scrollThreshold={0.9}
    //           loader={
    //             <div className="flex justify-center my-4">
    //               <Loader2 className="h-6 w-6 animate-spin" />
    //             </div>
    //           }
    //           endMessage={
    //             <p className="text-center text-gray-600 text-sm mt-4 italic">
    //               No more posts exist for this user.
    //             </p>
    //           }  >
    //           <div className="space-y-4">
    //             {posts.map((post) => (
    //               <Card
    //                 key={post.id}
    //                 className="p-4 bg-white border border-gray-200 shadow-sm w-full overflow-hidden dark:bg-zinc-800" >
    //                 {/* Post content */}
    //                 <p className="text-sm sm:text-base text-gray-700 warp-break-words dark:text-gray-400">
    //                   {post.content}
    //                 </p>
  
    //                 {/* Optional post image */}
    //                 {post.images?.length ? (
    //                   <div className="mt-3 w-full">
    //                     <img
    //                       src={post.images[0]}
    //                       alt="Post image"
    //                       className="w-full max-h-72 object-cover rounded-md"/>
    //                   </div>
    //                 ) : null}
  
    //                 {/* Post date */}
    //                 <p className="text-xs text-gray-500 ml-130">
    //                   {new Date(post.createdAt).toLocaleString()}
    //                 </p>
  
    //                 {/* Likes */}
    //                 <p className="font-semibold text-sm ">
    //                   Likes: {post.likesCount || 0}
    //                 </p>
  
    //                 {/* Comments */}
    //                 <div className="text-sm mt-2">
    //                   <p className="font-semibold mb-1">
    //                     Comments ({post.comments?.length || 0}):
    //                   </p>
  
    //                   {(!post.comments || post.comments.length === 0) && (
    //                     <p className="text-gray-400">No comments yet.</p>
    //                   )}
  
    //                   <ul className="space-y-2">
    //                     {post.comments?.map((comment) => (
    //                       <li key={comment.id} className="border-t pt-1">
    //                         <p>
    //                           <strong>
    //                             {comment.user.firstName}{" "}
    //                             {comment.user.lastName || ""}:
    //                           </strong>{" "}
    //                           {comment.content}
    //                         </p>
    //                         <p className="text-xs text-gray-400">
    //                           {new Date(comment.createdAt).toLocaleString()}
    //                         </p>
    //                       </li>
    //                     ))}
    //                   </ul>
    //                 </div>
    //               </Card>
    //             ))}
    //           </div>
    //         </InfiniteScroll>
    //       )}
    //     </div>
    //   </div>
    // );
  
    
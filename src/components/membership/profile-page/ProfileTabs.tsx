// //src/components/membership/profile-page/ProfileTabs.tsx
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import PostItem from "../../posts/PostItem";

// export default function ProfileTabs({
//   posts,
//   comments,
//   likes,
//   followers,
//   following,
// }: any) {
//   const [active, setActive] = useState("posts");

//   <ProfileTabs
//   posts={mappedPosts}
//   comments={mappedComments}
//   likes={mappedLikes}
//   followers={followers}
//   following={following}
// />
//   return (
//     <div>

//       {/* TAB MENU */}
//       <div className="flex gap-4 border-b pb-2">
//         <button onClick={() => setActive("posts")}>Posts</button>
//         <button onClick={() => setActive("comments")}>Comments</button>
//         <button onClick={() => setActive("likes")}>Likes</button>
//         <button onClick={() => setActive("followers")}>Followers</button>
//         <button onClick={() => setActive("following")}>Following</button>
//       </div>

//       {/* POSTS */}
//       {active === "posts" &&
//         posts.map((p: any) => <PostItem key={p.id} post={p} />)}

//       {/* COMMENTS */}
//       {active === "comments" &&
//         comments.map((c: any) => (
//           <div key={c.id}>{c.content}</div>
//         ))}

//       {/* LIKES */}
//       {active === "likes" &&
//         likes.map((l: any) => (
//           <div key={l.id}>Liked Post: {l.postId}</div>
//         ))}

//       {/* FOLLOWERS */}
//       {active === "followers" &&
//         followers.map((f: any) => (
//           <Link key={f.id} href={`/profile/${f.id}`}>
//             <div className="flex items-center gap-2 p-2 hover:bg-gray-100">
//               <span>{f.firstName}</span>
//             </div>
//           </Link>
//         ))}

//       {/* FOLLOWING */}
//       {active === "following" &&
//         following.map((f: any) => (
//           <Link key={f.id} href={`/profile/${f.id}`}>
//             <div className="flex items-center gap-2 p-2 hover:bg-gray-100">
//               <span>{f.firstName}</span>
//             </div>
//           </Link>
//         ))}
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import Link from "next/link";
import PostItem from "../../posts/PostItem";
import { motion, AnimatePresence } from "framer-motion";
import { LikeButton } from "../../../../src/components/posts/likes/LikeButton";


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
      // { key: "comments", label: `(${commentsCount}) Comments` },
      // { key: "likes", label: `(${likesCount}) Likes` },
      { key: "followers", label: `(${followersCount}) Followers ` },
      { key: "following", label: `(${followingCount}) Following ` },
    ];

  return (
    <div className="space-y-6">
      {/* Tab Menu */}
      <div className="flex gap-48 border-b pb-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <motion.button
            key={tab.key}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`relative px-4 py-2 font-medium text-sm transition-colors duration-200 ${active === tab.key
              ? "text-blue-600 font-semibold"
              : "text-gray-500 hover:text-gray-700"
              }`}
            onClick={() => setActive(tab.key)} >
            {tab.label}
            {active === tab.key && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded"
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

                  // // Local state for like toggle per post
                  // const [isLiked, setIsLiked] = useState(false);
                  // const [likesCount, setLikesCount] = useState(p.likesCount);

                  // // Handler for toggling like
                  // const handleLike = () => {
                  //   console.log(`Toggling like for post ${p.id}, currently liked: ${isLiked}`);
                  //   setIsLiked(!isLiked);
                  //   setLikesCount((prev) => prev + (isLiked ? -1 : 1));
                  // };

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
                      
                      {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLike}
                            className={`${isLiked
                                ? "text-red-500"
                                : "text-gray-800 hover:text-red-500"
                              } dark:text-white dark:hover:text-red-500 flex items-center transition-colors duration-200 ease-in-out hover:scale-105 active:scale-95`} >
                            <Heart
                              className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}  />
                            {likesCount} {likesCount === 1 ? "Like" : "Likes"}
                          </Button> */}
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



// i wantto make when in post section show  like option or or like it

// Keep in mind my style, preferences, and values: I like answers that are practical, well-commented, and efficient, showing real-world best practices. Tailor all responses to these preferences, including modern methods over outdated ones, comenting for what purpose use, optimized way to handle code ,  robust version,  must write with console log

// Any file I send, do not make any changes to it. Just update it without changing anything.
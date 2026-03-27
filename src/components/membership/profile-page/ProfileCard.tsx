// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Card } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";

// // --- COMMENTED: original ProfileCard (avatar → contact). Do not modify. ---
// // const ProfileCard = ({ user }: ProfileCardProps) => {
// //   const fullName =
// //     [user.firstName, user.lastName].filter(Boolean).join(" ") ||
// //     user.email.split("@")[0] ||
// //     "User";
// //   ...
// // };

// interface ProfileCardProps {
//   user: {
//     firstName?: string;
//     lastName?: string;
//     email: string;
//     avatarUrl?: string;
//     bio?: string;
//     jobTitle?: string;
//     company?: string;
//     phone?: string;
//     location?: string;
//   };
// }

// /** Post type for user's own posts section */
// interface Post {
//   id: string;
//   content: string;
//   images?: string[];
//   createdAt: string;
// }

// /** New logic: profile info (avatar, name, contact) + current user's posts */
// const ProfileCard = ({
//   user,
//   posts = [],
//   hasMore = true,
// }: ProfileCardProps & { posts?: Post[]; hasMore?: boolean }) => {

//   const fullName =
//     [user.firstName, user.lastName].filter(Boolean).join(" ") ||
//     user.email.split("@")[0] ||
//     "User";

//   return (
//     <div className="w-full px-3 sm:px-4 md:px-6">
//       <div className="w-full max-w-2xl mx-auto space-y-6">

//         <h3 className="text-xl sm:text-2xl font-semibold text-slate-800">
//           My Posts ({posts.length})
//         </h3>

//         {/* No posts */}
//         {posts.length === 0 && (
//           <p className="text-center text-gray-400 text-sm">
//             No posts yet.
//           </p>
//         )}

//         {/* Posts */}
//         {posts.length > 0 && (
//           <>
//             <div className="space-y-4">
//               {posts.map((post) => (
//                 <Card
//                   key={post.id}
//                   className="p-4 bg-white border border-gray-200 shadow-sm w-full overflow-hidden">
//                   {/* Content */}
//                   <p className="text-sm sm:text-base text-gray-700 break-words">
//                     {post.content}
//                   </p>

//                   {/* Image */}
//                   {post.images && post.images.length > 0 && (
//                     <div className="mt-3 w-full">
//                       <img
//                         src={post.images[0]}
//                         alt=""
//                         className="w-full max-h-72 object-cover rounded-md" />
//                     </div>
//                   )}

//                   {/* Date */}
//                   <p className="text-xs text-gray-500 mt-3">
//                     {new Date(post.createdAt).toLocaleDateString()}
//                   </p>
//                 </Card>
//               ))}
//             </div>

//             {/* End message */}
//             {!hasMore && (
//               <p className="text-center text-gray-600 text-sm mt-4 italic">
//                 No more posts exist for this user.
//               </p>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
// export default ProfileCard;


"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import { Loader2 } from "lucide-react";
import { Card } from "../../../../components/ui/card";

// Post & Comment types
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
  posts?: Post[];       // optional, default to empty
  loadMore: () => void;
}

interface ProfileContentProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

const ProfileCard = ({ posts = [], hasMore, loadMore }: ProfileCardProps) => {
  console.log("[ProfileCard] Rendering posts:", posts);

  const loadMoreWithTimeout = async () => {
    // Minimum loader delay in ms
    const minDelay = 2000;

    const start = Date.now();
    await loadMore(); // call actual loadMore
    const elapsed = Date.now() - start;

    // Ensure loader shows at least minDelay
    if (elapsed < minDelay) {
      await new Promise((res) => setTimeout(res, minDelay - elapsed));
    }
  };

  return (
    <div className="w-full px-3 sm:px-4 md:px-6">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <h3 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-gray-300">
          My Posts ({posts.length})
        </h3>

        {posts.length === 0 && (
          <p className="text-center text-gray-400 text-m italic">No posts yet.</p>
        )}

        {posts.length > 0 && (
          <InfiniteScroll
            dataLength={posts.length}
            next={loadMoreWithTimeout} // use the wrapper
            hasMore={hasMore}
            scrollThreshold={0.9}
            loader={
              <div className="flex justify-center my-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            }
            endMessage={
              <p className="text-center text-gray-600 text-sm mt-4 italic">
                No more posts exist for this user.
              </p>
            }  >
            <div className="space-y-4">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="p-4 bg-white border border-gray-200 shadow-sm w-full overflow-hidden dark:bg-zinc-800" >
                  {/* Post content */}
                  <p className="text-sm sm:text-base text-gray-700 warp-break-words dark:text-gray-400">
                    {post.content}
                  </p>

                  {/* Optional post image */}
                  {post.images?.length ? (
                    <div className="mt-3 w-full">
                      <img
                        src={post.images[0]}
                        alt="Post image"
                        className="w-full max-h-72 object-cover rounded-md"/>
                    </div>
                  ) : null}

                  {/* Post date */}
                  <p className="text-xs text-gray-500 ml-130">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>

                  {/* Likes */}
                  <p className="font-semibold text-sm ">
                    Likes: {post.likesCount || 0}
                  </p>

                  {/* Comments */}
                  <div className="text-sm mt-2">
                    <p className="font-semibold mb-1">
                      Comments ({post.comments?.length || 0}):
                    </p>

                    {(!post.comments || post.comments.length === 0) && (
                      <p className="text-gray-400">No comments yet.</p>
                    )}

                    <ul className="space-y-2">
                      {post.comments?.map((comment) => (
                        <li key={comment.id} className="border-t pt-1">
                          <p>
                            <strong>
                              {comment.user.firstName}{" "}
                              {comment.user.lastName || ""}:
                            </strong>{" "}
                            {comment.content}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};
export default ProfileCard;
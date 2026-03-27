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
const ProfileCard = ({ posts, hasMore, loadMore }) => {
    return (<div className="w-full px-3 sm:px-4 md:px-6">
      <div className="w-full max-w-2xl mx-auto space-y-6">

        <h3 className="text-xl sm:text-2xl font-semibold text-slate-800">
          My Posts ({posts.length})
        </h3>

        {posts.length === 0 && (<p className="text-center text-gray-400 text-sm">
            No posts yet.
          </p>)}

        {posts.length > 0 && (<InfiniteScroll dataLength={posts.length} next={loadMore} hasMore={hasMore} scrollThreshold={0.9} loader={<div className="flex justify-center my-4">
                <Loader2 className="h-6 w-6 animate-spin"/>
              </div>} endMessage={<p className="text-center text-gray-600 text-sm mt-4 italic">
                No more posts exist for this user.
              </p>}>
            <div className="space-y-4">
              {posts.map((post) => (<Card key={post.id} className="p-4 bg-white border border-gray-200 shadow-sm w-full overflow-hidden">
                  <p className="text-sm sm:text-base text-gray-700 wrap-break-words">
                    {post.content}
                  </p>

                  {post.images?.length ? (<div className="mt-3 w-full">
                      <img src={post.images[0]} alt="" className="w-full max-h-72 object-cover rounded-md"/>
                    </div>) : null}
                  <p className="text-xs text-gray-500 mt-3">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </Card>))}
            </div>
          </InfiniteScroll>)}
      </div>
    </div>);
};
export default ProfileCard;

// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import InfiniteScroll from "react-infinite-scroll-component";
// import { useQuery } from "@tanstack/react-query";
// import { Heart, MessageCircle, Share2, Moon } from "lucide-react";
// import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card";
// import { Avatar, AvatarFallback } from "../../components/ui/avatar";
// import { Button } from "../../components/ui/button";
// import { SidebarProvider } from "../../components/ui/sidebar";
// import ThemeDropdown from "../../components/ui/dropdown-theme";
// import ProfileDropdown from "../../components/ui/dropdown-profile";
// import { SkeletonLoader } from "../../components/ui/SkeletonLoader";
// import { renderUser } from "../../src/types/renderUser";
// import { Loader2 } from "lucide-react";
// import { CreatePostModal } from "../../src/components/posts/CreatePostModal";
// import { toast } from "sonner";
// import { auth } from "@/lib/firebase"; 
// import { getFirebaseToken, authFetch } from "@/services/auth.service"; 

// interface User {
//   id: string;
//   firstName?: string | null;
//   lastName?: string | null;
//   email: string;
// }

// interface Post {
//   id: string;
//   content: string;
//   images?: string[];
//   createdAt: string;
//   user: User;
//   time?: string;
// }

// interface FetchPostsResponse {
//   posts: Post[];
//   hasMore: boolean;
// }

// // Fetch posts from API (uses authFetch to auto-refresh token on 401)
// const fetchPosts = async (page: number): Promise<FetchPostsResponse> => {
//   const res = await authFetch(`/api/posts?page=${page}&limit=5`);
//   if (!res.ok) throw new Error("Failed to fetch posts");
//   const data = await res.json();
//   if (Array.isArray(data)) return { posts: data, hasMore: true };
//   return { posts: data.posts || [], hasMore: data.hasMore || false };
// };

// export default function FeedPage() {
//   const [page, setPage] = useState(1);
//   const [allPosts, setAllPosts] = useState<Post[]>([]);
//   const [hasMore, setHasMore] = useState(true);
//   const [activeIndices, setActiveIndices] = useState<Record<string, number>>({});
//   const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
//   const [delayedLoading, setDelayedLoading] = useState(true);
//   const [openPost, setOpenPost] = useState(false);



//   const { data, isLoading, isError } = useQuery<FetchPostsResponse>({
//     queryKey: ["posts", page],
//     queryFn: () => fetchPosts(page),
//     retry: 2,
//     placeholderData: (prev) => prev,
//   });

//   // Update posts when data changes
//   useEffect(() => {
//     if (!data?.posts) return;
//     setHasMore(data.hasMore);
//     setAllPosts((prev) => (page === 1 ? data.posts : [...prev, ...data.posts]));
//   }, [data, page]);

//   // Simulate loading delay
//   useEffect(() => {
//     if (!isLoading && !isError) {
//       const timer = setTimeout(() => setDelayedLoading(false), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [isLoading, isError]);

//   // Image carousel handlers
//   const nextImage = (postId: string, length: number) =>
//     setActiveIndices((prev) => ({ ...prev, [postId]: Math.min((prev[postId] ?? 0) + 1, length - 1) }));
//   const prevImage = (postId: string) =>
//     setActiveIndices((prev) => ({ ...prev, [postId]: Math.max((prev[postId] ?? 0) - 1, 0) }));

//   // Load more posts on scroll
//   const loadMorePosts = () => {
//     if (hasMore) setPage((prev) => prev + 1);
//   };

//   // Handle like functionality
// // Handle the like functionality for a post
// const handleLike = async (postId: string) => {
//   try {
//     const user = auth.currentUser;
//     if (!user) {
//       // Check if user is logged in
//       alert("You need to be logged in to like posts.");
//       return;
//     }

//     const token = await user.getIdToken(true); // Get the fresh Firebase token

//     // Send a POST request to like the post
//     const response = await fetch("/api/posts/like", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`, // Include the token for authentication
//       },
//       body: JSON.stringify({ postId }), // Send the postId to identify which post to like
//     });

//     if (response.ok) {
//       setLikedPosts((prev) => new Set(prev).add(postId)); // Update liked posts in the state
//       console.log(`Post ${postId} liked successfully.`);
//     } else {
//       // Handle errors from the API
//       const error = await response.json();
//       toast(error.message || "Error liking post");
//     }
//   } catch (error) {
//     console.error("Error liking the post:", error);
//     toast("Something went wrong. Please try again.");
//   }
// };

//   const posts = allPosts;

//   const mainContent = isLoading || delayedLoading ? (
//     <SkeletonLoader />
//   ) : isError ? (
//     <p className="text-center py-10">Something went wrong.</p>
//   ) : posts.length === 0 ? (
//     <p className="text-center py-10">No posts yet.</p>
//   ) : (
//     <InfiniteScroll
//       dataLength={posts.length}
//       next={loadMorePosts}
//       hasMore={hasMore}
//       scrollThreshold={0.9}
//       loader={
//         <div className="flex justify-center my-4">
//           <Loader2 className="h-8 w-8 animate-spin" />
//         </div>
//       }
//       endMessage={<p className="flex justify-center py-4">No more posts to show</p>}
//     >
//       {posts.map((post, index) => {
//         const activeIndex = activeIndices[post.id] ?? 0;
//         const safeUser = {
//           ...post.user,
//           firstName: post.user.firstName ?? "Anonymous",
//           lastName: post.user.lastName ?? "",
//         };
//         const isLiked = likedPosts.has(post.id);

//         return (
//           <Card key={post.id + "-" + index} className="shadow-md mb-6">
//             <CardHeader className="flex flex-row items-start gap-3">
//               <Avatar>
//                 <AvatarFallback>{safeUser.email[0]?.toUpperCase()}</AvatarFallback>
//               </Avatar>
//               <div className="flex flex-col">
//                 <p className="text-sm font-semibold">{renderUser(safeUser)}</p>
//                 <p className="text-xs text-muted-foreground">
//                   {post.time ?? new Date(post.createdAt).toLocaleDateString()}
//                 </p>
//                 <CardContent className="text-sm p-0 mt-1">{post.content}</CardContent>
//               </div>
//             </CardHeader>

//             {post.images?.length ? (
//               <div className="relative w-full h-[300px]">
//                 <Image
//                   src={post.images[activeIndex]}
//                   alt="Post image"
//                   fill
//                   className="object-cover"
//                   loading="eager"
//                 />
//                 {post.images.length > 1 && (
//                   <div className="absolute inset-0 flex items-center justify-between px-2">
//                     <Button size="sm" variant="secondary" onClick={() => prevImage(post.id)} disabled={activeIndex === 0}>
//                       ‹
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="secondary"
//                       onClick={() => nextImage(post.id, post.images!.length)}
//                       disabled={activeIndex === post.images.length - 1}
//                     >
//                       ›
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             ) : null}

//             <CardFooter className="flex justify-around border-t">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => handleLike(post.id)}
//                 disabled={isLiked}
//               >
//                 <Heart className="h-4 w-4 mr-1" />
//                 {isLiked ? "Liked" : "Like"}
//               </Button>
//               <Button variant="ghost" size="sm">
//                 <MessageCircle className="h-4 w-4 mr-1" /> Comment
//               </Button>
//               <Button variant="ghost" size="sm">
//                 <Share2 className="h-4 w-4 mr-1" /> Share
//               </Button>
//             </CardFooter>
//           </Card>
//         );
//       })}
//     </InfiniteScroll>
//   );

//   return (
//     <SidebarProvider>
//       <div className="flex min-h-dvh w-full flex-col">
//         <header className="bg-card sticky top-0 z-50 border-b">
//           <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6">
//             <Link href="/feed" className="flex items-center gap-2">
//               <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
//                 <Image src="/logo.png" alt="Logo" width={50} height={50} className="object-cover w-full h-full scale-150" />
//               </div>
//               <span className="lg:text-lg font-extrabold text-black italic tracking-wider animate-pulse">Zentia</span>
//             </Link>

//             <div className="flex items-center gap-1.5">
//               <ThemeDropdown trigger={<Button variant="ghost" size="icon"><Moon className="size-8" /></Button>} />
//               <Button size="sm" variant="secondary" onClick={() => setOpenPost(true)} className="transition-all duration-200 ease-in-out hover:scale-105 active:scale-95">
//                 New Post
//               </Button>
//               <ProfileDropdown trigger={<Button variant="ghost" size="icon"><Avatar><AvatarFallback>U</AvatarFallback></Avatar></Button>} />
//             </div>
//           </div>
//         </header>
//         <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6 sm:px-6">{mainContent}</main>
//       </div>

//       <CreatePostModal open={openPost} onClose={() => setOpenPost(false)} />
//     </SidebarProvider>
//   );
// }


"use client";

import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import { useState, useEffect, KeyboardEvent } from "react";
import { Heart, MessageCircle, Share2, Moon } from "lucide-react";
import { getFirebaseToken, authFetch } from "../../src/services/auth.service";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { NotificationBell } from "../../src/components/notifications/NotificationBell";
import { CreatePostModal } from "../../src/components/posts/CreatePostModal";
import { SidebarProvider } from "../../components/ui/sidebar";
import { SkeletonLoader } from "../../components/ui/SkeletonLoader";
import { FollowButton } from "../../src/components/membership/profile-page/FollowButton";
import { ShareButton } from "../../src/components/posts/Share/ShareButton";
import { searchUsers } from "../../src/services/user.service";
import { useDebounce } from "../../src/lib/useDebounce";
import { renderUser } from "../../src/types/renderUser";
import { LikeButton } from "../../src/components/posts/likes/LikeButton";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { auth } from "../../src/lib/firebase";
import SearchSuggestions from "../../src/components/notifications/SearchSuggestions";
import ProfileDropdown from "../../components/ui/dropdown-profile";
import InfiniteScroll from "react-infinite-scroll-component";
import CommentSection from "../../src/components/posts/comments/CommentSection";
import ThemeDropdown from "../../components/ui/dropdown-theme";
import SearchBar from "../../src/components/notifications/SearchBar"
import Image from "next/image";
import Link from "next/link"; // Import Link here

// FeedPost displaying content and comments
const FeedPost = ({
  post,
  activeIndex,
  isCommentSectionVisible,
  userId,
  likedPosts,
  handleCommentButtonClick,
  nextImage,
  prevImage,
}: {
  post: Post;
  activeIndex: number;
  isCommentSectionVisible: boolean;
  userId: string;
  likedPosts: Set<string>;
  handleLike: (postId: string) => void;
  handleCommentButtonClick: () => void;
  nextImage: (postId: string, length: number) => void;
  prevImage: (postId: string) => void;
}) => {
  const isLiked = likedPosts.has(post.id);

  const renderUser = (user: User) => {
    const fullName = `${user.firstName ?? 'Anonymous'} ${user.lastName ?? ''}`.trim();
    return fullName;
  };

  return (
    <Card key={post.id} className="shadow-md mb-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-xl hover:scale-[1.001]">
      <CardHeader className="flex items-start justify-between gap-3 p-4">
        {/* Left: Avatar + Username */}
        <div className="flex justify-between items-center w-full">
          {/* Left side: Avatar + user info */}
          <div className="flex items-center gap-3">
            <Link
              href={`/profile/${post.user.id}`}
              className="cursor-pointer"
              onClick={() => console.log(`[Profile Click] Avatar clicked for userId: ${post.user.id}`)}>
              <Avatar>
                {/* <AvatarFallback>{post.user.email[0]?.toUpperCase()}</AvatarFallback> */}
                <AvatarFallback> {post.user.email ? post.user.email[0].toUpperCase() : "?"}</AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex flex-col">
              <Link
                href={`/profile/${post.user.id}`}
                className="text-sm font-semibold cursor-pointer hover:underline transition-transform duration-200 ease-in-out transform origin-top active:scale-95"
                onClick={() => console.log(`[Profile Click] Username clicked for userId: ${post.user.id}`)} >
                {renderUser(post.user)}
              </Link>
              <p className="text-xs text-muted-foreground">
                {post.time ?? new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <FollowButton userId={post.user.id} />
          </div>
        </div>
      </CardHeader>


      {/* Post Content below */}
      <CardContent className="text-sm italic mt-1">{post.content}</CardContent>

      {post.images?.length ? (
        <div className="relative w-full h-[300px]">
          <Image
            src={post.images?.[activeIndex] || ""} // Ensure a valid image path
            alt="Post image"
            fill
            className="object-cover"
            loading="eager" />
          {post.images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-2">
              <Button size="default" variant="secondary" onClick={() => prevImage(post.id)} disabled={activeIndex === 0}>
                ‹
              </Button>
              <Button
                size="default"
                variant="secondary"
                onClick={() => nextImage(post.id, post.images?.length ?? 0)}
                disabled={activeIndex === (post.images?.length ?? 0) - 1} >
                ›
              </Button>
            </div>
          )}
        </div>
      ) : null}

      <CardFooter className="flex justify-around border-t">
        <LikeButton
          postId={post.id}
          initialIsLiked={isLiked} // true/false if the current user liked it
          initialLikesCount={post.likesCount || 0}  // pass the likesCount to the button
          userId={userId} /> 

        <Button variant="ghost" size="sm" onClick={handleCommentButtonClick} className="flex items-center text-gray-800 hover:text-blue-500  dark:text-white dark:hover:text-blue-500 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95">
          <MessageCircle className="h-4 w-4 mr-1 " /> Comment
        </Button>
        {/* <ShareButton /> */}
      </CardFooter>
      {isCommentSectionVisible && (
        <CommentSection postId={post.id} userId={userId} />
      )}
    </Card>
  );
};

interface User {
  id: string;
  firstName?: string;
  lastName?: string | null;
  email: string;
}

interface Post {
  id: string;
  content: string;
  images?: string[];
  createdAt: string;
  user: User;
  likesCount?: number;
  time?: string;
}

interface FetchPostsResponse {
  posts: Post[];
  hasMore: boolean;
}

const fetchPosts = async (page: number): Promise<FetchPostsResponse> => {
  try {
    const res = await authFetch(`/api/posts?page=${page}&limit=5`);
    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Expected JSON response but received HTML");
    }

    const data = await res.json();
    if (Array.isArray(data)) return { posts: data, hasMore: true };
    return { posts: data.posts || [], hasMore: data.hasMore || false };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], hasMore: false };
  }
};

export default function FeedPage() {
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [activeIndices, setActiveIndices] = useState<Record<string, number>>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [delayedLoading, setDelayedLoading] = useState(true);
  const [openPost, setOpenPost] = useState(false);
  const [isCommentSectionVisible, setIsCommentSectionVisible] = useState(false);
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);
  const { data, isLoading, isError } = useQuery<FetchPostsResponse>({
    queryKey: ["posts", page],
    queryFn: () => fetchPosts(page),
    retry: 2,
    placeholderData: (prev) => prev,
  });

  const handleSearch = async () => {
    const results = await searchUsers(query);
    console.log(" Manual search:", query);
    setSearchLoading(true);
    setUsers(results);
    setSearchLoading(false);
  };
  // const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === "Enter") handleSearch()
  // }

  useEffect(() => {
    document.title = "Feed Page | My Next JS App";
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!debouncedQuery) {
        console.log(" Clearing search results");
        setUsers([]);
        return;
      }

      console.log(" Debounced search:", debouncedQuery);
      setSearchLoading(true);
      const results = await searchUsers(debouncedQuery);
      setUsers(results);
      setSearchLoading(false);
    };
    fetchUsers();
  }, [debouncedQuery]);

  useEffect(() => {
    if (!data?.posts) return;
    setHasMore(data.hasMore);
    setAllPosts((prev) => (page === 1 ? data.posts : [...prev, ...data.posts]));
  }, [data, page]);

  useEffect(() => {
    if (!isLoading && !isError) {
      const timer = setTimeout(() => setDelayedLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isError]);

  const nextImage = (postId: string, length: number) =>
    setActiveIndices((prev) => ({ ...prev, [postId]: Math.min((prev[postId] ?? 0) + 1, length - 1) }));

  const prevImage = (postId: string) =>
    setActiveIndices((prev) => ({ ...prev, [postId]: Math.max((prev[postId] ?? 0) - 1, 0) }));

  const loadMorePosts = async () => {
    if (!hasMore) return; // stop if no more posts

    // Optional delay for smoother infinite scroll
    await new Promise((res) => setTimeout(res, 2000));

    // Increment page
    setPage((prev) => prev + 1);
  };

  const handleLike = async (postId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn(`[Like] User not logged in, cannot like post ${postId}`);
        toast("You need to be logged in to like posts.");
        return;
      }

      const token = await user.getIdToken(true);

      console.log(`[Like] Sending like/unlike request for post ${postId}...`);

      const response = await fetch("/api/posts/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          console.warn(`[Like] Not authorized to like post ${postId}`);
          toast("Please log in to like posts");
          return;
        }

        try {
          const error = await response.json();
          console.error(`[Like] Error liking post ${postId}:`, error.message);
          toast(error.message || "Error liking post");
        } catch {
          console.error(`[Like] Unknown error liking post ${postId}`);
          toast("Error liking post");
        }
        return;
      }

      const data = await response.json();
      console.log(
        `[Like] Post ${postId} ${data.liked ? "liked" : "unliked"} successfully. Total likes: ${data.likesCount}`
      );

      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (data.liked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });

      toast(data.message || (data.liked ? "Post liked" : "Post unliked"));
    } catch (error) {
      console.error(`[Like] Error processing like/unlike for post ${postId}:`, error);
      toast("Something went wrong. Please try again.");
    }
  };

  const posts = allPosts;

  const mainContent = isLoading || delayedLoading ? (
    <SkeletonLoader />
  ) : isError ? (
    <p className="text-center py-10">Something went wrong.</p>
  ) : posts.length === 0 ? (
    <p className="text-center py-10">No posts yet.</p>
  ) : (
    <InfiniteScroll
      dataLength={posts.length}
      next={loadMorePosts}
      hasMore={hasMore}
      scrollThreshold={0.9}
      loader={
        <div className="flex justify-center my-4 ">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
      endMessage={<p className="flex justify-center py-4">No more posts to show</p>} >
      {posts.map((post, index) => {
        const activeIndex = activeIndices[post.id] ?? 0;

        return (
          <FeedPost
            key={post.id + "-" + index}
            post={post}
            activeIndex={activeIndex}
            handleLike={handleLike}
            handleCommentButtonClick={() => setIsCommentSectionVisible((prev) => !prev)}
            isCommentSectionVisible={isCommentSectionVisible}
            userId={post.user.id}
            likedPosts={likedPosts}
            nextImage={nextImage}
            prevImage={prevImage} />
        );
      })}
    </InfiniteScroll>
  );
  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full flex-col">
        <header className="bg-card sticky top-0 z-55 border-b">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6">
            <Link href="/feed" className="flex items-center gap-2">
              <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
                <Image src="/logo.png" alt="Logo" width={50} height={50} className="object-cover w-full h-full scale-150" />
              </div>
              <span className="lg:text-lg font-extrabold text-black italic tracking-wider animate-pulse dark:text-slate-600"> Zentia </span>
            </Link>
            <div className="relative w-full max-w-sm">
              <SearchBar
                value={query}
                onChange={setQuery}
                onSearch={handleSearch}
                placeholder="Search users..." />

              {(query || searchLoading) && (
                <SearchSuggestions users={users} loading={searchLoading} query={query} />
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <NotificationBell />
              <ThemeDropdown trigger={<Button variant="ghost" size="icon"><Moon className="size-8 " /></Button>} />
              <Button size="sm" variant="secondary" onClick={() => setOpenPost(true)} className="transition-all duration-200 ease-in-out hover:scale-105 active:scale-95">
                New Post
              </Button>
              <ProfileDropdown trigger={<Button variant="ghost" size="icon"><Avatar><AvatarFallback>U</AvatarFallback></Avatar></Button>} />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6 sm:px-6 ">{mainContent}</main>
      </div>

      <CreatePostModal open={openPost} onClose={() => setOpenPost(false)} />
    </SidebarProvider>
  );
}



// app/profile/page.tsx
"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { fetchUserProfile, fetchMyPosts } from "../../app/api/profile-user/user";
import { useState, useEffect } from "react";
import { getAuth, getIdToken } from "firebase/auth";
import { NotificationBell } from "../../src/components/notifications/NotificationBell";
import { SidebarProvider } from "../../components/ui/sidebar";
import { CreatePostModal } from "../../src/components/posts/CreatePostModal";
import { useSearchParams } from "next/navigation";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { searchUsers } from "../../src/services/user.service";
import { useDebounce } from "../../src/lib/useDebounce";
import { useRouter } from "next/navigation";
import { Avatar } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { Moon } from "lucide-react";
import SearchSuggestions from "../../src/components/notifications/SearchSuggestions";
import ProfileDropdown from "../../components/ui/dropdown-profile";
import ProfileContent from "../../src/components/membership/profile-page/ProfileContent";
import ProfileHeader from "../../src/components/membership/profile-page/ProfileHeader";
import ProfileCard from "../../src/components/membership/profile-page/ProfileCard";
import SearchBar from "../../src/components/notifications/SearchBar";
import Loader from "../../components/ui/Loader";
import Image from "next/image";
import Link from "next/link";
import { PremiumModeToggle } from "../../components/ui/premium-mode-toggle";

interface User {
  id: string;
  firstName?: string;
  lastName?: string | null;
  email: string;
}
// interface Post {
//   id: string;
//   content: string;
//   images?: string[];
//   createdAt: string;
//   user: User;
//   likesCount?: number;
//   time?: string;
// }

interface FetchPostsResponse {
  posts: Post[];
  hasMore: boolean;
}

// -----------------------------
// Types
// -----------------------------
interface ProfileUser {
  firstName?: string;
  lastName?: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  createdAt?: string;
}

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
  user?: User;
  likesCount?: number;      // optional
  comments?: Comment[];
  commentsCount?: number;
  time?: string;
}

// -----------------------------
// Firebase Config
// -----------------------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// -----------------------------
// Helper: Merge likes & comments into posts
// -----------------------------
const mergeLikesCommentsIntoPosts = (
  posts: Post[],
  likesData: { postid: string; count: number }[],
  commentsData: { postid: string; commentid: string; content: string; userid: string; firstName: string; lastName?: string; createdAt: string }[]
) => {
  const likesMap: Record<string, number> = {};
  likesData.forEach(like => {
    likesMap[like.postid] = like.count; // <-- use actual count
  });

  const commentsMap: Record<string, Comment[]> = {};
  commentsData.forEach(comment => {
    if (!commentsMap[comment.postid]) commentsMap[comment.postid] = [];
    commentsMap[comment.postid].push({
      id: comment.commentid,
      content: comment.content,
      user: { id: comment.userid, firstName: comment.firstName, lastName: comment.lastName },
      createdAt: comment.createdAt,
    });
  });

    return posts.map(post => ({
      ...post,
      likesCount: likesMap[post.id] || 0,
      comments: commentsMap[post.id] || [],
      commentsCount: commentsMap[post.id]?.length || 0,
    }));
};

// -----------------------------
// Fetch likes & comments for posts
// -----------------------------
const fetchLikesForPosts = async (postIds: string[]) => {
  const res = await fetch(`/api/posts/like?postIds=${postIds.join(",")}`, {
    credentials: "include",
  });
  if (!res.ok) return [];
  return await res.json();
};

const fetchCommentsForPosts = async (postIds: string[]) => {
  const res = await fetch(`/api/posts/comment?postIds=${postIds.join(",")}`, {
    credentials: "include",
  });
  if (!res.ok) return [];
  return await res.json();
};

// -----------------------------
// Component
// -----------------------------
const ProfilePage = () => {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [openPost, setOpenPost] = useState(false);
   const [query, setQuery] = useState("")
  const [users, setUsers] = useState<
    { id: string | number; username: string; email: string; firstName?: string; lastName?: string }[]
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const router = useRouter();
const debouncedQuery = useDebounce(query, 400);
  
  // Determine where the user came from
  const fromPage = searchParams.get("from") || "";
  
  useEffect(() => {
  const fetchUsers = async () => {
    if (!debouncedQuery) {
      setUsers([]);
      return;
    }

    setSearchLoading(true);
    const results = await searchUsers(debouncedQuery);
    setUsers(results);
    setSearchLoading(false);
  };

  fetchUsers();
}, [debouncedQuery]);

  useEffect(() => {
    document.title = "Profile | My Next JS App";
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (loading) return;
      setLoading(true);

      try {
        const token = await getFirebaseToken();
        if (!token) {
          toast.error("Please login again. Session expired.");
          router.push("/auth/login");
          return;
        }

        const userProfile = await fetchUserProfile();
        const { posts: rawPosts, hasMore: more } = await fetchMyPosts(page);

        setUser({
          ...userProfile,
          email: userProfile.email || "unknown@example.com",
        });

        // Get post IDs
        const postIds: string[] = rawPosts.map((p: Post) => p.id);

        // Fetch likes and comments
        const likesData = await fetchLikesForPosts(postIds);
        const commentsData = await fetchCommentsForPosts(postIds);

        // Merge into posts
        const postsWithEngagement: Post[] = mergeLikesCommentsIntoPosts(
          rawPosts,
          likesData,
          commentsData
        );

        setPosts(prev => (page === 1 ? postsWithEngagement : [...prev, ...postsWithEngagement]));
        setHasMore(more);
      } catch (error) {
        console.error("[ProfilePage] Error fetching profile/posts:", error);
        toast.error("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [page]);

  const getFirebaseToken = async (): Promise<string | null> => {
    try {
      const auth = getAuth(app);
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      return await getIdToken(currentUser, true);
    } catch (error) {
      console.error("Error getting Firebase token:", error);
      return null;
    }
  };

  const handleSearch = async () => {
    console.log(" Manual search:", query);
    setSearchLoading(true);
    const results = await searchUsers(query);

    setUsers(results);
    setSearchLoading(false);
  };

  const handleEditProfile = () => router.push("/profile/edit");

  if (!user) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader 
        title="Loading profile..." 
        subtitle="Fetching your account details" 
        size="lg" 
      />
    </div>
  );
}

const loadMorePosts = async () => {
  if (!loading && hasMore) {
    setPage(prev => prev + 1);
    setLoading(true);
    // Your existing logic here
    setLoading(false);
  }
};


  return (
  <SidebarProvider>
    <div className="flex min-h-dvh w-full flex-col bg-[#F8FAFC] dark:bg-zinc-950">

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-b border-gray-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-8xl items-center justify-between gap-6 px-4 py-3 sm:px-6">

          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-700">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            </div>
            <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Zentia
            </span>
          </Link>

          {/* Search */}
          <div className="relative w-full max-w-md hidden sm:block">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={handleSearch}
              placeholder="Search the universe..."
            />

            {(query || searchLoading) && (
              <SearchSuggestions
                users={users}
                loading={searchLoading}
                query={query}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />
            <PremiumModeToggle/>

            <Button
              size="sm"
              onClick={() => setOpenPost(true)}
              className="rounded-full px-4 bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-all duration-200 active:scale-95"
            >
              New Post
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-3 sm:hidden">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            placeholder="Search users..."
          />

          {(query || searchLoading) && (
            <SearchSuggestions
              users={users}
              loading={searchLoading}
              query={query}
            />
          )}
        </div>
      </header>

      {/* MAIN */}
<main className="flex-1 mt-4">
  <div className="min-h-screen bg-slate-100 text-gray-900 dark:bg-zinc-950">
    
    {/* FULL WIDTH CONTAINER */}
    <div className="w-full px-10 py-10 space-y-6">

      {/* Profile Section (BIG HEADER STYLE) */}
      <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 rounded-3xl shadow-xl p-8">
        <ProfileHeader
          user={user}
          onEdit={handleEditProfile}
          showEditButton
        />
      </div>

      {/* Posts Section */}
      <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 rounded-3xl shadow-xl p-8">
        <ProfileCard
          posts={posts}
          hasMore={hasMore}
          loadMore={loadMorePosts}
        />
      </div>

    </div>
  </div>
</main>

      {/* Modal */}
      <CreatePostModal
        open={openPost}
        onClose={() => setOpenPost(false)}
      />
    </div>
  </SidebarProvider>
);

};

export default ProfilePage;